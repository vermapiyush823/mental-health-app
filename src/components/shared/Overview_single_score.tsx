'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface Props {
    catgory: string,
    score: string | number
}

const overview_single_score = ({ catgory, score }: Props) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only run on client, since we need to access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial client render, use a safe default that matches the server
  // Don't conditionally render the component, just its styling
  const isDarkMode = mounted && resolvedTheme === 'dark';

  return (
    <div className={`flex flex-col ${mounted ? (isDarkMode ? 'bg-gray-700/50 text-gray-100' : 'bg-black/10 text-gray-900') : 'bg-black/10 text-gray-900'} p-4 rounded-lg w-full h-full transition-colors duration-300`}>
        <p className={`text-sm ${mounted ? (isDarkMode ? 'text-gray-300' : 'text-gray-500') : 'text-gray-500'}`}>{catgory}</p>
        <p className='text-lg font-bold'>
            {
                catgory === 'Weekly Mood Score' ? (
                    score+'/10'):
                catgory === 'Average Sleep Hours' ? (
                    score + ' hours'):
                catgory === 'Stress Level' ? (
                    score
                ) : (
                    ''
                )
            }
        </p>
    </div>
  )
}

export default overview_single_score