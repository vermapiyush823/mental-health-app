import dotenv from 'dotenv';
import { connectToDatabase } from "../../lib/mongoose";
import User from "../models/user";

dotenv.config();

async function setUserDefaults() {
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error('MONGODB_URL is not defined in environment variables');
        }
        
        await connectToDatabase();
        
        const result = await User.updateMany(
            { image: { $in: ["", null, undefined] } },
            {
                $set: {
                    image: "https://api.dicebear.com/6.x/avataaars/svg"
                },
                $setOnInsert: {
                    name: "",
                    email: "",
                    phone: "",
                    gender: "",
                    age: 0,
                    password: "",
                    supportMembers: [],
                    personalGoals: [],
                    personalizedResources: [],
                    moodScore: [],
                }
            },
            { upsert: true }
        );

        console.log(`Migration completed. Updated ${result.modifiedCount} users.`);
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        process.exit();
    }
}

setUserDefaults();
