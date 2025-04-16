import MoodModel from "../../database/models/mood";
import { connectToDatabase } from "../mongoose";

export const getTodayMoodDetails = async (userId: string) => {
    try {
        await connectToDatabase();

        // Add the offset for IST (UTC+5:30, which is 330 minutes)
        const today = new Date();

        // Find the mood details for the user on today's date
        const moodDetails = await MoodModel.findOne({
            userId,
        });
        if (!moodDetails) {
            return { success: false, error: "Mood details not found for today" };
        }
        if (moodDetails.moodData.length === 0) {
            return { success: false, error: "Mood details not found for today" };
        }
        const moodData = moodDetails.moodData.filter((mood:any) => {
            const moodDate = new Date(mood.date);
            console.log(moodDate.toISOString().split('T')[0], today.toISOString().split('T')[0]);
            return moodDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];
        })
        if (moodData.length === 0) {
            return { success: false, error: "Mood details not found for today" };
        }

        return { success: true, data:moodDetails.moodData[moodDetails.moodData.length - 1]};
    } catch (error) {
        console.error("Error fetching today's mood details:", error);
        return { success: false, error: `Error fetching today's mood details: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
}

export const getLast7DaysMoodDetails = async (userId: string) => {
    try {
        await connectToDatabase();

        // Get today's date in YYYY-MM-DD format
        const today = new Date();

        // Find the mood details for the user on today's date
        const moodDetails = await MoodModel.findOne({
            userId,
        });
        if (!moodDetails) {
            return { success: false, error: "Mood details not found for today" };
        }

        const last7DaysMoodData = moodDetails.moodData.
        slice(-7).map((mood:any) => {
            return {
                score : mood.score,
                date : mood.date,
                moodInput : mood.moodInput,
                reccommendations: mood.reccommendations,
            }
        }
        )
        if (last7DaysMoodData.length === 0) {
            return { success: false, error: "Mood details not found for last 7 days" };
        }
        const FormattedMoodData = last7DaysMoodData.map((mood:any) => {
            return {
                score : mood.score,
                date : mood.date,
                sleep : mood.moodInput.sleep,
                stress: mood.moodInput.stress_level,
                recommendations: mood.reccommendations,
            }
        }
        )
        return { success: true, data: FormattedMoodData };
    } catch (error) {
        console.error("Error fetching last 7 days mood details:", error);
        return { success: false, error: `Error fetching last 7 days mood details: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
}


export const getTodayMoodScore = async (userId: string) => {
    try {
        await connectToDatabase();

        // Get today's date in YYYY-MM-DD format
        const today = new Date();

        // Find the mood details for the user on today's date
        const moodDetails = await MoodModel.findOne({
            userId,
        });
        if (!moodDetails) {
            return { success: false, error: "Mood details not found for today" };
        }
        // fomat the date to YYYY-MM-DD
        const formattedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0];
        const todayMoodData = moodDetails.moodData.filter((mood:any) => {
            const moodDate = new Date(mood.date);
            return moodDate.toISOString().split('T')[0] === formattedDate;
        })

        return { success: true, data:moodDetails.moodData[moodDetails.moodData.length - 1].score};
    } catch (error) {
        console.error("Error fetching today's mood score:", error);
        return { success: false, error: `Error fetching today's mood score: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
}
