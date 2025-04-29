"use client";
import React, { useState, useEffect } from 'react';
import Resource_Card from './Resource_Card';
import recource from '../../../assets/icons/resource.png';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FormIcons } from '../../lib/FormIcons';

interface Resource {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  timeToRead: string;
  tags: string[];
}

interface ResourcesListProps {
  userId: string | null;
}

const ResourcesList = ({ userId }: ResourcesListProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Handle mounting for theme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resources/get');
        if (!response.ok) throw new Error('Failed to fetch resources');
        const data = await response.json();
        setResources(data);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setTimeout(() => setLoading(false), 2000);
      }
    };

    fetchResources();
  }, []);

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

  // Pre-computed animation values for loading dots
  // This ensures consistent server and client rendering
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

  return (
    <div className="h-fit w-full sm:px-6 relative overflow-hidden">
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

      {/* Main content */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full mx-auto mb-12 max-w-7xl relative z-10"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          <h1 className={`text-2xl sm:text-3xl font-bold ${
            isDarkMode ? 'text-purple-300' : 'text-indigo-700'
          }`}>Mental Health Resources</h1>
          
          {userId==='680c2a2fae30ecf1b499d8cc' && (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                href="/resources/add" 
                className={`${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                } text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Resource
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Content */}
        {loading ? (
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center justify-center py-12"
          >
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
              Loading resources...
            </motion.h3>
            
            <motion.p 
              variants={itemVariants} 
              className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              } text-center max-w-md`}
            >
              We're preparing a collection of mental health resources for you.
            </motion.p>
            
            
          </motion.div>
        ) : error ? (
          <motion.div 
            variants={itemVariants}
            className={`text-center py-20 ${
              isDarkMode ? 'bg-gray-800/80' : 'bg-white/90'
            } backdrop-blur-sm rounded-xl border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-100'
            } shadow-lg`}
          >
            <h3 className="text-xl font-medium text-red-500 mb-2">{error}</h3>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className={`mt-4 px-4 py-2 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              } text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300`}
            >
              Try Again
            </motion.button>
          </motion.div>
        ) : resources.length === 0 ? (
          <motion.div 
            variants={itemVariants}
            className={`text-center py-20 ${
              isDarkMode ? 'bg-gray-800/80 text-gray-200' : 'bg-white/90 text-gray-800'
            } backdrop-blur-sm rounded-xl border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-100'
            } shadow-lg`}
          >
            <h3 className={`text-xl font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              No resources available yet
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Check back later for helpful mental health resources.
            </p>
            {userId && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 inline-block"
              >
                <Link 
                  href="/resources/add" 
                  className={`${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                  } text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300`}
                >
                  Add First Resource
                </Link>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {resources.map((resource) => (
              <Resource_Card 
                key={resource._id}
                title={resource.title}
                description={resource.description}
                imageUrl={resource.imageUrl || recource.src}
                link={`/resources/${userId}/${resource._id}`}
                timeToRead={resource.timeToRead || "5 min read"}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ResourcesList;
