"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Plus from "../../../assets/icons/plus.svg";
import Trash from "../../../assets/icons/trash-can-10416.svg";

interface ProfileProps {
  userId: string;
}

interface Goal {
  id: string | number;
  text: string;
  completed: boolean;
}

const PersonalGoals = ({ userId }: ProfileProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch goals on component mount
  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoading(true);
      setError(""); // Reset error state
      try {
        const response = await fetch(`/api/personal-goals/get?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch goals");

        const data = await response.json();
        console.log(data);
        // Map API response to match the expected Goal interface structure
        const formattedGoals = data.map((goal: any) => ({
          id: goal.id, // Handle both _id (MongoDB) or id
          text: goal.description, // Handle both description or text
          completed: goal.completed || false,
        }));
        setGoals(formattedGoals);
      } catch (err) {
        console.error("Error fetching goals:", err);
        setError("Failed to load goals");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchGoals();
    }
  }, []);

  // Add a new goal
  const handleAddGoal = async () => {
    if (newGoal.trim() === "") return; // Prevent empty goals

    setIsLoading(true);
    setError(""); // Reset error state
    try {
      const response = await fetch("/api/personal-goals/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          description: newGoal,
          completed: false,
        }),
      });

      if (!response.ok) throw new Error("Failed to add goal");

      const newGoalJsonRes : any = await response.json();
      const newGoalId = newGoalJsonRes.id; 
      setMessage(newGoalJsonRes.message);
      setTimeout(() => {
        setMessage("");
      }, 3000);      
      const newGoalData = { id: newGoalId, text: newGoal, completed: false };
     
      setGoals([...goals, newGoalData]);
      setNewGoal(""); // Clear input
      setIsAdding(false); // Hide input after adding
    } catch (err) {
      console.error("Error adding goal:", err);
      setError("Failed to add goal");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a goal
  const handleRemoveGoal = async (id: number | string) => {
    setIsLoading(true);
    setError(""); // Reset error state
    try {
      const response = await fetch("/api/personal-goals/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          goalId: id,
        }),
      });
      console.log(response);
      const responseJson = await response.json();
      setMessage(responseJson.message);
      setTimeout(() => {
        setMessage("");
      }, 3000);
      if (!response.ok) throw new Error("Failed to delete goal");

      setGoals(goals.filter((goal) => goal.id !== id));
    } catch (err) {
      console.error("Error removing goal:", err);
      setError("Failed to remove goal");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle goal completion
  const handleToggleGoal = async (id: number | string) => {
    const goalToUpdate = goals.find((goal) => goal.id === id);
    if (!goalToUpdate) return;

    setIsLoading(true);
    setError(""); // Reset error state
    try {
      const response = await fetch("/api/personal-goals/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          goalId: id,
          completed: !goalToUpdate.completed,
        }),
      });

      if (!response.ok) throw new Error("Failed to update goal");
      const responseJson = await response.json();
      setMessage(responseJson.message);
      setTimeout(() => {
        setMessage("");
      }, 3000);    
      setGoals(
        goals.map((goal) =>
          goal.id === id ? { ...goal, completed: !goal.completed } : goal
        )
      );
    } catch (err) {
      console.error("Error updating goal:", err);
      setError("Failed to update goal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-5 bg-white h-fit rounded-md p-5 shadow-md">
      {/* Title */}
      <h1 className="text-lg font-bold">Personal Goals</h1>

      {/* Error message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Loading state */}
      {isLoading && <p className="text-sm text-gray-500">Loading goals...</p>}

      {/* Success message */}
      {message && <p className="text-green-500 text-sm">{message}</p>}

      {/* Empty state */}
      {!isLoading && goals.length === 0 && (
        <p className="text-sm text-gray-500">
          You have no goals set. Click the button below to add a new goal.
        </p>
      )}

      {/* Goals List */}
      <div className="flex flex-col gap-y-2">
        {goals.map((goal,index) => (
          <div key={index} className="flex items-center justify-between">
            <label className="flex items-center gap-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={goal.completed}
                onChange={() => handleToggleGoal(goal.id)}
                className="w-5 h-5 accent-black cursor-pointer"
                disabled={isLoading}
              />
              <span
                className={`text-sm ${
                  goal.completed ? "line-through text-gray-500" : "text-gray-800"
                }`}
              >
                {goal.text}
              </span>
            </label>
           
            <button
              onClick={() => handleRemoveGoal(goal.id)}
              className="text-gray-500 hover:text-red-500"
              disabled={isLoading}
            >
              <Image src={Trash} alt="Trash Icon" width={18} height={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Goal Section */}
      {isAdding ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Enter new goal..."
            className="border rounded-md px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-black"
            disabled={isLoading}
          />
          <button
            onClick={handleAddGoal}
            className="bg-black text-white flex items-center justify-center gap-x-2 py-2 px-4 rounded-md hover:bg-gray-900 transition disabled:bg-gray-400"
            disabled={isLoading}
          >
            <Image src={Plus} alt="Plus Icon" width={18} height={18} />
            <span className="text-sm">Add</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="bg-black text-white flex items-center justify-center gap-x-2 py-2 px-4 rounded-md hover:bg-gray-900 transition disabled:bg-gray-400"
          disabled={isLoading}
        >
          <Image src={Plus} alt="Plus Icon" width={18} height={18} />
          <span className="text-sm">Add a new goal</span>
        </button>
      )}
    </div>
  );
};

export default PersonalGoals;