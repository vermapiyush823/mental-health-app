import { updateProfile } from "../../../../../lib/actions/updateDetails.action";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, phone, location } = await req.json();
    
    const result = await updateProfile(userId, email, phone, location);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 404 }
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
