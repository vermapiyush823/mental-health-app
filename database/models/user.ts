import mongoose from "mongoose";

interface User {
  name: string;
  email: string;
  image: string;
  gender: string;
  phone: string;
  location: string;
  age: number;
  password: string;
  notificationPreference: string; // Email or none only
  supportMembers: { name: string; email: string , phone: string}[];
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
    phone: {
      type: String,
      trim: true,
      set: (v: string) => v || '',  // Ensure empty strings are stored properly
      get: (v: string) => v || '',  // Ensure empty strings are retrieved properly
    },
    gender: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: false
    },
    age: {
      type: Number,
      required: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    notificationPreference: {
      type: String,
      enum: ['email', 'none', 'sms'],
      default: 'email'
    },
    supportMembers: [{
      name: String,
      email: String,
      phone:String,
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
    toJSON: { getters: true }, // Enable getters when converting to JSON
    toObject: { getters: true }
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
