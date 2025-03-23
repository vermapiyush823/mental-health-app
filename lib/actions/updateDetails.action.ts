import { connectToDatabase } from "../mongoose";
import User from "../../database/models/user";

export async function updateProfile(
        userId: string,
        email: string,
        phone: string,
        location: string,
        gender:string,
        age:string,
){
    try {
        await connectToDatabase();
        
        // Ensure phone is properly formatted and not undefined
        const formattedPhone = phone?.trim() || '';
        
        console.log('Updating user with phone:', formattedPhone);
        
        // Use $set to ensure fields are properly updated
        const updatePayload = {
            $set: {
                email,
                phone: formattedPhone,
                location,
                gender,
                age
            }
        };
        
        console.log('Update payload:', updatePayload);
        
        const updatedUser = await User.findOne({ _id: userId });
        updatedUser.email = email;
        updatedUser.phone = formattedPhone;
        updatedUser.location = location;
        updatedUser.gender = gender;
        updatedUser.age = age;
        await updatedUser.save();
        console.log('Updated user:', updatedUser);

        if (!updatedUser) {
            return { success: false, error: "User not found" };
        }

        return { success: true, data: JSON.parse(JSON.stringify(updatedUser)) };
    } catch (error: any) {
        console.error('Error updating user:', error);
        return { success: false, error: `Failed to update user profile: ${error.message}` };
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
  