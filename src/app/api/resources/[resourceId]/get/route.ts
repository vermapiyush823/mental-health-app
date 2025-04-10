import { NextRequest, NextResponse } from "next/server";
import { getResourceById } from "../../../../../../lib/actions/resource.action";

type Props = {
  params: {
    resourceId: string;
  };
};

export async function GET(
  req: NextRequest,
  { params }: Props
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
    
    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error("Error fetching resource by ID:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resource" },
      { status: 500 }
    );
  }
}