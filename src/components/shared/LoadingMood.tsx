import React, { useState, useEffect } from 'react'
import { FormIcons } from '../../lib/FormIcons';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

const LoadingMood = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Handle mounting for theme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';
  
  // Pre-computed animation values to prevent hydration errors
  const animationDelays = [
    "0.2s", "0.4s", "0.6s", "0.8s", "1.0s", "0.3s", "0.5s", "0.7s", "0.9s", "0.1s",
    "0.25s", "0.45s", "0.65s", "0.85s", "1.05s", "0.35s", "0.55s", "0.75s", "0.95s", "0.15s",
    "0.3s", "0.5s", "0.7s", "0.9s", "0.1s"
  ];
  
  const animationDurations = [
    "1.5s", "1.7s", "1.9s", "2.1s", "1.6s", "1.8s", "2.0s", "1.5s", "1.7s", "1.9s",
    "2.1s", "1.6s", "1.8s", "2.0s", "1.5s", "1.7s", "1.9s", "2.1s", "1.6s", "1.8s",
    "2.0s", "1.5s", "1.7s", "1.9s", "2.1s"
  ];

  // Animations for page elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.08,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col items-center justify-center py-12"
    >
      {/* Animated background blobs (similar to auth pages) */}
      <div 
        className={`fixed rounded-full filter blur-[80px] opacity-40 ${
          isDarkMode 
            ? 'bg-blue-500/20 top-1/4 left-1/4 w-80 h-80' 
            : 'bg-pink-500/20 top-1/4 left-1/4 w-80 h-80'
        }`}
        style={{
          animation: "blob-move 7s infinite ease-in-out",
          animationDelay: "0ms"
        }}
      ></div>
      <div 
        className={`fixed rounded-full filter blur-[80px] opacity-40 ${
          isDarkMode 
            ? 'bg-indigo-500/20 top-1/3 right-1/3 w-96 h-96' 
            : 'bg-indigo-500/20 top-1/3 right-1/3 w-96 h-96'
        }`}
        style={{
          animation: "blob-move 7s infinite ease-in-out",
          animationDelay: "2000ms"
        }}
      ></div>
      
      {/* Loading grid */}
      <motion.div variants={itemVariants} className="mb-8 relative">
        <div className="grid grid-cols-5 gap-1.5">
            {/* Use fixed number of dots (25) to prevent hydration errors */}
            {[...Array(25)].map((_, i) => (
                <div 
                    key={i}
                    className={`w-3 h-3 md:w-7 md:h-7 rounded-md ${
                      isDarkMode ? 'bg-purple-500' : 'bg-indigo-600'
                    } opacity-0 animate-gridFadeIn`} 
                    style={{
                        animationDelay: animationDelays[i % animationDelays.length],
                        animationDuration: animationDurations[i % animationDurations.length],
                        animationIterationCount: 'infinite'
                    }}
                />
            ))}
        </div>
      </motion.div>

      {/* Text Content */}
      <motion.h3 
        variants={itemVariants} 
        className={`text-xl font-bold ${
          isDarkMode ? 'text-purple-300' : 'text-indigo-700'
        } mb-2`}
      >
        Analyzing your data...
      </motion.h3>
      
      <motion.p 
        variants={itemVariants} 
        className={`${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        } text-center max-w-md`}
      >
        We're calculating your personalized mood score and generating recommendations based on your inputs.
      </motion.p>
      
      <motion.div 
        variants={itemVariants}
        className={`mt-6 ${
          isDarkMode 
            ? 'bg-gray-800/60 border border-gray-700' 
            : 'bg-indigo-50 border border-indigo-100'
        } p-4 rounded-lg backdrop-blur-sm`}
      >
        <div className="flex items-center">
            <div className={`${
              isDarkMode ? 'text-purple-400' : 'text-indigo-500'
            } mr-3 animate-pulse`}>
              {FormIcons.sparkle}
            </div>
            <p className={`text-sm ${
              isDarkMode ? 'text-purple-300' : 'text-indigo-700'
            }`}>
                This usually takes just a moment...
            </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default LoadingMood