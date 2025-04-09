import { NextRequest, NextResponse } from "next/server";
import { getAllResources } from "../../../../../lib/actions/resource.action";

export async function GET(req: NextRequest) {
  try {
    const result = await getAllResources();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch resources" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}