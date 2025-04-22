import { NextRequest, NextResponse } from "next/server";
import { getCommunityMessages } from "../../../../lib/actions/communityChat.action";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");
    
    const messages = await getCommunityMessages(limit, skip);
    
    return NextResponse.json(
      { success: true, data: messages },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching community messages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch community messages" },
      { status: 500 }
    );
  }
}