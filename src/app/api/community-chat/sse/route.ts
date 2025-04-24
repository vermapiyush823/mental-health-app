import { NextRequest } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongoose';
import CommunityChat from '../../../../../database/models/community_chat';
import { eventBus } from '../../../../../lib/communityChat';
import { isRedisConfigured, getSubscriber, REDIS_CHANNELS } from '../../../../../lib/redis';

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
  
  // Variable to keep track of Redis subscription cleanup
  let redisCleanupNeeded = false;
  
  // Track if controller is closed to prevent "Controller is already closed" errors
  let isControllerClosed = false;
  
  const stream = new ReadableStream({
    async start(controller) {
      console.log('New SSE client connected');
      
      // Safe enqueue function that checks if controller is closed
      const safeEnqueue = (data: string) => {
        if (isControllerClosed) {
          return false;
        }
        
        try {
          controller.enqueue(encoder.encode(data));
          return true;
        } catch (error: any) {
          if (error.code === 'ERR_INVALID_STATE') {
            console.log('Controller is closed, marking as closed');
            isControllerClosed = true;
            return false;
          }
          console.error('Error enqueueing data:', error);
          return false;
        }
      };
      
      // Send initial connection message
      safeEnqueue(`data: ${JSON.stringify({ type: 'connection', data: { status: 'connected', isMobile } })}\n\n`);
      
      // Fetch initial messages for context - fewer messages for mobile
      try {
        const limit = isMobile ? 10 : 15;
        const recentMessages = await CommunityChat.find({})
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();
        
        if (recentMessages.length > 0) {
          console.log(`Sending ${recentMessages.length} recent messages to new client`);
          safeEnqueue(`data: ${JSON.stringify({ type: 'messages', data: recentMessages.reverse() })}\n\n`);
        }
      } catch (error) {
        console.error('Error fetching initial messages:', error);
      }
      
      // Function to handle deletion events (used by both Redis and EventBus)
      const handleDeletionEvent = (data: any) => {
        try {
          // If controller is closed, don't proceed
          if (isControllerClosed) {
            return;
          }
          
          // Handle multiple possible data structures for better compatibility
          let messageData;
          let messageId = null;
          
          if (typeof data === 'string') {
            // If it's just a string ID
            messageId = data;
            messageData = { messageId: data };
          } else if (data && typeof data === 'object') {
            // Extract from different possible structures
            if (data.data && typeof data.data === 'object') {
              // Redis format: { type, data: { messageId }, timestamp }
              messageId = data.data.messageId;
              messageData = data.data;
            } else {
              // Direct format: { messageId }
              messageId = data.messageId || data._id || data.id;
              messageData = { messageId };
            }
            
            if (!messageId) {
              console.error('SSE: Invalid deletion data format - no messageId found:', data);
              return;
            }
          } else {
            console.error('SSE: Invalid deletion data format:', data);
            return;
          }
          
          // Add to our set of recently deleted messages
          if (messageId) {
            recentlyDeletedIds.add(messageId.toString());
          }

          console.log('SSE: Sending deleteMessage event to client:', messageData);
          
          // Use a reliable message format for deletion events
          const message = JSON.stringify({ 
            type: 'deleteMessage', 
            data: { messageId: messageId.toString() },
            timestamp: Date.now()
          });
          
          // Send deletion event multiple times to ensure delivery
          // First immediate message - only if controller is still active
          if (!safeEnqueue(`data: ${message}\n\n`)) {
            return; // Exit if controller closed
          }
          
          // Second redundant message after delay
          setTimeout(() => {
            try {
              safeEnqueue(`data: ${message}\n\n`);
            } catch (error) {
              console.error('Error sending delayed deletion event:', error);
            }
          }, 500);
        } catch (error) {
          console.error('Error handling deletion event:', error);
        }
      };
      
      // Function to handle new message events (used by both Redis and EventBus)
      const handleNewMessageEvent = (data: any) => {
        try {
          // Skip if controller is closed
          if (isControllerClosed) {
            return;
          }
          
          console.log('Broadcasting new message to client:', data);
          safeEnqueue(`data: ${JSON.stringify({ type: 'newMessage', data })}\n\n`);
        } catch (error) {
          console.error('Error sending new message event to client:', error);
        }
      };
      
      // Set up Redis subscriptions if Redis is configured (for production)
      let redisSubscriber: any = null;
      if (isRedisConfigured()) {
        try {
          redisSubscriber = getSubscriber();
          redisCleanupNeeded = true;
          
          // Subscribe to Redis channels
          redisSubscriber.subscribe(REDIS_CHANNELS.NEW_MESSAGE, REDIS_CHANNELS.DELETE_MESSAGE);
          console.log('Subscribed to Redis channels for real-time updates');
          
          // Handle Redis messages
          redisSubscriber.on('message', (channel: string, message: string) => {
            // Skip processing if controller is closed
            if (isControllerClosed) {
              return;
            }
            
            try {
              const data = JSON.parse(message);
              console.log(`Redis message received on channel ${channel}:`, data);
              
              if (channel === REDIS_CHANNELS.DELETE_MESSAGE) {
                handleDeletionEvent(data);
              } else if (channel === REDIS_CHANNELS.NEW_MESSAGE) {
                handleNewMessageEvent(data.data);
              }
            } catch (error) {
              console.error('Error handling Redis message:', error);
            }
          });
        } catch (redisError) {
          console.error('Failed to set up Redis subscriber:', redisError);
          // Fall back to in-memory EventBus if Redis fails
        }
      }
      
      // Always set up EventBus subscriptions as backup or for local development
      // Subscribe to message deletions from EventBus
      const unsubscribeDelete = eventBus.subscribe('deleteMessage', (data) => {
        // Skip if controller is closed
        if (isControllerClosed) {
          return;
        }
        
        // Skip if the event came through Redis to avoid duplicate processing
        if (isRedisConfigured() && redisSubscriber) {
          return;
        }
        
        handleDeletionEvent(data);
      });
      
      // Subscribe to new messages from EventBus
      const unsubscribeNew = eventBus.subscribe('newMessage', (data) => {
        // Skip if controller is closed
        if (isControllerClosed) {
          return;
        }
        
        // Skip if the event came through Redis to avoid duplicate processing
        if (isRedisConfigured() && redisSubscriber) {
          return;
        }
        
        handleNewMessageEvent(data);
      });
      
      // Set up polling for new messages with optimized query
      pollInterval = setInterval(async () => {
        // Skip if controller is closed
        if (isControllerClosed) {
          clearInterval(pollInterval!);
          pollInterval = null;
          return;
        }
        
        try {
          // Poll for new messages since last check with optimized projection
          const newMessages = await CommunityChat.find(
            { createdAt: { $gt: lastCheckedTime } },
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
              safeEnqueue(
                `data: ${JSON.stringify({ type: 'newMessages', data: latestMessages, count: newMessages.length })}\n\n`
              );
            } else {
              safeEnqueue(
                `data: ${JSON.stringify({ type: 'newMessages', data: newMessages })}\n\n`
              );
            }
            
            // Update last checked time to the most recent message time
            lastCheckedTime = new Date(Math.max(...newMessages.map(msg => new Date(msg.createdAt).getTime())));
          }
        } catch (error) {
          console.error('Error polling for new messages:', error);
        }
      }, pollRate);
      
      // Add a dedicated interval to check for deleted messages
      deletionCheckInterval = setInterval(async () => {
        // Skip if controller is closed
        if (isControllerClosed) {
          clearInterval(deletionCheckInterval!);
          deletionCheckInterval = null;
          return;
        }
        
        try {
          if (recentlyDeletedIds.size > 0) {
            // Remind clients about deleted messages periodically
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
                
                if (!safeEnqueue(`data: ${reminderMessage}\n\n`)) {
                  break; // Stop processing if controller is closed
                }
                
                console.log(`Sent deletion reminder for message ID: ${id}`);
              } catch (reminderError) {
                console.error('Error sending deletion reminder:', reminderError);
              }
              
              // If controller was closed during the loop, exit
              if (isControllerClosed) {
                break;
              }
            }
            
            // Keep list manageable
            if (deletedIds.length > 25) {
              recentlyDeletedIds = new Set(deletedIds.slice(-25));
            }
          }
        } catch (error) {
          console.error('Error in deletion check interval:', error);
        }
      }, 10000); // Check every 10 seconds
      
      // Add ping interval to keep connection alive
      pingInterval = setInterval(() => {
        // Skip if controller is closed
        if (isControllerClosed) {
          clearInterval(pingInterval!);
          pingInterval = null;
          return;
        }
        
        try {
          if (!safeEnqueue(`: ping\n\n`)) {
            // If enqueueing fails, clean up
            if (pingInterval) clearInterval(pingInterval);
            if (pollInterval) clearInterval(pollInterval);
            if (deletionCheckInterval) clearInterval(deletionCheckInterval);
          }
        } catch (err) {
          // If ping fails, connection is likely dead - clean up
          isControllerClosed = true;
          if (pingInterval) clearInterval(pingInterval);
          if (pollInterval) clearInterval(pollInterval);
          if (deletionCheckInterval) clearInterval(deletionCheckInterval);
        }
      }, isMobile ? 45000 : 30000);
      
      // Store cleanup functions
      const unsubscribeFunctions = [unsubscribeDelete, unsubscribeNew];
      (controller as any).unsubscribeFunctions = unsubscribeFunctions;
      (controller as any).redisSubscriber = redisSubscriber;
      
      // Store a reference to isControllerClosed for use in cancel()
      (controller as any).isControllerClosed = isControllerClosed;
    },
    
    cancel() {
      // Mark controller as closed
      isControllerClosed = true;
      if ((this as any).isControllerClosed !== undefined) {
        (this as any).isControllerClosed = true;
      }
      
      // Clean up EventBus subscriptions
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
      
      // Clean up Redis subscriptions
      if (redisCleanupNeeded) {
        const redisSubscriber = (this as any).redisSubscriber;
        if (redisSubscriber) {
          try {
            redisSubscriber.unsubscribe(REDIS_CHANNELS.NEW_MESSAGE, REDIS_CHANNELS.DELETE_MESSAGE);
            console.log('Unsubscribed from Redis channels');
          } catch (error) {
            console.error('Error unsubscribing from Redis channels:', error);
          }
        }
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