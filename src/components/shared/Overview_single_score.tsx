'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

interface Props {
    catgory: string,
    score: string | number
}

const Overview_single_score = ({ catgory, score }: Props) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only run on client, since we need to access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial client render, use a safe default that matches the server
  const isDarkMode = mounted && resolvedTheme === 'dark';
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 10,
        duration: 0.4
      }
    }
  };
  
  // Get style based on category and score
  const getScoreStyle = () => {
    if (catgory === 'Weekly Mood Score') {
      const score_num = typeof score === 'string' ? parseFloat(score) : score;
      if (score_num >= 8) return isDarkMode ? 'text-purple-300' : 'text-purple-600';
      if (score_num >= 6) return isDarkMode ? 'text-blue-300' : 'text-blue-600';
      if (score_num >= 4) return isDarkMode ? 'text-yellow-200' : 'text-yellow-600';
      return isDarkMode ? 'text-red-300' : 'text-red-600';
    }
    if (catgory === 'Stress Level') {
      if (score === 'Low') return isDarkMode ? 'text-green-300' : 'text-green-600';
      if (score === 'Medium') return isDarkMode ? 'text-yellow-200' : 'text-yellow-600';
      return isDarkMode ? 'text-red-300' : 'text-red-600';
    }
    // Default for sleep or other metrics
    return isDarkMode ? 'text-blue-300' : 'text-blue-600';
  };
  
  // Generate icon based on category
  const getIcon = () => {
    if (catgory === 'Weekly Mood Score') {
      const score_num = typeof score === 'string' ? parseFloat(score) : score;
      if (score_num >= 8) return '😄';
      if (score_num >= 6) return '🙂';
      if (score_num >= 4) return '😐';
      return '😔';
    }
    if (catgory === 'Average Sleep Hours') return '💤';
    if (catgory === 'Stress Level') {
      if (score === 'Low') return '✨';
      if (score === 'Medium') return '⚡';
      return '🔥';
    }
    return '📊';
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ scale: 1.03 }}
      className={`flex flex-col ${
        isDarkMode 
          ? 'bg-gray-800/90 border border-gray-700/50 shadow-lg text-gray-100' 
          : 'bg-white/90 border border-gray-100 shadow-xl text-gray-900'
      } p-4 rounded-lg w-full h-full transition-all duration-300`}
    >
      <span className="text-2xl mb-1">{getIcon()}</span>
      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{catgory}</p>
      <p className={`text-xl font-bold mt-1 ${getScoreStyle()}`}>
        {
          catgory === 'Weekly Mood Score' ? (
            score+'/10'):
          catgory === 'Average Sleep Hours' ? (
            score + ' hours'):
          catgory === 'Stress Level' ? (
            score
          ) : (
            score
          )
        }
      </p>
    </motion.div>
  );
};

export default Overview_single_score;