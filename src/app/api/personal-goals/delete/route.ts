import { NextRequest, NextResponse } from "next/server";
import { deletePersonalGoal } from '../../../../../lib/actions/personalGoals.action';

export async function POST(req: NextRequest) {
  try {
    const { userId, goalId } = await req.json();

    // Validate inputs
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!goalId) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    const result = await deletePersonalGoal(userId, goalId);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
