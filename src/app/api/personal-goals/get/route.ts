import { NextRequest, NextResponse } from "next/server";
import { getPersonalGoals } from '../../../../../lib/actions/personalGoals.action';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const goals = await getPersonalGoals(userId);
    return NextResponse.json(goals, { status: 200 });
    
  } catch (error: any) {
    console.error("Error fetching personal goals:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch personal goals" },
      { status: 500 }
    );
  }
}
