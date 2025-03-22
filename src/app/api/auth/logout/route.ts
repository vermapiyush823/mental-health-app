import { NextResponse } from "next/server";
export async function POST() {
  try {

    
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the authentication cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Error during logout" },
      { status: 500 }
    );
  }
}
