import { updateUserProfilePicture } from "../../../../../lib/actions/updateDetails.action";
import { NextRequest, NextResponse } from "next/server";
// Export the POST method as a named export
export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file");
    const userId = data.get("userId");

    if (!file || !userId) {
      throw new Error("Invalid request");
    }
    console.log(file);
    const bufferData = await (file as File).arrayBuffer();
    const buffer = Buffer.from(bufferData);
    console.log(buffer);
    const url = await updateUserProfilePicture(
      userId.toString(),
      buffer,
      (file as File).type
    );

    return NextResponse.json({
      ok: true,
      message: "Profile picture updated successfully",
    url,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return NextResponse.json(
      {
        error: "Failed to update profile picture",
      },
      { status: 500 }
    );
  }
}