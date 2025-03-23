import { NextRequest, NextResponse } from "next/server";
 import { signUp } from "../../../../../lib/actions/auth/auth.actions";
 
 export async function POST(req: NextRequest) {
   try {
     const { name, email, age, gender, password }= await req.json();
     if (!name || !email || !password) {
       return NextResponse.json(
         { error: "Missing required fields" },
         { status: 400 }
       );
     }
 
     // Call the signUp function from auth.actions.ts
     const { token, user } = await signUp(name, email, password, age,gender);
 
     const response = NextResponse.json(
       {
         message: "User created successfully",
         user,
       },
       { status: 201 }
     );
 
     // Set HTTP-only cookie
     response.cookies.set("token", token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
       sameSite: "strict",
       maxAge: 86400, // 1 day
     },
   )
      response.cookies.set("user_id", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 86400, // 1
      });

 
     return response;
   } catch (error: any) {
     return NextResponse.json(
       { error: error.message || "Internal server error" },
       { status: 500 }
     );
   }
 }