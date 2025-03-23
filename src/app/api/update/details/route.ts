import { updateProfile } from "../../../../../lib/actions/updateDetails.action";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {userId, email, phone, location, gender, age} = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await updateProfile(userId, email, phone, location,gender,age);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "User updated successfully", user: result.data },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { message: "Error updating user", error: error.message },
      { status: 500 }
    );
  }
}
