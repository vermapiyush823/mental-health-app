"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
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
  
  // Dynamic mood styles based on the current theme
  const getMoodStyle = (score: number) => {
    const styles = {
      1: isDarkMode ? "text-red-300 bg-red-900" : "text-red-800 bg-red-200", // Terrible
      2: isDarkMode ? "text-red-300 bg-red-900" : "text-red-700 bg-red-200", // Very Bad
      3: isDarkMode ? "text-orange-300 bg-orange-900" : "text-orange-700 bg-orange-200", // Bad
      4: isDarkMode ? "text-yellow-300 bg-yellow-900" : "text-yellow-800 bg-yellow-200", // Unhappy
      5: isDarkMode ? "text-gray-300 bg-gray-800" : "text-gray-700 bg-gray-200", // Neutral
      6: isDarkMode ? "text-green-300 bg-green-900" : "text-green-700 bg-green-200", // Okay
      7: isDarkMode ? "text-green-300 bg-green-900" : "text-green-600 bg-green-200", // Good
      8: isDarkMode ? "text-blue-300 bg-blue-900" : "text-blue-600 bg-blue-200", // Very Good
      9: isDarkMode ? "text-blue-300 bg-blue-900" : "text-blue-700 bg-blue-200", // Great
      10: isDarkMode ? "text-purple-300 bg-purple-900" : "text-purple-700 bg-purple-200" // Excellent
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
      const moodScores = userData?.user?.data?.moodScore || [7]; // Ensure it's an array
      const lastMood = moodScores.length > 0 ? moodScores[moodScores.length - 1] : null;
              
      if (lastMood) {
        setTodayMoodScore(lastMood?.score);
        setTodayMoodLabel(moodLabels[lastMood?.score]);
      } 
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
      const moodData = data.data;
      console.log("Mood Data", moodData);
      setTodayMoodScore(Math.round(moodData));
      setTodayMoodLabel(moodLabels[Math.round(moodData)]);
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
  const cardBgClass = isDarkMode ? "bg-gray-800" : "bg-white";
  const headingClass = isDarkMode ? "text-white" : "text-gray-900";
  const subTextClass = isDarkMode ? "text-gray-400" : "text-gray-500";
  const buttonBgClass = isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black";
  const pulseClass = isDarkMode ? "bg-gray-600" : "bg-gray-400";
  
  return (
    <div className={`flex flex-col shadow-md md:flex-row justify-between ${cardBgClass} w-[95%] rounded-md p-5 items-center md:items-start gap-4`}>
   
      {/* Profile Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full md:w-1/2">
        {loading ? (
          <div className={`animate-pulse ${pulseClass} w-20 h-20 sm:w-24 sm:h-24 rounded-full`}></div>
        ) : (
          <img 
            src={newImg} 
            alt="Profile" 
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover" 
          />
        )}
        <div className="text-center sm:text-left">
          {loading ? (
            <div className={`animate-pulse ${pulseClass} h-5 w-20 rounded-md`}></div>
          ) : (
            <h2 className={`text-xl font-bold ${headingClass}`}>{name}</h2>
          )}              
          {loading ? (
            <div className={`animate-pulse ${pulseClass} h-4 w-36 rounded-md mt-1`}></div>
          ) : (
            <p className={`text-md ${subTextClass}`}>Member since {memberDate}</p>
          )}
          {loading ? (
            <div className={`animate-pulse ${pulseClass} h-6 w-28 rounded-xl mt-2`}></div>
          ) : (
            <p className={`text-sm font-bold rounded-xl py-1 px-2 mt-2 inline-block ${getMoodStyle(todayMoodScore)}`}>
              Feeling {todayMoodLabel} Today
            </p>
          )}
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="w-full md:w-auto flex justify-center md:justify-end">
        {loading ? (
          <div className={`animate-pulse ${pulseClass} h-9 w-24 rounded-md`}></div>
        ) : (
          <Link 
            className={`${buttonBgClass} flex items-center gap-x-2 px-4 py-2 rounded-md transition-colors`}
            href="/profile"
          >
            <PencilSquareIcon className="w-5 h-5" />
            <span className="text-sm">Edit Profile</span>
          </Link>
        )}
      </div>
    </div>
  )
}

export default Dashboard_profile
