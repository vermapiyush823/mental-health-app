import { connectToDatabase } from "../mongoose";
import ChatHistory from "../../database/models/chat_history"

// Create new chat session or add to existing one
export async function addChatHistory({
  userId,
  userMessages,
  chatbotMessages,
  startDate,
  startTime
}: {
  userId: string;
  userMessages: string[];
  chatbotMessages: string[];
  startDate: Date;
  startTime: string;
}) {
  try {
    await connectToDatabase();
    
    // Check if user already has chat history
    const existingHistory = await ChatHistory.findOne({ userId });
    
    if (existingHistory) {
      // Add to existing chat history
      existingHistory.chat.push({
        userMessage: userMessages,
        chatbotMessage: chatbotMessages,
        date: startDate,
        time: startTime
      });
      
      await existingHistory.save();
      return existingHistory;
    } else {
      // Create new chat history
      const newChatHistory = await ChatHistory.create({
        userId,
        chat: [{
          userMessage: userMessages,
          chatbotMessage: chatbotMessages,
          date: startDate,
          time: startTime
        }]
      });
      
      return newChatHistory;
    }
  } catch (error) {
    console.error("Error adding chat history:", error);
    throw error;
  }
}

// Get all chat history for a user
export async function getUserChatHistory(userId: string) {
  try {
    await connectToDatabase();
    
    const chatHistory = await ChatHistory.findOne({ userId });
    return chatHistory;
  } catch (error) {
    console.error("Error getting user chat history:", error);
    throw error;
  }
}