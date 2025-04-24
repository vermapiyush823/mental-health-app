import { NextRequest } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongoose';
import CommunityChat from '../../../../../database/models/community_chat';
import { eventBus } from '../../../../../lib/communityChat';

// This needs to be dynamic to keep the connection alive
export const dynamic = 'force-dynamic';
// Set maxDuration to 60 seconds (maximum allowed for Vercel Hobby plan)
export const maxDuration = 60;

// Define different polling rates for different devices
const MOBILE_POLL_RATE = 3500; // 3.5 seconds for mobile
const DESKTOP_POLL_RATE = 2000; // 2 seconds for desktop

export async function GET(request: NextRequest) {
  console.log('New SSE connection request received');
  
  // Initialize MongoDB connection
  await connectToDatabase();
  
  // Detect if user is on mobile
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Set polling rate based on device type
  const pollRate = isMobile ? MOBILE_POLL_RATE : DESKTOP_POLL_RATE;
  console.log(`Client detected as ${isMobile ? 'mobile' : 'desktop'}, setting poll rate to ${pollRate}ms`);
  
  // Store last checked timestamp
  let lastCheckedTime = new Date();
  
  // Keep track of deleted message IDs for resilient deletion
  let recentlyDeletedIds = new Set<string>();
  
  // Create variables for intervals outside of the stream to reference them later
  let pollInterval: NodeJS.Timeout | null = null;
  let pingInterval: NodeJS.Timeout | null = null;
  let deletionCheckInterval: NodeJS.Timeout | null = null;
  
  const stream = new ReadableStream({
    async start(controller) {
      console.log('New SSE client connected');
      
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connection', data: { status: 'connected', isMobile } })}\n\n`));
      
      // Fetch initial messages for context - fewer messages for mobile
      try {
        const limit = isMobile ? 10 : 15;
        const recentMessages = await CommunityChat.find({})
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();
        
        if (recentMessages.length > 0) {
          console.log(`Sending ${recentMessages.length} recent messages to new client`);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'messages', data: recentMessages.reverse() })}\n\n`));
        }
      } catch (error) {
        console.error('Error fetching initial messages:', error);
      }
      
      // Subscribe to message deletions from EventBus
      const unsubscribeDelete = eventBus.subscribe('deleteMessage', (data) => {
        try {
          // Handle multiple possible data structures for better compatibility
          let messageData;
          let messageId = null;
          
          if (typeof data === 'string') {
            // If it's just a string ID
            messageId = data;
            messageData = { messageId: data };
          } else if (data && typeof data === 'object') {
            // Ensure we have a consistent structure regardless of input format
            messageId = data.messageId || (data.data && data.data.messageId) || data._id || data.id;
            
            if (!messageId) {
              console.error('SSE: Invalid deletion data format - no messageId found:', data);
              return;
            }
            
            messageData = { messageId };
          } else {
            console.error('SSE: Invalid deletion data format:', data);
            return;
          }
          
          // Add to our set of recently deleted messages
          if (messageId) {
            recentlyDeletedIds.add(messageId.toString());
          }

          console.log('SSE: Sending deleteMessage event to client:', messageData);
          
          // Use a more reliable message format for deletion events
          const message = JSON.stringify({ 
            type: 'deleteMessage', 
            data: messageData,
            timestamp: Date.now() // Add timestamp to help prevent caching issues
          });
          
          // Send deletion event multiple times to ensure delivery
          // First immediate message
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
          
          // Second redundant message after a small delay (production reliability)
          setTimeout(() => {
            try {
              controller.enqueue(encoder.encode(`data: ${message}\n\n`));
            } catch (error) {
              console.error('Error sending delayed deletion event:', error);
            }
          }, 500);
          
          // Third message with an even longer delay as a last resort
          setTimeout(() => {
            try {
              controller.enqueue(encoder.encode(`data: ${message}\n\n`));
            } catch (error) {
              console.error('Error sending final deletion event:', error);
            }
          }, 1500);
          
        } catch (error) {
          console.error('Error sending deletion event to client:', error);
        }
      });
      
      // Subscribe to new messages from EventBus
      const unsubscribeNew = eventBus.subscribe('newMessage', (data) => {
        try {
          console.log('EventBus: Broadcasting new message:', data);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'newMessage', data })}\n\n`));
        } catch (error) {
          console.error('Error sending new message event to client:', error);
        }
      });
      
      // Set up polling for new messages with optimized query
      pollInterval = setInterval(async () => {
        try {
          // Poll for new messages since last check with optimized projection
          const newMessages = await CommunityChat.find(
            { createdAt: { $gt: lastCheckedTime } },
            // Only select the fields we need
            { userId: 1, username: 1, userImage: 1, message: 1, createdAt: 1 }
          )
          .sort({ createdAt: 1 })
          .lean();
          
          if (newMessages.length > 0) {
            console.log(`Found ${newMessages.length} new messages to broadcast`);
            
            // For mobile, batch messages to reduce overhead
            if (isMobile && newMessages.length > 3) {
              // Send only the latest 3 messages to mobile clients when there are many
              const latestMessages = newMessages.slice(-3);
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ type: 'newMessages', data: latestMessages, count: newMessages.length })}\n\n`
              ));
            } else {
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ type: 'newMessages', data: newMessages })}\n\n`
              ));
            }
            
            // Update last checked time to the most recent message time
            lastCheckedTime = new Date(Math.max(...newMessages.map(msg => new Date(msg.createdAt).getTime())));
          }
        } catch (error) {
          console.error('Error polling for new messages:', error);
        }
      }, pollRate);
      
      // Add a dedicated interval to check for deleted messages
      // This helps with deletion reliability in production
      deletionCheckInterval = setInterval(async () => {
        try {
          if (recentlyDeletedIds.size > 0) {
            // Remind clients about deleted messages periodically
            // This helps ensure clients that missed the events still get updated
            const deletedIds = Array.from(recentlyDeletedIds);
            
            // Send a reminder for each deleted ID
            for (const id of deletedIds) {
              try {
                const reminderMessage = JSON.stringify({
                  type: 'deleteMessage',
                  data: { messageId: id },
                  timestamp: Date.now(),
                  reminder: true
                });
                
                controller.enqueue(encoder.encode(`data: ${reminderMessage}\n\n`));
                console.log(`Sent deletion reminder for message ID: ${id}`);
              } catch (reminderError) {
                console.error('Error sending deletion reminder:', reminderError);
              }
            }
            
            // Clear old deleted IDs after a while (keep for 1 minute)
            if (deletedIds.length > 25) {
              // Only keep the 25 most recent deletion IDs to prevent memory growth
              recentlyDeletedIds = new Set(deletedIds.slice(-25));
            }
          }
        } catch (error) {
          console.error('Error in deletion check interval:', error);
        }
      }, 10000); // Check every 10 seconds
      
      // Add a dedicated ping interval to keep the connection alive
      // Less frequent pings for mobile to reduce battery usage
      pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (err) {
          // If we can't send a ping, the connection is likely dead
          if (pingInterval) clearInterval(pingInterval);
          if (pollInterval) clearInterval(pollInterval);
          if (deletionCheckInterval) clearInterval(deletionCheckInterval);
        }
      }, isMobile ? 45000 : 30000); // 45 seconds for mobile, 30 for desktop
      
      // Store the unsubscribe functions for cleanup
      const unsubscribeFunctions = [unsubscribeDelete, unsubscribeNew];
      
      // Store unsubscribe functions on the controller for cleanup
      (controller as any).unsubscribeFunctions = unsubscribeFunctions;
    },
    
    cancel() {
      // Clean up event bus subscriptions
      const unsubscribeFunctions = (this as any).unsubscribeFunctions;
      if (Array.isArray(unsubscribeFunctions)) {
        unsubscribeFunctions.forEach(unsubscribe => {
          if (typeof unsubscribe === 'function') {
            try {
              unsubscribe();
            } catch (error) {
              console.error('Error unsubscribing from EventBus:', error);
            }
          }
        });
      }
      
      // Clear intervals
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
      
      if (deletionCheckInterval) {
        clearInterval(deletionCheckInterval);
        deletionCheckInterval = null;
      }
      
      console.log('Client disconnected, cleaned up polling and subscriptions');
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Prevents Nginx from buffering the response
      'Access-Control-Allow-Origin': '*', // Allow CORS for SSE
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Transfer-Encoding': 'chunked' // Enables chunked transfer for better mobile performance
    },
  });
}

// Text encoder for sending data
const encoder = new TextEncoder();