import { NextRequest, NextResponse } from "next/server";
import { getResourcesByCategory } from "../../../../../../lib/actions/resource.action";

export async function GET(req: NextRequest, { params }: { params: { category: string } }) {
  try {
    const category = params.category;
    
    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }
    
    const result = await getResourcesByCategory(category);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch resources by category" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result.data, { status: 200 });
  } catch (error: any) {
    console.error("Error in resources by category GET API:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}