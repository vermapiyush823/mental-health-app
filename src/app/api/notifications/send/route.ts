import { NextRequest, NextResponse } from "next/server";
import { sendMoodNotification } from "../../../../../lib/actions/notifications.action";

export async function POST(req: NextRequest) {
  try {
    const { userId, score, recommendations } = await req.json();

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (score === undefined || score === null) {
      return NextResponse.json(
        { error: "Mood score is required" },
        { status: 400 }
      );
    }

    if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
      return NextResponse.json(
        { error: "Recommendations are required" },
        { status: 400 }
      );
    }

    // Send the notification
    const result = await sendMoodNotification(userId, score, recommendations);

    // Return response based on the notification result
    if (result.success) {
      return NextResponse.json(
        { success: true, message: result.message },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in notifications API:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to send notification: ${error instanceof Error ? error.message : "Unknown error"}` 
      },
      { status: 500 }
    );
  }
}