import { NextRequest, NextResponse } from "next/server";
import { getUserImageUrl } from "../../../../../lib/actions/getUserDetails.action";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();
        
        if (!userId) {
            return NextResponse.json(
                { message: "User ID is required" },
                { status: 400 }
            );
        }

        const result = await getUserImageUrl(userId);
        
        if (!result.success) {
            return NextResponse.json(
                { message: result.error },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { imageUrl: result.imageUrl },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error fetching user image:", error);
        return NextResponse.json(
            { message: "Error fetching user image", error: error.message },
            { status: 500 }
        );
    }
}