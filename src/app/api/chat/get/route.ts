import { NextRequest, NextResponse } from "next/server";
import { getUserChatHistory } from "../../../../../lib/actions/chatHistoy.action";

export async function GET(req: NextRequest) {
  try {
    // Get userId from query parameters
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Get chat history for the user
    const chatHistory = await getUserChatHistory(userId);
    
    if (!chatHistory) {
      return NextResponse.json(
        { message: "No chat history found for this user" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: chatHistory },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
