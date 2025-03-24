import { NextRequest, NextResponse } from "next/server";
import { addPersonalGoals } from '../../../../../lib/actions/personalGoals.action';

export async function POST(req: NextRequest) {
  try {
    const { userId, description, completed } = await req.json();

    // Validate inputs
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const result = await addPersonalGoals(
      userId, 
      description, 
      completed || false
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
