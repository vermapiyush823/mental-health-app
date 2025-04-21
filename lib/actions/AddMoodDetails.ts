import MoodModel from "../../database/models/mood";
import { connectToDatabase } from "../mongoose";
import { sendMoodNotification } from "./notifications.action";

// Define a type that matches the schema structure
type MoodDetails = {
  date?: Date;
  moodInput: {
    score: number;
    day_rating: string;
    water_intake: number;
    people_met: number;
    exercise: number;
    sleep: number;
    screen_time: number;
    outdoor_time: number;
    stress_level: string;
    food_quality: string;
  };
  reccommendations: {
    priority: string;
    recommendation: string;
    category: string;
  }[] // Fixed spelling here
};

export const addOrUpdateMoodDetails = async (userId: string, moodDetails: any) => {
  try {
    
    // Connect to the database
    console.log('MoodDetails: ', moodDetails);
    await connectToDatabase();
    
    // Properly map recommendations to reccommendations for schema compatibility
    // The incoming data uses "recommendations" but our schema uses "reccommendations"
    
    const existingMood = await MoodModel.findOne({ userId });
    console.log("existingMood", existingMood);
    if (existingMood) {
      existingMood.moodData.push(moodDetails)
      await existingMood.save();
    } else {
      // Create new mood details entry
      const newMood = new MoodModel({
        userId,
        moodData: [moodDetails],
      });
      await newMood.save();
    }

    // Send notification with the mood score and recommendations
    try {
      if (moodDetails.score && moodDetails.reccommendations) {
        await sendMoodNotification(userId, moodDetails.score, moodDetails.reccommendations);
        console.log("Mood notification sent successfully");
      }
    } catch (notificationError) {
      console.error("Error sending mood notification:", notificationError);
      // Continue even if notification fails
    }

    return { success: true, message: "Mood details added successfully" };
  } catch (error) {
    console.error("Error adding/updating mood details:", error);
    return { success: false, message: `Error adding/updating mood details: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
