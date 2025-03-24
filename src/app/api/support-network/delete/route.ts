import { NextRequest, NextResponse } from "next/server";
import { deleteSupportMember } from "../../../../../lib/actions/supportNetwork.action";

export async function DELETE(req: NextRequest) {
  try {
    const { userId, memberId } = await req.json();

    if (!userId || !memberId) {
      return NextResponse.json(
        { error: "User ID and member ID are required" },
        { status: 400 }
      );
    }

    const result = await deleteSupportMember(userId, memberId);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete support member" },
      { status: 500 }
    );
  }
}
