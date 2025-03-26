import { connectToDatabase } from "../mongoose";
import ChatHistory from "../../database/models/chat_history"

// Create new chat session or add to existing one
interface Chat{
        userId: string;
        chatId: string;
        userMessages: string[];
        chatbotMessages: string[];
        startDate: Date;
        startTime: string;
}
export async function addChatHistory({
  userId,
  chatId,
  userMessages,
  chatbotMessages,
  startDate,
  startTime
}: Chat) {
  try {
    await connectToDatabase();
    
    // Check if chat history already exists for the user
    const userChatHistory = await ChatHistory.findOne({ userId });
    
    if (userChatHistory) {
      // Find if this specific chat exists
      const existingChat = userChatHistory.chat.find(
        (chat: any) => chat.chatId === chatId
      );
      
      if (existingChat) {
        // Add messages to existing chat
        existingChat.userMessage = userMessages;
        existingChat.chatbotMessage = chatbotMessages;
      } else {
        // Add new chat to existing user's chat array
        userChatHistory.chat.push({
          chatId,
          userMessage: userMessages,
          chatbotMessage: chatbotMessages,
          date: startDate,
          time: startTime
        });
      }
      
      await userChatHistory.save();
    } else {
      // Create new user chat history
      await ChatHistory.create({
        userId,
        chat: [{
          chatId,
          userMessage: userMessages,
          chatbotMessage: chatbotMessages,
          date: startDate,
          time: startTime
        }]
      });
    }
    
    return "Chat history added successfully";
    
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