import { connectToDatabase } from "../mongoose";
import CommunityChat from "../../database/models/community_chat";
import User from "../../database/models/user";

// Get all community chat messages (with pagination)
export async function getCommunityMessages(limit: number = 50, skip: number = 0) {
  try {
    await connectToDatabase();
    
    // Get messages with newest first, then we'll reverse for display
    const messages = await CommunityChat.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
      
    // Return in chronological order for display
    return messages.reverse();
  } catch (error) {
    console.error("Error getting community messages:", error);
    throw error;
  }
}

// Add a new message to the community chat
export async function addCommunityMessage(userId: string, message: string) {
  try {
    await connectToDatabase();
    
    // Get user details to attach to message
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Create new message
    const newMessage = await CommunityChat.create({
      userId,
      username: user.name || "Anonymous",
      userImage: user.image || "https://api.dicebear.com/6.x/avataaars/svg",
      message
    });
    
    return newMessage;
  } catch (error) {
    console.error("Error adding community message:", error);
    throw error;
  }
}

// Delete a message (only by the user who created it)
export async function deleteMessage(userId: string, messageId: string) {
  try {
    await connectToDatabase();
    
    // Find message
    const message = await CommunityChat.findById(messageId);
    
    if (!message) {
      throw new Error("Message not found");
    }
    
    // Check ownership
    if (message.userId !== userId) {
      throw new Error("Not authorized to delete this message");
    }
    
    // Delete message
    await CommunityChat.findByIdAndDelete(messageId);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting community message:", error);
    throw error;
  }
}