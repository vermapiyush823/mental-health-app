import { NextRequest, NextResponse } from "next/server";
import { addResource } from "../../../../../lib/actions/resource.action";

export async function POST(req: NextRequest) {
  try {
    // Check if the request is a form data (with file upload) or JSON
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      // Handle form data with file upload
      const formData = await req.formData();
      const file = formData.get("file");
      const resourceDataJson = formData.get("resourceData");
      
      if (!resourceDataJson) {
        return NextResponse.json(
          { error: "Resource data is required" },
          { status: 400 }
        );
      }
      
      // Parse the JSON string
      const resourceData = JSON.parse(resourceDataJson.toString());
      
      // Validate required fields
      const requiredFields = ['title', 'description', 'category', 'timeToRead', 'sections'];
      const missingFields = requiredFields.filter(field => !resourceData[field]);
      
      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: `Missing required fields: ${missingFields.join(', ')}` },
          { status: 400 }
        );
      }
      
      // Process the file
      let imageBuffer, imageType;
      if (file) {
        const bufferData = await (file as File).arrayBuffer();
        imageBuffer = Buffer.from(bufferData);
        imageType = (file as File).type;
      }
      
      // Add the resource with image
      const result = await addResource(resourceData, imageBuffer, imageType);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to add resource" },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          message: "Resource added successfully", 
          resource: result.data 
        },
        { status: 201 }
      );
    } else {
      // Handle JSON request (no file upload)
      const resourceData = await req.json();
      
      // Validate required fields
      const requiredFields = ['title', 'description', 'imageUrl', 'category', 'timeToRead', 'sections'];
      const missingFields = requiredFields.filter(field => !resourceData[field]);
      
      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: `Missing required fields: ${missingFields.join(', ')}` },
          { status: 400 }
        );
      }
      
      const result = await addResource(resourceData);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to add resource" },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          message: "Resource added successfully", 
          resource: result.data 
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Error in add resource API:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}