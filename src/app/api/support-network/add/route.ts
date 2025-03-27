import { NextRequest, NextResponse } from "next/server";
import { addSupportMember } from "../../../../../lib/actions/supportNetwork.action";

export async function POST(req: NextRequest) {
  try {
    const { userId, name, email, phone } = await req.json();

    if (!userId || !name || !email ) {
      return NextResponse.json(
        { error: "User ID, name, email, and phone are required" },
        { status: 400 }
      );
    }
    var result;
    if(phone!==''){
    const res = await addSupportMember(userId, name, email, phone);
    result = res;
    }
    else{
      const res = await addSupportMember(userId, name, email, '');
      result = res;
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add support member" },
      { status: 500 }
    );
  }
}
