"use client";
import Resource from '@/components/shared/Resource';
import React, { useEffect, useState } from 'react';
import resourceDefaultImg from '../../../../../../assets/icons/resource.png';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

interface ResourceData {
  title: string;
  imageUrl: string;
  description: string;
  sections: Array<{
    heading: string;
    description?: string;
    list?: string[];
  }>;
  relatedArticles?: Array<{
    title: string;
    description: string;
    imageUrl?: string;
    link?: string;
    timeToRead?: string;
  }>;
  resourceId: string;
  timeToRead: string;
  category: string;
  tags: string[];
  userId?: string;
  bookmarkedBy?: string[];
}
const ResourcePage = () => {
  const params = useParams();
  const resourceId = params.resourceId as string;
  const userId = params.userId as string;
  const [resourceData, setResourceData] = useState<ResourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Handle mounting for theme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';
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
  useEffect(() => {
    const fetchResourceData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/resources/get-resource', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resourceId }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch resource data');
        }
        const data = await response.json();
        setResourceData(data);
      } catch (error:any) {
        console.error('Error fetching resource data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResourceData();
  }, [resourceId, userId]);

  if (loading) return (
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
                              Loading your resource...
                            </motion.h3>
                            
                            <motion.p 
                              variants={itemVariants} 
                              className={`${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              } text-center max-w-md`}
                            >
                              Please wait while we gather the information for you.
                            </motion.p>
                </motion.div>

  );

  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className='flex flex-col mt-4 sm:mt-8 px-4 gap-y-5 w-full items-center'>
      {resourceData && (
        <Resource
          title={resourceData.title}
          imageUrl={resourceData.imageUrl || resourceDefaultImg.src}
          sections={resourceData.sections}
          relatedArticles={resourceData.relatedArticles}
          resourceId={resourceId}
          timeToRead={resourceData.timeToRead}
          category={resourceData.category}
          tags={resourceData.tags}
          userId={userId}
          description={resourceData.description}
          bookmarkedBy={resourceData.bookmarkedBy}
          />
      )}
    </div>
  );
};

export default ResourcePage;
