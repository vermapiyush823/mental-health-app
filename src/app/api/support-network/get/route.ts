import { NextRequest, NextResponse } from "next/server";
import { getSupportMembers } from "../../../../../lib/actions/supportNetwork.action";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supportMembers = await getSupportMembers(userId);
    
    return NextResponse.json({ supportMembers }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get support members" },
      { status: 500 }
    );
  }
}
