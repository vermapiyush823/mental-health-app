import mongoose from "mongoose";

interface CommunityChat {
    userId: string;
    username: string;
    message: string;
    createdAt: Date;
    isDeleted?: boolean;
    originalMessage?: string;
    deletedAt?: Date;
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
        isDeleted: {
            type: Boolean,
            default: false
        },
        originalMessage: {
            type: String,
            default: null
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
    }
);

const CommunityChat = mongoose.models.CommunityChat || mongoose.model<CommunityChat>("CommunityChat", communityChatSchema);

export default CommunityChat;