import { NextRequest, NextResponse } from "next/server";
import { addChatHistory } from "../../../../../lib/actions/chatHistoy.action";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { userId,oldChatId, userMessages, chatbotMessages, startDate, startTime } = body;
    
    // Validate required fields
    if (!userId || !userMessages || !chatbotMessages || !startDate || !startTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    console.log("oldChatId",oldChatId);
    const chatId = oldChatId===''? Math.random().toString(36).substring(7):oldChatId;
    console.log("chatId",chatId);
    // Add chat history
    const chatHistory = await addChatHistory({
      userId,
      chatId,
      userMessages,
      chatbotMessages,
      startDate: new Date(startDate),
      startTime
    });
    
    return NextResponse.json(
      { success: true, data: chatHistory },
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
