import { NextRequest, NextResponse } from "next/server";
import { getResourceById } from "../../../../../lib/actions/resource.action";

export async function GET(
  req: NextRequest,
  { params }: { params: { resourceId: string } }
) {
  try {
    const resourceId = params.resourceId;
    
    if (!resourceId) {
      return NextResponse.json(
        { error: "Resource ID is required" },
        { status: 400 }
      );
    }

    const result = await getResourceById(resourceId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch resource" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error(`Error fetching resource with ID ${params.resourceId}:`, error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
