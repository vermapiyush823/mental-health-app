import { NextRequest, NextResponse } from "next/server";
import { addCommunityMessage } from "../../../../../lib/actions/communityChat.action";
import { broadcastMessage } from "../../../../../lib/communityChat";

export async function POST(req: NextRequest) {
  try {
    const { userId, message } = await req.json();
    
    if (!userId || !message) {
      return NextResponse.json(
        { error: "User ID and message are required" },
        { status: 400 }
      );
    }
    
    const newMessage = await addCommunityMessage(userId, message);
    
    // Broadcast the new message via EventBus
    try {
      broadcastMessage('newMessage', newMessage);
      console.log('Message broadcasted via EventBus:', newMessage._id);
    } catch (broadcastError) {
      console.error("Broadcasting error (non-fatal):", broadcastError);
    }
    
    return NextResponse.json(
      { success: true, data: newMessage },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding community message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add community message" },
      { status: 500 }
    );
  }
}