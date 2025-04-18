'use client'
import React, { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { ChatBubbleBottomCenterTextIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline'

const Chat_Features = () => {
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();
    
    // Make sure component is mounted before using theme
    useEffect(() => {
        setMounted(true);
    }, []);

    // Define theme-based styles after component is mounted
    const isDarkMode = mounted && resolvedTheme === 'dark';

    // Card background based on theme
    const cardBgClass = isDarkMode 
        ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 text-gray-100 shadow-lg" 
        : "bg-white/90 backdrop-blur-sm border border-gray-100 text-gray-900 shadow-xl";

    // Feature card styles
    const featureCardClass = isDarkMode 
        ? "bg-gray-700/60 border border-gray-600/40 hover:bg-gray-700/80" 
        : "bg-gray-50/90 border border-gray-200/40 hover:bg-gray-100/80";
        
    // Gradient overlay
    const gradientOverlay = `absolute inset-0 bg-gradient-to-br ${
        isDarkMode 
        ? 'from-purple-500/5 to-indigo-500/5' 
        : 'from-indigo-500/5 to-purple-500/5'
    } pointer-events-none rounded-lg`;

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
                stiffness: 100,
                damping: 15 
            }
        }
    };

    const features = [
        {
            title: 'AI-Powered Analysis',
            description: 'Real-time sentiment and emotion analysis of your messages',
            icon: <SparklesIcon className="w-5 h-5" />
        },
        {
            title: '24/7 Support',
            description: 'Always available to help with your mental health needs',
            icon: <ClockIcon className="w-5 h-5" />
        },
        {
            title: 'Personalized Responses',
            description: 'Tailored support based on your history and preferences',
            icon: <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
        }
    ];

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
            <motion.div variants={itemVariants} className="z-10">
                <h1 className="text-lg font-bold tracking-wide">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                        Chat Features
                    </span>
                </h1>
            </motion.div>
            
            {/* List of Chat Features */}
            <div className="flex flex-col gap-y-3 z-10">
                {features.map((feature, index) => (
                    <motion.div 
                        key={index} 
                        variants={itemVariants}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className={`flex gap-x-3 p-4 ${featureCardClass} rounded-lg transition-all duration-300`}
                    >
                        <div className={`${isDarkMode ? 'text-purple-400' : 'text-indigo-500'} mt-0.5`}>
                            {feature.icon}
                        </div>
                        <div>
                            <h2 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                {feature.title}
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}

export default Chat_Features