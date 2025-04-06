import { getTodayMoodDetails } from "../../../../../lib/actions/GetMoodDetails";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    console.log("userId", userId);

    if (!userId) {
        return NextResponse.json({ success: false, error: "User ID is required" });
    }

    const response = await getTodayMoodDetails(userId);
    return NextResponse.json(response);
}

