import mongoose from "mongoose";

interface User {
  name: string;
  email: string;
  image: string;
  gender: string;
  age: number;
  password: string;
  supportMembers: { name: string; role: string }[];
  personalGoals: { id: string; description: string; completed: boolean }[];
  personalizedResources: { id: string}[];
  moodScore: { date: Date; score: number }[];
  createdAt: Date;
  updatedAt: Date;
}


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    image: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: ['true']
    },
    age: {
      type: Number,
      required: ['true']
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    supportMembers: [{
      name: String,
      role: String,
    }],
    personalGoals: [{
      id: String,
      description: String,
      completed: {
        type: Boolean,
        default: false
      }
    }],
    personalizedResources: [{
      id: String,
    }],
    
    moodScore: [
      {
        date: Date,
        score: Number,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
