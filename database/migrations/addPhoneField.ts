import dotenv from 'dotenv';
import { connectToDatabase } from "../../lib/mongoose";
import User from "../models/user";

// Load environment variables
dotenv.config();

async function migratePhoneField() {
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error('MONGODB_URL is not defined in environment variables');
        }
        
        await connectToDatabase();
        
        // Update all users that don't have a phone field
        const result = await User.updateMany(
            { phone: { $exists: false } },
            { $set: { phone: "" } }
        );

        console.log(`Migration completed. Updated ${result.modifiedCount} users.`);
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        process.exit();
    }
}

migratePhoneField();
