"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { PencilSquareIcon } from '@heroicons/react/24/outline'

interface ProfileProps {
  userId: string;
}

const Dashboard_profile = ({userId}:ProfileProps) => {
  const [name, setName] = useState<string>("");
  const [newImg, setNewImg] = useState<string>("https://api.dicebear.com/6.x/avataaars/svg");
  const [memberDate, setMemberDate] = useState<string>("");
  const [todayMoodScore, setTodayMoodScore] = useState<number>(7);
  const [todayMoodLabel, setTodayMoodLabel] = useState<string>("Good");
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);
  const { resolvedTheme } = useTheme();
  console.log(todayMoodScore)
  // Make sure component is mounted before using theme
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const moodLabels = [
    "Terrible", // 1
    "Very Bad", // 2
    "Bad",      // 3
    "Unhappy",  // 4
    "Neutral",  // 5
    "Okay",     // 6
    "Good",     // 7
    "Very Good",// 8
    "Great",    // 9
    "Excellent" // 10
  ];
  
  // Define dynamic mood styles based on current theme
  const isDarkMode = mounted && resolvedTheme === 'dark';
  
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
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
    }
  };
  
  // Dynamic mood styles based on the current theme
  const getMoodStyle = (score: number) => {
    const baseStyle = "font-medium shadow-md transition-all duration-300";
    const styles = {
      1: isDarkMode ? `${baseStyle} text-red-300 bg-red-900/50 border border-red-700` : `${baseStyle} text-red-800 bg-red-100 border border-red-200`, // Terrible
      2: isDarkMode ? `${baseStyle} text-red-300 bg-red-900/50 border border-red-700` : `${baseStyle} text-red-700 bg-red-100 border border-red-200`, // Very Bad
      3: isDarkMode ? `${baseStyle} text-orange-300 bg-orange-900/50 border border-orange-700` : `${baseStyle} text-orange-700 bg-orange-100 border border-orange-200`, // Bad
      4: isDarkMode ? `${baseStyle} text-yellow-300 bg-yellow-900/50 border border-yellow-700` : `${baseStyle} text-yellow-800 bg-yellow-100 border border-yellow-200`, // Unhappy
      5: isDarkMode ? `${baseStyle} text-gray-300 bg-gray-800/50 border border-gray-600` : `${baseStyle} text-gray-700 bg-gray-100 border border-gray-200`, // Neutral
      6: isDarkMode ? `${baseStyle} text-green-300 bg-green-900/50 border border-green-700` : `${baseStyle} text-green-700 bg-green-100 border border-green-200`, // Okay
      7: isDarkMode ? `${baseStyle} text-green-300 bg-green-900/50 border border-green-700` : `${baseStyle} text-green-600 bg-green-100 border border-green-200`, // Good
      8: isDarkMode ? `${baseStyle} text-blue-300 bg-blue-900/50 border border-blue-700` : `${baseStyle} text-blue-600 bg-blue-100 border border-blue-200`, // Very Good
      9: isDarkMode ? `${baseStyle} text-blue-300 bg-blue-900/50 border border-blue-700` : `${baseStyle} text-blue-700 bg-blue-100 border border-blue-200`, // Great
      10: isDarkMode ? `${baseStyle} text-purple-300 bg-purple-900/50 border border-purple-700` : `${baseStyle} text-purple-700 bg-purple-100 border border-purple-200` // Excellent
    };
    
    return styles[score as keyof typeof styles] || 
      (isDarkMode ? "text-gray-300 bg-gray-700" : "text-gray-700 bg-gray-200");
  };
    
  const fetchUserDetails = async () => {
    try{
      setLoading(true);
      const response = await fetch("/api/get/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
          
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData.message);
        setLoading(false);
        return;
      }
      const userData = await response.json();
      setName(userData.user.data.name);
      setNewImg(userData.user.data.image ? userData.user.data.image : newImg);
      setMemberDate(
        userData.user.data.createdAt
          ? new Date(userData.user.data.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "Unknown"
      );
      setLoading(false);
              
    }
    catch(err){
      console.error("Error during fetching user details", err);
      setLoading(false);
    }
  }
  
  // Fetch mood details on initial render
  const fetchMoodDetails = async () => {
    try {
      const response = await fetch(`/api/mood-track/get-mood-today?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch mood details");
      }
      const data = await response.json();
      console.log("API Response:", data);
      
      if (data.success && data.data) {
        const moodData = data.data;
        console.log("Mood Data:", moodData);
        
        setTodayMoodScore(Math.round(moodData)-1);
        setTodayMoodLabel(moodLabels[Math.round(moodData)-1]);
      } else {
        console.error("No mood data available or request unsuccessful");
      }
    } catch (error) {
      console.error("Error fetching mood details:", error);
    }
  };

  // Fetch user details on initial render
  useEffect(() => {
    fetchUserDetails();
    fetchMoodDetails();
  }, []);

    
  
  // Define theme-dependent styles
  const cardBgClass = isDarkMode 
    ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50" 
    : "bg-white/90 backdrop-blur-sm shadow-xl border border-gray-100";
  const headingClass = isDarkMode ? "text-white" : "text-gray-900";
  const subTextClass = isDarkMode ? "text-gray-400" : "text-gray-500";
  const buttonBgClass = isDarkMode 
    ? "bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white" 
    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white";
  const pulseClass = isDarkMode ? "bg-gray-600" : "bg-gray-400";


  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`flex flex-col shadow-lg md:flex-row justify-between ${cardBgClass} w-[95%] rounded-xl p-6 items-center md:items-start gap-4 relative overflow-hidden`}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 pointer-events-none"></div>
   
      {/* Profile Section */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full md:w-1/2 z-10"
      >
        {loading ? (
          <div className={`animate-pulse ${pulseClass} w-20 h-20 sm:w-24 sm:h-24 rounded-full`}></div>
        ) : (
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative overflow-hidden rounded-full border-2 border-purple-300/50 shadow-md"
            >
              <img 
                src={newImg} 
                alt="Profile" 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent"></div>
            </motion.div>
          </div>
        )}
        <div className="text-center sm:text-left">
          {loading ? (
            <div className={`animate-pulse ${pulseClass} h-7 w-36 rounded-md mb-2`}></div>
          ) : (
            <motion.h2 
              variants={itemVariants}
              className={`text-xl font-bold tracking-wide ${headingClass}`}
            >
              {name}
            </motion.h2>
          )}              
          {loading ? (
            <div className={`animate-pulse ${pulseClass} h-4 w-36 rounded-md mt-1 mb-3`}></div>
          ) : (
            <motion.p 
              variants={itemVariants}
              className={`text-md ${subTextClass}`}
            >
              Member since {memberDate}
            </motion.p>
          )}
          {loading ? (
            <div className={`animate-pulse ${pulseClass} h-8 w-36 rounded-xl mt-2`}></div>
          ) : (
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-1"
            >
              <span className={`text-sm rounded-xl py-1.5 px-4 ${getMoodStyle(Math.round(todayMoodScore))}`}>
                Feeling {todayMoodLabel} Today
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Edit Profile Button */}
      <motion.div 
        variants={itemVariants} 
        className="w-full md:w-auto flex justify-center md:justify-end items-center z-10"
      >
        {loading ? (
          <div className={`animate-pulse ${pulseClass} h-10 w-32 rounded-lg`}></div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              className={`${buttonBgClass} flex items-center gap-x-2 px-6 py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl`}
              href="/profile"
            >
              <PencilSquareIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Edit Profile</span>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

// Helper function to get mood color indicator based on score
const getMoodColorIndicator = (score: number) => {
  const colorMap: {[key: number]: string} = {
    1: "bg-red-500", // Terrible
    2: "bg-red-500", // Very Bad
    3: "bg-orange-500", // Bad
    4: "bg-yellow-500", // Unhappy
    5: "bg-gray-400", // Neutral
    6: "bg-green-400", // Okay
    7: "bg-green-500", // Good
    8: "bg-blue-400", // Very Good
    9: "bg-blue-500", // Great
    10: "bg-purple-500" // Excellent
  };
  
  return colorMap[score] || "bg-gray-400";
};

export default Dashboard_profile
