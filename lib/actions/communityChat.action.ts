import { connectToDatabase } from "../mongoose";
import CommunityChat from "../../database/models/community_chat";
import User from "../../database/models/user";

// Get all community chat messages (with pagination)
export async function getCommunityMessages(limit: number = 20, skip: number = 0) {
  try {
    await connectToDatabase();
    
    // Ensure reasonable limits to prevent timeouts
    const safeLimit = Math.min(limit, 30);
    
    // Projection to select only needed fields (optimization)
    const projection = {
      userId: 1,
      username: 1,
      message: 1,
      createdAt: 1
    };
    
    // Use a time-boxed query approach with lean() for better performance
    const query = CommunityChat.find({}, projection)
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .skip(skip)
      .lean();
      
    // Set a timeout on the MongoDB query itself
    const messages = await query.maxTimeMS(5000).exec();
    
    // Return the messages in chronological order (oldest first)
    return messages.reverse();
  } catch (error) {
    console.error("Error getting community messages:", error);
    
    // Add specific handling for common MongoDB errors
    if (error instanceof Error && (error.name === 'MongooseError' || error.name === 'MongoServerError')) {
      // If this is a MongoDB timeout error, provide a clearer message
      if ((error as any).code === 50 || error.message.includes('timed out')) {
        throw new Error('Database query timed out. The collection may be too large or server is busy.');
      }
      
      // If this is the memory limit error we saw before
      if ((error as any).code === 292 || error.message.includes('Sort exceeded memory limit')) {
        throw new Error('Database sort operation exceeded memory limits. Try fetching fewer messages.');
      }
    }
    
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