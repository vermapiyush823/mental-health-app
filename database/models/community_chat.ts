import mongoose from "mongoose";

interface CommunityChat {
    userId: string;
    username: string;
    message: string;
    createdAt: Date;
}

const communityChatSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: [true, "User ID is required"],
        },
        username: {
            type: String,
            required: [true, "Username is required"],
        },
        message: {
            type: String,
            required: [true, "Message is required"],
        },
    },
    {
        timestamps: true,
    }
);

const CommunityChat = mongoose.models.CommunityChat || mongoose.model<CommunityChat>("CommunityChat", communityChatSchema);

export default CommunityChat;