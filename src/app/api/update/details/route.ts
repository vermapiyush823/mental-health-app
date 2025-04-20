import { NextRequest, NextResponse } from "next/server";
import { updateProfile } from "../../../../../lib/actions/updateDetails.action";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, phone, location, gender, age, notificationPreference } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await updateProfile(userId, email, phone, location, gender, age, notificationPreference);
    
    // Return appropriate status code based on success/failure
    if (!result.success) {
      return NextResponse.json(
        result,
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating user details:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
