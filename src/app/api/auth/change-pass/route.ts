import { changePassword } from "../../../../../lib/actions/auth/auth.actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();
    console.log(email,newPassword);
    await changePassword(email, newPassword);
    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to change password" },
      { status: 500 }
    );
  }
}