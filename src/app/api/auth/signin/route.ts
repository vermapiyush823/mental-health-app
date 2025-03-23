import { NextRequest, NextResponse } from "next/server";
 import { signIn } from "../../../../../lib/actions/auth/auth.actions";
 
 export async function POST(req: NextRequest) {
   try {
     const { email, password } = await req.json();
 
     if (!email || !password) {
       return NextResponse.json(
         { error: "Missing email or password" },
         { status: 400 }
       );
     }
 
     // Call the signIn function from auth.actions.ts
     const { token, user } = await signIn(email, password);
 
     const response = NextResponse.json(
       {
         message: "Login successful",
         user,
       },
       { status: 200 }
     );
 
     // Set HTTP-only cookie
     response.cookies.set("token", token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
       sameSite: "strict",
       maxAge: 86400, // 1 day
     });
     response.cookies.set("user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 1 day
    });
 
     return response;
   } catch (error: any) {
     return NextResponse.json(
       { error: error.message || "Internal server error" },
       { status: 500 }
     );
   }
 }