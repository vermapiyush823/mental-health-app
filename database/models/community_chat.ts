import mongoose from "mongoose";

interface CommunityChat {
    userId: string;
    username: string;
    userImage: string;
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
        userImage: {
            type: String,
            default: "https://api.dicebear.com/6.x/avataaars/svg",
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