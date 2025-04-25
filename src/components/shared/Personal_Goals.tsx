"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Plus from "../../../assets/icons/plus.svg";
import Trash from "../../../assets/icons/trash-can-10416.svg";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ProfileProps {
  userId: string;
}

interface Goal {
  id: string | number;
  text: string;
  completed: boolean;
}

const PersonalGoals = ({ userId }: ProfileProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch goals on component mount
  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoading(true);
      setError(""); // Reset error state
      try {
        const response = await fetch(`/api/personal-goals/get?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch goals");

        const data = await response.json();
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 15 
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  // For safe SSR, use a conditional check for the theme
  const isDarkMode = mounted && resolvedTheme === 'dark';

  // Define theme-dependent styles
  const cardBgClass = isDarkMode 
    ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 text-gray-100 shadow-lg" 
    : "bg-white/90 backdrop-blur-sm border border-gray-100 text-gray-900 shadow-xl";

  // Gradient overlay
  const gradientOverlay = `absolute inset-0 bg-gradient-to-br ${
    isDarkMode 
      ? 'from-purple-500/5 to-indigo-500/5' 
      : 'from-indigo-500/5 to-purple-500/5'
  } pointer-events-none rounded-lg`;

  // Loading skeleton styles
  const skeletonClass = isDarkMode ? 'bg-gray-700/70' : 'bg-gray-200/70';

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`flex flex-col gap-y-5 ${cardBgClass} h-fit rounded-lg p-5 transition-colors duration-300 relative overflow-hidden`}
    >
      {/* Gradient overlay */}
      <div className={gradientOverlay}></div>

      {/* Title */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center justify-between z-10"
      >
        <h1 className="text-lg font-bold tracking-wide">
          <span className={'text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500'}>
            Personal Goals
          </span>
        </h1>
        {message && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-xs font-medium ${isDarkMode ? 'bg-green-900/20 text-green-300' : 'bg-green-100 text-green-600'} py-1 px-2 rounded-full`}
          >
            {message}
          </motion.p>
        )}
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-sm ${isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-600'} px-3 py-2 rounded-lg z-10`}
        >
          {error}
        </motion.p>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col gap-2 z-10">
          <div className={`h-8 ${skeletonClass} rounded-md animate-pulse`}></div>
          <div className={`h-8 ${skeletonClass} rounded-md animate-pulse`}></div>
          <div className={`h-8 ${skeletonClass} rounded-md animate-pulse`}></div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && goals.length === 0 && (
        <motion.div 
          variants={itemVariants}
          className={`text-sm flex flex-col items-center justify-center py-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} z-10`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 13v3m0 0l-2-2m2 2l2-2" />
          </svg>
          <p className="text-center">You have no goals set yet.</p>
          <p className="text-center">Add a goal to get started with your journey.</p>
        </motion.div>
      )}

      {/* Goals List */}
      <div className="flex flex-col gap-y-2 z-10">
        {goals.map((goal, index) => (
          <motion.div 
            key={index} 
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`flex items-center justify-between ${
              isDarkMode 
                ? `${goal.completed ? 'bg-green-900/10 border-green-800/30' : 'bg-gray-700/80 border-gray-600/30'} border` 
                : `${goal.completed ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'} border`
            } p-3 rounded-lg transition-all duration-300`}
          >
            <label className="flex items-center gap-x-3 cursor-pointer flex-1">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => handleToggleGoal(goal.id)}
                  className="sr-only" // Hide the actual checkbox
                  disabled={isLoading}
                />
                <div 
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors duration-300 ${
                    goal.completed 
                      ? isDarkMode ? 'bg-green-600 border-green-500' : 'bg-green-500 border-green-400' 
                      : isDarkMode ? 'border-gray-500 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                >
                  {goal.completed && (
                    <motion.svg 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 text-white"
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>
              </div>
              <span
                className={`text-sm ${
                  goal.completed 
                    ? `line-through ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`
                    : isDarkMode ? 'text-gray-100' : 'text-gray-800'
                } transition-colors duration-300 flex-1`}
              >
                {goal.text}
              </span>
            </label>
           
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleRemoveGoal(goal.id)}
              className={`${
                isDarkMode 
                  ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' 
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              } p-1.5 rounded-md transition-colors duration-300`}
              disabled={isLoading}
              aria-label="Delete goal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Add Goal Section */}
      {isAdding ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 z-10"
        >
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Enter new goal..."
            className={`border rounded-lg px-3 py-2.5 text-sm flex-1 focus:outline-none focus:ring-2 ${
              isDarkMode 
                ? 'bg-gray-700/80 border-gray-600 text-gray-100 focus:ring-purple-500/50' 
                : 'bg-white border-gray-200 text-gray-900 focus:ring-purple-500/50'
            } transition-colors duration-300`}
            disabled={isLoading}
            autoFocus
          />
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleAddGoal}
            className={`${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            } text-white py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg`}
            disabled={isLoading || newGoal.trim() === ''}
            aria-label="Add goal"
          >
            <CheckIcon className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => {
              setIsAdding(false);
              setNewGoal('');
            }}
            className={`${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } py-2.5 px-4 rounded-lg transition-all duration-300`}
            disabled={isLoading}
            aria-label="Cancel"
          >
            <XMarkIcon className="w-5 h-5" />
          </motion.button>
        </motion.div>
      ) : (
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => setIsAdding(true)}
          className={`${
            isDarkMode 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
          } text-white flex items-center justify-center gap-x-2 py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg mt-2 z-10`}
          disabled={isLoading}
        >
          <PlusIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Add a new goal</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default PersonalGoals;