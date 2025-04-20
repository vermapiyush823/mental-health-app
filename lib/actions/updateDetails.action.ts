import { connectToDatabase } from "../mongoose";
import User from "../../database/models/user";

export async function updateProfile(
        userId: string,
        email: string,
        phone: string,
        location: string,
        gender:string,
        age:string,
        notificationPreference: string,
){
    try {
        await connectToDatabase();
        
        // Ensure phone is properly formatted and not undefined
        const formattedPhone = phone?.trim() || '';
        
        console.log('Updating user with phone:', formattedPhone);
        console.log('Notification preference:', notificationPreference);
        
        // Check if email is already taken by another user
        const existingUserWithEmail = await User.findOne({ 
            email: email, 
            _id: { $ne: userId } 
        });
        
        if (existingUserWithEmail) {
            return { 
                success: false, 
                error: "Email address is already in use by another account" 
            };
        }
        
        // Find user and update
        const updatedUser = await User.findOne({ _id: userId });
        
        if (!updatedUser) {
            return { success: false, error: "User not found" };
        }
        
        // Update user fields
        updatedUser.email = email;
        updatedUser.phone = formattedPhone;
        updatedUser.location = location;
        updatedUser.gender = gender;
        updatedUser.age = age;
        updatedUser.notificationPreference = notificationPreference;
        
        await updatedUser.save();
        console.log('Updated user:', updatedUser);

        return { success: true, data: JSON.parse(JSON.stringify(updatedUser)) };
    } catch (error: any) {
        console.error('Error updating user:', error);
        return { 
            success: false, 
            error: `Failed to update user profile: ${error.message}` 
        };
    }
}

export async function updateUserProfilePicture(
    id: string,
    buffer: Buffer,
    type: string
  ) {
    try {
      await connectToDatabase();
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }
      console.log(id, buffer, type);
      user.image = `data:${type};base64,${Buffer.from(buffer).toString(
        "base64"
      )}`;
      await user.save();
      return { url: user.image };
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  }
