'use client'
import React, { useEffect, useState } from 'react'
import MentalHealthChart from './Mental_Health_Charts'
import Overview_single_score from './Overview_single_score'
import Ai_insights from './Ai_insights'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'

interface OverviewProps {
  userId: string;
}

const Overview = ({ userId }: OverviewProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isDarkMode = mounted && resolvedTheme === 'dark';
  
  const [data, setData] = React.useState([
    {
      id: "Mood Score",
      color: "hsl(200, 70%, 50%)",
      data: [
        { x: "Mon", y: 7 },
        { x: "Tue", y: 8 },
        { x: "Wed", y: 6 },
        { x: "Thu", y: 9 },
        { x: "Fri", y: 5 },
        { x: "Sat", y: 8 },
        { x: "Sun", y: 7 },
      ],
    },
  ]);
  const [moodScore, setMoodScore] = React.useState(0);
  const [sleepQuality, setSleepQuality] = React.useState(0);
  const [stressLevel, setStressLevel] = React.useState('Low');
  const [recommendations, setRecommendations] = React.useState([
    'You are doing great',
    'Keep up the good work',
    'You are on the right track'
  ]);

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

  const titleVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        duration: 0.4
      }
    }
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  // Only run on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Fetch data from the server
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/mood-track/get-week-data?userId=${userId}`);
        const result = await response.json();
        const transformedData = result.data.map((item: any) => ({
          x: new Date(item.date).toLocaleDateString("en-US",
            { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" },
          ),
          y: item.score,
        }));

        const formattedData = [
          {
            id: "Mood Score",
            color: isDarkMode ? "hsl(250, 70%, 70%)" : "hsl(260, 70%, 60%)",
            data: transformedData,
          },
        ];
        setData(formattedData);
        
        // Calculate the average mood score
        const totalMoodScore = result.data.reduce((acc: number, item: any) => acc + item.score, 0);
        const averageMoodScore = totalMoodScore / result.data.length;
        setMoodScore(Number(averageMoodScore.toFixed(1)));
        
        // Calculate the average sleep hours
        const totalSleep = result.data.reduce((acc: number, item: any) => acc + item.sleep, 0);
        const averageSleep = totalSleep / result.data.length;
        setSleepQuality(Number(averageSleep.toFixed(1)));
        
        // Get the most recent stress level
        setStressLevel(result.data[0].stress);
        
        // Format recommendations
        const formattedRecommendations = result.data[0].recommendations.map((rec: any) => rec.recommendation);
        setRecommendations(formattedRecommendations);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    if (mounted) {
      fetchData(); // Call the fetch function only when mounted
    }
  }, [userId, mounted, isDarkMode]);

  // Main container styles
  const containerClasses = `flex flex-col gap-y-5 justify-center ${
    isDarkMode 
      ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 text-gray-100' 
      : 'bg-white/90 backdrop-blur-sm border border-gray-100 text-gray-900'
  } h-full rounded-lg p-5 transition-colors duration-300 shadow-lg relative overflow-hidden`;

  // Add subtle gradient overlay
  const gradientOverlay = `absolute inset-0 bg-gradient-to-br ${
    isDarkMode 
      ? 'from-purple-500/5 to-indigo-500/5' 
      : 'from-indigo-500/5 to-purple-500/5'
  } pointer-events-none`;

  // Loading skeleton styles
  const skeletonClass = isDarkMode ? 'bg-gray-700/70' : 'bg-gray-200/70';

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={containerClasses}

    >
      {/* Gradient overlay */}
      <div className={gradientOverlay}></div>
      
      <motion.h1 
        variants={titleVariants} 
        className='text-lg font-bold tracking-wide flex items-center gap-2 z-10'
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
          Mental Health Overview
        </span>
      </motion.h1>

      {isLoading ? (
        <>
          <div className={`${skeletonClass} h-64 rounded-xl animate-pulse`}></div>
          <div className="grid justify-center items-center gap-5 grid-cols-2 sm:grid-cols-3 w-full">
            <div className={`${skeletonClass} h-24 rounded-lg animate-pulse`}></div>
            <div className={`${skeletonClass} h-24 rounded-lg animate-pulse`}></div>
            <div className={`${skeletonClass} h-24 rounded-lg animate-pulse`}></div>
          </div>
          <div className={`${skeletonClass} h-32 rounded-xl animate-pulse`}></div>
        </>
      ) : (
        <>
          <MentalHealthChart chartData={data} />
          
          <motion.div 
            variants={gridVariants}
            className='grid justify-center items-center gap-5 grid-cols-2 sm:grid-cols-3 w-full z-10'
          >
            <Overview_single_score catgory='Weekly Mood Score' score={moodScore}/>
            <Overview_single_score catgory='Average Sleep Hours' score={sleepQuality}/>
            <Overview_single_score catgory='Stress Level' score={stressLevel}/>
          </motion.div>
          
          <Ai_insights insights={recommendations} />
        </>
      )}
    </motion.div>
  )
}

export default Overview