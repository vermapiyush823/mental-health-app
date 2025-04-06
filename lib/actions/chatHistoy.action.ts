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
    // Validate chatId to prevent MongoDB validation error
    if (!chatId || chatId.trim() === '') {
      throw new Error("Chat Id is required");
    }
    
    await connectToDatabase();
    
    // Check if chat history already exists for the user
    const userChatHistory = await ChatHistory.findOne({ userId });
    
    if (userChatHistory) {
      // Find if this specific chat exists
      const existingChatIndex = userChatHistory.chat.findIndex(
        (chat: any) => chat.chatId === chatId
      );
      
      if (existingChatIndex !== -1) {
        // Update existing chat instead of replacing
        userChatHistory.chat[existingChatIndex].userMessage = userMessages;
        userChatHistory.chat[existingChatIndex].chatbotMessage = chatbotMessages;
        await userChatHistory.save();
        return { updated: true, chatId };
      } else {
        // Check if there's a chat with exactly the same messages (potential duplicate)
        const potentialDuplicate = userChatHistory.chat.findIndex((chat: any) => {
          // If message counts don't match, it's definitely not a duplicate
          if (chat.userMessage.length !== userMessages.length) return false;
          
          // Compare userMessages arrays
          const userMsgMatch = chat.userMessage.every((msg: string, i: number) => 
            msg === userMessages[i]);
            
          return userMsgMatch;
        });
        
        if (potentialDuplicate !== -1) {
          // If found a potential duplicate, update it instead
          userChatHistory.chat[potentialDuplicate].userMessage = userMessages;
          userChatHistory.chat[potentialDuplicate].chatbotMessage = chatbotMessages;
          await userChatHistory.save();
          return { updated: true, chatId: userChatHistory.chat[potentialDuplicate].chatId };
        }
        
        // Add new chat to existing user's chat array
        userChatHistory.chat.push({
          chatId,
          userMessage: userMessages,
          chatbotMessage: chatbotMessages,
          date: startDate,
          time: startTime
        });
        
        await userChatHistory.save();
        return { added: true, chatId };
      }
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
      
      return { created: true, chatId };
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