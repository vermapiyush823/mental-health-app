import { NextRequest, NextResponse } from "next/server";
import { getCommunityMessages } from "../../../../lib/actions/communityChat.action";

export const dynamic = 'force-dynamic'; // Don't cache this route
export const maxDuration = 10; // Set a low timeout (in seconds) for Vercel

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    // Reduce default limit to prevent timeouts
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 30);
    const skip = parseInt(searchParams.get("skip") || "0");
    
    // Add a timeout promise to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 8000); // 8 second timeout
    });
    
    // Race the actual data fetch against the timeout
    const messagesPromise = getCommunityMessages(limit, skip);
    const messages = await Promise.race([messagesPromise, timeoutPromise]) as any;
    
    return NextResponse.json(
      { success: true, data: messages },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching community messages:", error);
    
    // Provide a more specific error message based on the error type
    const errorMessage = error.message === 'Request timed out' 
      ? 'Request took too long to complete. Try refreshing or reducing the limit parameter.'
      : error.message || "Failed to fetch community messages";
      
    return NextResponse.json(
      { error: errorMessage },
      { status: error.message === 'Request timed out' ? 408 : 500 }
    );
  }
}