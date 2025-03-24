import { NextRequest, NextResponse } from "next/server";
import { updatePersonalGoal } from '../../../../../lib/actions/personalGoals.action';

export async function POST(req: NextRequest) {
  try {
    const { userId, goalId, completed } = await req.json();

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

    if (completed === undefined) {
      return NextResponse.json(
        { error: "Completed status is required" },
        { status: 400 }
      );
    }

    const result = await updatePersonalGoal(userId, goalId, completed);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

