import { NextRequest,NextResponse } from "next/server";
import { getUserDetails } from "../../../../../lib/actions/getUserDetails.action";
export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();
        const user = await getUserDetails(userId as string);
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { user },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching user", error },
            { status: 500 }
        );
    }
}
