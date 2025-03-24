import { NextRequest, NextResponse } from "next/server";
import { updateSupportMember } from "../../../../../lib/actions/supportNetwork.action";

export async function PUT(req: NextRequest) {
  try {
    const { userId, memberId, name, email, phone } = await req.json();

    if (!userId || !memberId || !name || !email || !phone) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const result = await updateSupportMember(userId, memberId, name, email, phone);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update support member" },
      { status: 500 }
    );
  }
}
