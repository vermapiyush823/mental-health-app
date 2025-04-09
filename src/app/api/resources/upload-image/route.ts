import { updateResourceImage } from "../../../../../lib/actions/resource.action";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file");
    const resourceId = data.get("resourceId");

    if (!file || !resourceId) {
      return NextResponse.json(
        { error: "Missing file or resource ID" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bufferData = await (file as File).arrayBuffer();
    const buffer = Buffer.from(bufferData);
    
    // Update the resource image
    const result = await updateResourceImage(
      resourceId.toString(),
      buffer,
      (file as File).type
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update resource image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resource image updated successfully",
      url: result.url,
    });
  } catch (error: any) {
    console.error("Error updating resource image:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to update resource image",
      },
      { status: 500 }
    );
  }
}