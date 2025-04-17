"use client"
import React from 'react'
import { RecommendationIcons } from '../../lib/RecommendationIcons';
import { useTheme } from "next-themes";
import { motion } from 'framer-motion';

interface Recommendations {
    priority: string;
    recommendation: string;
    category: string;
}

interface RecommendationProps {
    recommendations: Recommendations[];
}

const Recommendation = ({ recommendations }: RecommendationProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDarkMode = mounted && resolvedTheme === 'dark';
  
  // Animation variants for recommendations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  // Check if recommendations exist and has items
  if (!recommendations || recommendations.length === 0) {
    return <div className={`text-center py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No recommendations available</div>;
  }

  return (
    <div className="w-full">
      <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Recommendations</h3>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {recommendations.map((rec, index) => (
          <motion.div 
            key={`recommendation-${index}`}
            variants={itemVariants}
            className={`${
              isDarkMode 
                ? 'bg-gray-800/80 border-gray-700 hover:bg-gray-700/90' 
                : 'bg-white border-gray-100 hover:shadow-md'
            } p-5 rounded-xl border shadow-sm transition-all duration-300 transform hover:-translate-y-1 ${
              rec.priority === 'High' 
                ? `${isDarkMode ? 'border-l-4 border-l-red-600' : 'border-l-4 border-l-red-500'}` 
                : rec.priority === 'Medium' 
                  ? `${isDarkMode ? 'border-l-4 border-l-amber-600' : 'border-l-4 border-l-amber-500'}` 
                  : `${isDarkMode ? 'border-l-4 border-l-green-600' : 'border-l-4 border-l-green-500'}`
            }`}
          >
            <div className="flex items-start min-h-[60px]">
              <div className={`mr-4 ${
                rec.priority === 'High' ? 'text-red-500' : 
                rec.priority === 'Medium' ? 'text-amber-500' : 
                'text-green-500'
              }`}>
                {
                  rec.category === 'Exercise' ? RecommendationIcons.exercise:
                  rec.category === 'Nutrition' ? RecommendationIcons.nutrition:
                  rec.category === 'Sleep' ? RecommendationIcons.sleep :
                  rec.category === 'Outdoor Time' ? RecommendationIcons.outdoor:
                  rec.category === 'Stress Management' ? RecommendationIcons.stress:
                  rec.category === 'Hydration' ? RecommendationIcons.water :
                  rec.category === 'Screen Time' ? RecommendationIcons.screen :
                  ''
                }
              </div>
              <div>
                <div className="flex items-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.priority === 'High' 
                      ? `${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'}` 
                      : rec.priority === 'Medium' 
                        ? `${isDarkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-800'}` 
                        : `${isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'}`
                  }`}>
                    {rec.priority}
                  </span>
                  <h4 className={`text-sm font-semibold ml-2 ${
                    rec.priority === 'High' 
                      ? `${isDarkMode ? 'text-red-400' : 'text-red-700'}` 
                      : rec.priority === 'Medium' 
                        ? `${isDarkMode ? 'text-amber-400' : 'text-amber-800'}` 
                        : `${isDarkMode ? 'text-green-400' : 'text-green-700'}`
                  }`}>{rec.category}</h4>
                </div>
                <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {rec.recommendation}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default Recommendation