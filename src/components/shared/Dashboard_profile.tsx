"use client"
import React, { useEffect } from 'react'
import Edit_icon from '../../../assets/icons/Edit.svg'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
interface ProfileProps {
  userId: string;
}
const Dashboard_profile = ({userId}:ProfileProps) => {
  const [name, setName] = useState<string>("");
  const [newImg, setNewImg] = useState<string>("https://api.dicebear.com/6.x/avataaars/svg");
  const [memberDate, setMemberDate] = useState<string>("");
  const [todayMoodScore, setTodayMoodScore] = useState<number>(7);
  const [todayMoodLabel, setTodayMoodLabel] = useState<string>("Good");
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
  const moodStyles: { [key: number]: string } = {
    1: "text-red-800 bg-red-200",     // Terrible
    2: "text-red-700 bg-red-200",     // Very Bad
    3: "text-orange-700 bg-orange-200", // Bad
    4: "text-yellow-800 bg-yellow-200", // Unhappy
    5: "text-gray-700 bg-gray-200",   // Neutral
    6: "text-green-700 bg-green-200", // Okay
    7: "text-green-600 bg-green-200", // Good
    8: "text-blue-600 bg-blue-200",   // Very Good
    9: "text-blue-700 bg-blue-200",   // Great
    10: "text-purple-700 bg-purple-200", // Excellent
  };
    const fetchUserDetails = async () => {
          try{
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
                      return;
                  }
                  const userData = await response.json();
                  setName(userData.user.data.name);
                  setNewImg(userData.user.data.image);
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
                    
          }
          catch(err){
              console.error("Error during fetching user details", err);
          }
      }
      // Fetch user details on initial render
      useEffect(() => {
          fetchUserDetails();
      }, []);
  
  return (
    <div className="flex flex-col shadow-md md:flex-row justify-between bg-white w-[95%] rounded-md p-5 items-center md:items-start gap-4">
      {/* Profile Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full md:w-1/2">
        <img 
          src={newImg} 
          alt="Profile" 
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full"
        />
        <div className="text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-bold">{name}</h3>
          <p className="text-md text-gray-500">Member since {memberDate}</p>
          <p
      className={`text-sm font-bold rounded-xl py-1 px-2 mt-2 inline-block ${
        moodStyles[todayMoodScore] || "text-gray-700 bg-gray-200"
      }`}
    >
      Feeling {todayMoodLabel} Today
    </p>
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="w-full md:w-auto flex justify-center md:justify-end">
        <Link className="bg-gray-200 flex items-center gap-x-2 text-black px-4 py-2 rounded-md"
          href="/profile"
        >
          <Image src={Edit_icon} alt="edit" width={18} height={18} />
          <span className="text-sm">Edit Profile</span>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard_profile
