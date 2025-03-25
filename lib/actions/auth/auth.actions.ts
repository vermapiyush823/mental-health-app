"use server";

import { connectToDatabase } from "../../mongoose";
import User from "../../../database/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function signIn(email: string, password: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" }
    );

    return { token, user: { id: user._id, name: user.name, email: user.email } };
  } catch (error: any) {
    throw new Error(`Failed to sign in: ${error.message}`);
  }
}

export async function signUp(name: string, email: string, password: string,age:Number,gender:string){
  try {
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      age,
      gender
    });

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" }
    );

    return { 
      token, 
      user: { 
        id: newUser._id, 
        name: newUser.name, 
        email: newUser.email 
      } 
    };
  } catch (error: any) {
    throw new Error(`Failed to sign up: ${error.message}`);
  }
}

export async function changePassword(email: string, password: string){
  try {
    await connectToDatabase();
      const hashedPassword = await bcrypt.hash(password, 10);
      const updatedUser = await User.findOne({ email });
      if (!updatedUser) {
        throw new Error("User not found");
      }
      updatedUser.password = hashedPassword;
      await updatedUser.save();
  }
  catch (error: any) {
    throw new Error(`Failed to change password: ${error.message}`);
  }
}

