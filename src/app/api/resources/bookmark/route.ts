import { NextRequest, NextResponse } from "next/server";
import { toggleBookmark, getBookmarkStatus } from "../../../../../lib/actions/resource.action";

export async function POST(request: NextRequest) {
  try {
    const { resourceId, userId } = await request.json();
    console.log("Received data:", { resourceId, userId });
    if (!resourceId || !userId) {
      return NextResponse.json(
        { success: false, error: "Resource ID and User ID are required" },
        { status: 400 }
      );
    }
    
    const result = await toggleBookmark(resourceId, userId);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === "Resource not found" ? 404 : 500 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error toggling bookmark:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to toggle bookmark status" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const resourceId = url.searchParams.get("resourceId");
    const userId = url.searchParams.get("userId");
    
    if (!resourceId || !userId) {
      return NextResponse.json(
        { success: false, error: "Resource ID and User ID are required" },
        { status: 400 }
      );
    }
    
    const result = await getBookmarkStatus(resourceId, userId);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === "Resource not found" ? 404 : 500 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error checking bookmark status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to check bookmark status" },
      { status: 500 }
    );
  }
}