import { connectToDatabase } from "../mongoose";
import User from "../../database/models/user";
export async function getUserDetails(userId: string) {
    try {
        await connectToDatabase();
        
        const user = await User.findById(userId);
        
        if (!user) {
            return { success: false, error: "User not found" };
        }
        
        return { success: true, data: JSON.parse(JSON.stringify(user)) };
    } catch (error: any) {
        console.error('Error fetching user:', error);
        return { success: false, error: `Failed to fetch user details: ${error.message}` };
    }
}

export async function getUserImageUrl(userId: string) {
    try {
        await connectToDatabase();
        
        const user = await User.findById(userId).select('image');
        
        if (!user) {
            return { success: false, error: "User not found" };
        }
        
        return { success: true, imageUrl: user.image };
    } catch (error: any) {
        console.error('Error fetching user image:', error);
        return { success: false, error: `Failed to fetch user image: ${error.message}` };
    }
}
