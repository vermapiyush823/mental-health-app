import { NextRequest } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongoose';
import CommunityChat from '../../../../../database/models/community_chat';

// This needs to be dynamic to keep the connection alive
export const dynamic = 'force-dynamic';
// Set maxDuration to 60 seconds (maximum allowed for Vercel Hobby plan)
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  console.log('New SSE connection request received');
  
  // Initialize MongoDB connection
  await connectToDatabase();
  
  // Store last checked timestamp
  let lastCheckedTime = new Date();
  
  // Create variables for intervals outside of the stream to reference them later
  let pollInterval: NodeJS.Timeout | null = null;
  let pingInterval: NodeJS.Timeout | null = null;
  
  const stream = new ReadableStream({
    async start(controller) {
      console.log('New SSE client connected');
      
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connection', data: { status: 'connected' } })}\n\n`));
      
      // Fetch initial messages for context
      try {
        const recentMessages = await CommunityChat.find({})
          .sort({ createdAt: -1 })
          .limit(15)
          .lean();
        
        if (recentMessages.length > 0) {
          console.log(`Sending ${recentMessages.length} recent messages to new client`);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'messages', data: recentMessages.reverse() })}\n\n`));
        }
      } catch (error) {
        console.error('Error fetching initial messages:', error);
      }
      
      // Set up polling for new messages
      pollInterval = setInterval(async () => {
        try {
          // Poll for new messages since last check
          const newMessages = await CommunityChat.find({
            createdAt: { $gt: lastCheckedTime }
          })
          .sort({ createdAt: 1 })
          .lean();
          
          if (newMessages.length > 0) {
            console.log(`Found ${newMessages.length} new messages to broadcast`);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'newMessages', data: newMessages })}\n\n`));
            
            // Update last checked time to the most recent message time
            lastCheckedTime = new Date(Math.max(...newMessages.map(msg => new Date(msg.createdAt).getTime())));
          }
        } catch (error) {
          console.error('Error polling for new messages:', error);
        }
      }, 2000); // Poll every 2 seconds
      
      // Add a dedicated ping interval to keep the connection alive
      pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (err) {
          // If we can't send a ping, the connection is likely dead
          if (pingInterval) clearInterval(pingInterval);
          if (pollInterval) clearInterval(pollInterval);
        }
      }, 30000); // Send ping every 30 seconds
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
    },
  });
}

// Text encoder for sending data
const encoder = new TextEncoder();