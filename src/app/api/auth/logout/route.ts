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

       // Set HTTP-only cookie for user_id
       response.cookies.set("user_id", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1, // 1 day
      });
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Error during logout" },
      { status: 500 }
    );
  }
}
