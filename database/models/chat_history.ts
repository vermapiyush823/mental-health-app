import mongoose from "mongoose";

interface ChatHistory {
    userId: string;
    chat: {
        chatId: string;
        chatbotMessage: string[];
        userMessage: string[];
        date: Date;
        time: string;
    }[];
}

const chatHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: [true, "User Id is required"],
        },
       
        chat: [
            {
                chatId: {
                    type: String,
                    required: [true, "Chat Id is required"],
                },
                chatbotMessage: {
                    type: [String],
                    required: true,
                },
                userMessage: {
                    type: [String],
                    required: true,
                },
                date: {
                    type: Date,
                    required: [true, "Date is required"],
                },
                time: {
                    type: String,
                    required: [true, "Time is required"],
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const ChatHistory = mongoose.models.ChatHistory || mongoose.model<ChatHistory>("ChatHistory", chatHistorySchema);

export default ChatHistory;