import { NextRequest, NextResponse } from "next/server";
import { deleteMessage } from "../../../../../lib/actions/communityChat.action";
import { broadcastMessage } from "../../../../../lib/communityChat";

export async function DELETE(req: NextRequest) {
  try {
    const { userId, messageId } = await req.json();
    
    if (!userId || !messageId) {
      return NextResponse.json(
        { error: "User ID and message ID are required" },
        { status: 400 }
      );
    }
    
    const result = await deleteMessage(userId, messageId);
    
    // Broadcast the deletion via EventBus - retry logic for production reliability
    const broadcastWithRetry = async (attempts = 0) => {
      try {
        // Use a consistent format for deletion events
        broadcastMessage('deleteMessage', { messageId });
        console.log('Message deletion broadcasted via EventBus:', messageId);
        
        // Send a second broadcast after a delay for redundancy
        setTimeout(() => {
          try {
            broadcastMessage('deleteMessage', { messageId });
            console.log('Redundant message deletion broadcasted via EventBus:', messageId);
          } catch (error) {
            console.error("Error in redundant broadcast:", error);
          }
        }, 300);
        
        return true;
      } catch (broadcastError) {
        console.error(`Broadcasting error (attempt ${attempts + 1}/3):`, broadcastError);
        
        // Retry up to 2 more times with exponential backoff
        if (attempts < 2) {
          const delay = Math.pow(2, attempts) * 100; // 100ms, 200ms
          await new Promise(resolve => setTimeout(resolve, delay));
          return broadcastWithRetry(attempts + 1);
        }
        
        console.error("Broadcasting ultimately failed after retries");
        return false;
      }
    };
    
    // Attempt broadcast but don't wait for it to complete the response
    broadcastWithRetry();
    
    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting community message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete community message" },
      { status: 500 }
    );
  }
}