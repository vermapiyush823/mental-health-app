"use client";
import React, { useState } from "react";
import Image from "next/image";
import Plus from "../../../assets/icons/plus.svg";
import Trash from "../../../assets/icons/trash-can-10416.svg";

const PersonalGoals = () => {
  const [goals, setGoals] = useState([
    { id: 1, text: "Practice daily meditation", completed: true },
    { id: 2, text: "Complete weekly journal entries", completed: false },
    { id: 3, text: "Attend group therapy session", completed: false },
  ]);
  const [newGoal, setNewGoal] = useState("");
  const [isAdding, setIsAdding] = useState(false); // Toggle input visibility

  // Add a new goal
  const handleAddGoal = () => {
    if (newGoal.trim() === "") return; // Prevent empty goals
    setGoals([...goals, { id: Date.now(), text: newGoal, completed: false }]);
    setNewGoal(""); // Clear input
    setIsAdding(false); // Hide input after adding
  };

  // Remove a goal
  const handleRemoveGoal = (id: number) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  // Toggle goal completion
  const handleToggleGoal = (id: number) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  return (
    <div className="flex flex-col gap-y-5 bg-white h-fit rounded-md p-5 shadow-md">
      {/* Title */}
      <h1 className="text-lg font-bold">Personal Goals</h1>
      {
        goals.length === 0 && (
            <p className="text-sm text-gray-500">
                You have no goals set. Click the button below to add a new goal.
            </p>
            )

      }

      {/* Goals List */}
      <div className="flex flex-col gap-y-2">
        {goals.map((goal) => (
          <div key={goal.id} className="flex items-center justify-between">
            <label className="flex items-center gap-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={goal.completed}
                onChange={() => handleToggleGoal(goal.id)}
                className="w-5 h-5 accent-black cursor-pointer"
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
            >
              <Image src={Trash} alt="Trash Icon" width={18} height={18} />
              {}
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
          />
          <button
            onClick={handleAddGoal}
            className="bg-black text-white flex items-center justify-center gap-x-2 py-2 px-4 rounded-md hover:bg-gray-900 transition"
          >
            <Image src={Plus} alt="Plus Icon" width={18} height={18} />
            <span className="text-sm">Add</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="bg-black text-white flex items-center justify-center gap-x-2 py-2 px-4 rounded-md hover:bg-gray-900 transition"
        >
          <Image src={Plus} alt="Plus Icon" width={18} height={18} />
          <span className="text-sm">Add a new goal</span>
        </button>
      )}
    </div>
  );
};

export default PersonalGoals;
