import { NextRequest, NextResponse } from "next/server";
import { addChatHistory } from "../../../../../lib/actions/chatHistoy.action";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { userId, oldChatId, userMessages, chatbotMessages, startDate, startTime } = body;
    
    // Validate required fields
    if (!userId || !userMessages || !chatbotMessages || !startDate || !startTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Trust the client-provided chatId
    const chatId = oldChatId;
    
    // Ensure chatId is present
    if (!chatId) {
      return NextResponse.json(
        { error: "ChatId is required" },
        { status: 400 }
      );
    }
    
    // Add chat history
    const result = await addChatHistory({
      userId,
      chatId,
      userMessages,
      chatbotMessages,
      startDate: new Date(startDate),
      startTime
    });
    
    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error("Error in chat add API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save chat history" },
      { status: 500 }
    );
  }
}