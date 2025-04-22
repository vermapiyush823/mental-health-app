import { NextRequest } from 'next/server';
import { eventBus } from '../../../../../lib/communityChat';

// This needs to be dynamic to keep the connection alive
export const dynamic = 'force-dynamic';
// Increase the default response size limit
export const maxDuration = 300; // 5 minutes

export async function GET(request: NextRequest) {
  console.log('New SSE connection request received');
  
  // Create a variable to store unsubscribe functions
  let unsubscribers: (() => void)[] = [];
  
  // Create a variable to store the ping interval
  let pingInterval: NodeJS.Timeout | null = null;
  
  const stream = new ReadableStream({
    start(controller) {
      console.log('New SSE client connected');
      
      // Add a dedicated ping interval to keep the connection alive
      pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (err) {
          // If we can't send a ping, the connection is likely dead
          if (pingInterval) clearInterval(pingInterval);
        }
      }, 30000); // Send ping every 30 seconds
      
      // Function to handle messages from the event bus
      const messageHandler = (message: any) => {
        try {
          // Format the message data for SSE
          const eventData = JSON.stringify(message);
          controller.enqueue(encoder.encode(`data: ${eventData}\n\n`));
        } catch (error) {
          console.error('Error sending message to client:', error);
        }
      };
      
      // Set up subscriptions
      const newMessageUnsub = eventBus.subscribe('newMessage', (message) => {
        messageHandler({ type: 'newMessage', data: message });
      });
      
      const deleteMessageUnsub = eventBus.subscribe('deleteMessage', (message) => {
        messageHandler({ type: 'deleteMessage', data: message });
      });
      
      // Store unsubscribe functions for cleanup
      unsubscribers = [newMessageUnsub, deleteMessageUnsub];
      
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connection', data: { status: 'connected' } })}\n\n`));
      
      // Send recent messages to the new client
      const recentMessages = eventBus.getRecentMessages();
      if (recentMessages.length > 0) {
        console.log(`Sending ${recentMessages.length} recent messages to new client`);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'messages', data: recentMessages })}\n\n`));
      }
    },
    
    cancel() {
      // Clear ping interval
      if (pingInterval) {
        clearInterval(pingInterval);
      }
      
      // Cleanup subscriptions when client disconnects
      unsubscribers.forEach(unsub => unsub());
      console.log('Client disconnected, cleaned up subscriptions');
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