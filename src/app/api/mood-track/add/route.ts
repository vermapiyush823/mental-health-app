import { addOrUpdateMoodDetails } from "../../../../../lib/actions/AddMoodDetails";
import { NextResponse , NextRequest} from "next/server";

export async function POST(request: NextRequest) {
    const { userId, moodDetails } = await request.json();
    console.log("userId", userId);
    console.log("moodDetails", moodDetails);
    
    const response = await addOrUpdateMoodDetails(userId, moodDetails);
    return NextResponse.json(response);
}
