import { connectToDatabase } from "../mongoose";
import User from "../../database/models/user";

export async function updateProfile(
        user:string,email:string,phone:string,location:string
){
    try {
        await connectToDatabase();

        // Find and update user
        const updatedUser = await User.findOneAndUpdate(
            { _id: user },
            {
                email,
                phone,
                location
            },
            { new: true }
        );

        if (!updatedUser) {
            throw new Error("User not found");
        }

        return JSON.parse(JSON.stringify(updatedUser));
    } catch (error: any) {
        throw new Error(`Failed to update user profile: ${error.message}`);
    }
}