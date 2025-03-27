import { connectToDatabase } from "../mongoose";
import User from "../../database/models/user";

interface SupportMember {
    name: string;
    email: string;
    phone: string;
}

export async function getSupportMembers(userId: string) {
    try {
        await connectToDatabase();
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        
        
        // Ensure all members have the required fields
        const normalizedMembers = user.supportMembers.map((member: any) => ({
            name: member.name || '',
            email: member.email || '',
            phone: member.phone || '',
            // Include _id for reference if it exists
            _id: member._id || undefined
        }));
        
        return normalizedMembers;
    }
    catch (error: any) {
        console.error("Error in getSupportMembers:", error);
        throw new Error(error);
    }
}

export async function addSupportMember(userId: string, name: string, email: string, phone: string) {
    try {
        await connectToDatabase();
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        
        // Ensure all fields are explicitly set
        const newMember = {
            name: name || '',
            email: email || '',
            phone: phone || ''
        };

        
        
        // Add to support members array
        user.supportMembers.push(newMember);
        user.supportMembers[user.supportMembers.length - 1].email = email;
        user.supportMembers[user.supportMembers.length - 1].phone = phone;
        await user.save();
        
        // Fetch the updated user to confirm the change
        const updatedUser = await User.findById(userId);
        
        return { 
            message: "Support member added successfully",
            member: newMember
        };
    }
    catch (error: any) {
        console.error("Error in addSupportMember:", error);
        throw new Error(error);
    }
}

export async function updateSupportMember(userId: string, memberId: string, name: string, email: string, phone: string) {
    try {
        await connectToDatabase();
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }   
        const member: SupportMember | undefined = user.supportMembers.find((member: SupportMember): boolean => member.name === memberId);
        if (!member) {
            throw new Error("Member not found");
        }
        member.name = name;
        member.email = email;
        member.phone = phone;
        await user.save();
        return { message: "Support member updated successfully"};
    }
    catch (error: any) {
        throw new Error(error);
    }
}


export async function deleteSupportMember(userId: string, memberId: string) {
    try {
        await connectToDatabase();
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }   
        const memberIndex = user.supportMembers.findIndex((member: SupportMember): boolean => member.name === memberId);
        if (memberIndex === -1) {
            throw new Error("Member not found");
        }
        user.supportMembers.splice(memberIndex, 1);
        await user.save();
        return { message: "Support member deleted successfully"};
    }
    catch (error: any) {
        throw new Error(error);
    }
}

