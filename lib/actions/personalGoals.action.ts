import { connectToDatabase } from "../mongoose";
import User from "../../database/models/user";

interface PersonalGoal {
    id: string;
    description: string;
    completed: boolean;
}

export async function getPersonalGoals(userId: string) {
    try {
        await connectToDatabase();
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user.personalGoals;
    }
    catch (error: any) {
        throw new Error(error);
    }
}

export async function addPersonalGoals(userId: string, description: string, completed: boolean) {
    try {
        await connectToDatabase();
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }   
        const newGoal: PersonalGoal = {
            id: Math.floor(Math.random() * 900 + 100).toString(),
            description: description,
            completed: completed
        };
        user.personalGoals.push(newGoal);
        await user.save();
        return { message: "Personal goal added successfully", id: newGoal.id };
    }
    catch (error: any) {
        throw new Error(error);
    }
}

export async function updatePersonalGoal(userId: string, goalId: string, completed: boolean) {
    try {
        await connectToDatabase();
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }   
        const goal: PersonalGoal | undefined = user.personalGoals.find((goal: PersonalGoal): boolean => goal.id === goalId);
        if (!goal) {
            throw new Error("Goal not found");
        }
        goal.completed = completed;
        await user.save();
        if (completed) {
            return { message: "Personal goal completed successfully" };
        }
        return { message: "Personal goal updated successfully" };
    }
    catch (error: any) {
        throw new Error(error);
    }
}

export async function deletePersonalGoal(userId: string, goalId: string) {
    try {
        await connectToDatabase();
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        user.personalGoals = user.personalGoals.filter((goal: PersonalGoal): boolean => goal.id !== goalId);
        await user.save();
        return { message: "Personal goal deleted successfully" };
    }
    catch (error: any) {
        throw new Error(error);
    }
}

