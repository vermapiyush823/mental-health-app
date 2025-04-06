import { getTodayMoodScore } from "../../../../../lib/actions/GetMoodDetails";
import { NextRequest,NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    console.log("userId", userId);
    if (!userId) {
        return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }
    const moodData = await getTodayMoodScore(userId);
    if (moodData.success) {
        return NextResponse.json({ success: true, data: moodData.data }, { status: 200 });
    } else {
        return NextResponse.json({ success: false, error: moodData.error }, { status: 500 });
    }
};
