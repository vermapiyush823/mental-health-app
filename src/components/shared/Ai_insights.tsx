'use client';
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface Props {
    insights: string[]
}
const Ai_insights = (
    {insights}: Props
) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Only run on client side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDarkMode = mounted && resolvedTheme === 'dark';

  return (
    <div className='flex flex-col w-full'>
        <h1 className='text-sm font-bold'>AI Insights</h1>
        <div className='flex flex-col gap-y-1 mt-1'>
            {
                insights.map((insight, index) => {
                    return (
                        <ul key={index} >
                            <li className={`text-sm ${mounted ? (isDarkMode ? 'text-gray-300' : 'text-gray-500') : 'text-gray-500'} 
                                list-disc list-inside ml-1 transition-colors duration-300
                            `}>{insight}</li>
                        </ul>
                    )
                })
            }
            </div>
    </div>
  )
}

export default Ai_insights