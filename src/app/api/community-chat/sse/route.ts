import { NextRequest } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongoose';
import CommunityChat from '../../../../../database/models/community_chat';

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
  
  // Create variables for intervals outside of the stream to reference them later
  let pollInterval: NodeJS.Timeout | null = null;
  let pingInterval: NodeJS.Timeout | null = null;
  
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
      
      // Add a dedicated ping interval to keep the connection alive
      // Less frequent pings for mobile to reduce battery usage
      pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (err) {
          // If we can't send a ping, the connection is likely dead
          if (pingInterval) clearInterval(pingInterval);
          if (pollInterval) clearInterval(pollInterval);
        }
      }, isMobile ? 45000 : 30000); // 45 seconds for mobile, 30 for desktop
    },
    
    cancel() {
      // Clear intervals
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
      
      console.log('Client disconnected, cleaned up polling');
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