import mongoose from "mongoose";

interface Mood{
    userId: string;
    moodData: Array<{
        date: Date;
        score: number;
        moodInput: {
            day_rating: string;
            water_intake: string;
            people_met: string;
            exercise: string;
            sleep: string;
            screen_time: string;
            outdoor_time: string;
            stress_level: string;
            food_quality: string;
        }
        reccommendations: Array<{
            priority: string;
            recommendation: string;
            category: string;
        }>;
        
    }>;
    updatedAt: Date;
    createdAt: Date;
}

const moodSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: [true, "User ID is required"],
        },
        moodData: [
            {
                date: {
                    type: Date,
                    default: Date.now,
                },
                score: {
                    type: Number,
                    required: [true, "Mood score is required"],
                },
                moodInput: {
                    day_rating: {
                        type: String,
                        required: [true, "Day rating is required"],
                    },
                    water_intake: {
                        type: Number,
                        required: [true, "Water intake is required"],
                    },
                    people_met: {
                        type: Number,
                        required: [true, "People met is required"],
                    },
                    exercise: {
                        type: Number,
                        required: [true, "Exercise is required"],
                    },
                    sleep: {
                        type: Number,
                        required: [true, "Sleep is required"],
                    },
                    screen_time: {
                        type: Number,
                        required: [true, "Screen time is required"],
                    },
                    outdoor_time: {
                        type: Number,
                        required: [true, "Outdoor time is required"],
                    },
                    stress_level: {
                        type: String,
                        required: [true, "Stress level is required"],
                    },
                    food_quality: {
                        type: String,
                        required: [true, "Food quality is required"],
                    }
                },
                reccommendations: [
                    {
                        type: Object,
                        required: [true, "Recommendation is required"],
                    },
                ],

            },
        ],
        updatedAt: {
            type: Date,
            default: Date.now,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);
const MoodModel = mongoose.models.Mood || mongoose.model<Mood>("Mood", moodSchema);
export default MoodModel;

