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
    
    // Broadcast the deletion via EventBus
    try {
      // Make sure messageId is directly accessible in the object as expected by SSE handler
      broadcastMessage('deleteMessage', { messageId: messageId });
      console.log('Message deletion broadcasted via EventBus:', messageId);
    } catch (broadcastError) {
      console.error("Broadcasting error (non-fatal):", broadcastError);
    }
    
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