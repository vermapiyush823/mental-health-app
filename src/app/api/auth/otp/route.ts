import { sendEmail } from "../../../../../lib/actions/auth/email.action";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!process.env.PASS) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const otp = await sendEmail(email);
    const tokenId = await bcrypt.hash(otp, 10);

    return NextResponse.json({
      message: "OTP sent successfully",
      ok: true,
      status: 200,
      tokenId,
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send OTP",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}