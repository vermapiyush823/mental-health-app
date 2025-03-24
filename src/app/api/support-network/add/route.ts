import { NextRequest, NextResponse } from "next/server";
import { addSupportMember } from "../../../../../lib/actions/supportNetwork.action";

export async function POST(req: NextRequest) {
  try {
    const { userId, name, email, phone } = await req.json();

    if (!userId || !name || !email || !phone) {
      return NextResponse.json(
        { error: "User ID, name, email, and phone are required" },
        { status: 400 }
      );
    }

    const result = await addSupportMember(userId, name, email, phone);
    console.log(result);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add support member" },
      { status: 500 }
    );
  }
}
