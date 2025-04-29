import Link from "next/link";
import { useEffect, useState } from "react";
import Resource_Card from "./Resource_Card";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

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

interface ResourceProps extends ResourceData {
  resourceId: string;
  userId: string;
}

const Resource = ({
  title,
  imageUrl,
  description,
  sections,
  relatedArticles = [],
  resourceId,
  timeToRead,
  category,
  tags,
  userId,
  bookmarkedBy = []
}: ResourceProps) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Handle mounting for theme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';

  useEffect(() => {
    if (userId && resourceId) {
      setIsBookmarked(bookmarkedBy.includes(userId));
      console.log(description);
      console.log(bookmarkedBy);
      console.log(title);
      // Also fetch latest status from API
      const checkBookmarkStatus = async () => {
        try {
          const response = await fetch(`/api/resources/bookmark?resourceId=${resourceId}&userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            setIsBookmarked(data.isBookmarked);
          }
        } catch (error) {
          console.error("Error checking bookmark status:", error);
        }
      };
      
      checkBookmarkStatus();
    }
  }, [userId, resourceId]); // Remove bookmarkedBy from dependency array

  const updateScrollProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scroll = (scrollTop / docHeight) * 100;
    setScrollProgress(scroll);
  };

  useEffect(() => {
    window.addEventListener("scroll", updateScrollProgress);
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  const toggleBookmark = async () => {
    if (!userId || isBookmarking) return;
    
    try {
      setIsBookmarking(true);
      const response = await fetch('/api/resources/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resourceId, userId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      } else {
        console.error('Failed to toggle bookmark');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

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
    <div className="h-fit w-full sm:px-6 relative overflow-hidden">
      {/* Animated background blobs (similar to auth pages) */}
      <div 
        className={`fixed rounded-full filter blur-[80px] opacity-50 ${
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
        className={`fixed rounded-full filter blur-[80px] opacity-50 ${
          isDarkMode 
            ? 'bg-indigo-500/20 top-1/3 right-1/3 w-96 h-96' 
            : 'bg-indigo-500/20 top-1/3 right-1/3 w-96 h-96'
        }`}
        style={{
          animation: "blob-move 7s infinite ease-in-out",
          animationDelay: "2000ms"
        }}
      ></div>

      {/* Fixed Progress Bar */}
      <div className={`fixed top-16 left-0 right-0 z-50 mx-auto px-4 sm:px-6`}>
        <div className={`w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden max-w-5xl mx-auto`}>
          <div
            className={`h-1.5 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600'
            } transition-all duration-300 ease-in-out rounded-full`}
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Sticky Header */}
      <div className={`sticky top-0 rounded-t-xl mx-auto z-40 ${
        isDarkMode 
          ? 'bg-gray-800/90 text-white' 
          : 'bg-white/95'
        } backdrop-blur-md px-4 sm:px-6 py-3 max-w-5xl shadow-lg border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        } transition-all duration-300 mt-2`}>
        <div className="flex items-center justify-between">
          <Link
            href="/resources"
            className={`flex items-center text-sm ${
              isDarkMode 
                ? 'text-gray-300 hover:text-purple-300' 
                : 'text-gray-600 hover:text-indigo-600'
            } transition-colors duration-300`}
          >
            <motion.svg
              whileHover={{ x: -3 }}
              transition={{ type: "spring", stiffness: 300 }}
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </motion.svg>
            Back to Resources
          </Link>

          <div className="flex items-center space-x-3">
            {/* Bookmark Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={toggleBookmark}
              disabled={isBookmarking || !userId}
              className={`${
                isBookmarked 
                  ? isDarkMode ? 'text-purple-400' : 'text-indigo-600' 
                  : isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } hover:${isDarkMode ? 'text-purple-300' : 'text-indigo-500'} transition-all duration-300 focus:outline-none ${
                isBookmarking ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={isBookmarked ? "Remove bookmark" : "Bookmark this resource"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill={isBookmarked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={isBookmarked ? 0 : 2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18l7-5 7 5V3a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.main 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-5xl mx-auto mb-10"
      >
        <motion.article 
          variants={itemVariants}
          className={`${
            isDarkMode 
              ? 'bg-gray-800/80 text-gray-100' 
              : 'bg-white/95 text-gray-800'
          } rounded-b-xl p-6 sm:p-10 shadow-xl backdrop-blur-sm border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-100'
          } transition-all duration-300`}
        >
          {/* Title and Tags */}
          <motion.h1 
            variants={itemVariants}
            className={`text-3xl sm:text-4xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            } mb-4 leading-tight`}
          >
            {title}
          </motion.h1>

          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-between gap-y-4 mb-6"
          >
            <div className="flex flex-wrap gap-2">
              <span className={`${
                isDarkMode 
                  ? 'bg-gray-700/70 text-purple-300' 
                  : 'bg-indigo-100/70 text-indigo-800'
              } text-xs px-3 py-1 rounded-full shadow-sm backdrop-blur-sm transition-all duration-300`}>
                {category}
              </span>
              <span className={`${
                isDarkMode 
                  ? 'bg-gray-700/70 text-gray-300' 
                  : 'bg-gray-100/70 text-gray-700'
              } text-xs px-3 py-1 rounded-full shadow-sm backdrop-blur-sm transition-all duration-300`}>
                {timeToRead}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className={`${
                    isDarkMode 
                      ? 'bg-gray-700/70 text-gray-300 hover:bg-gray-600/70' 
                      : 'bg-gray-100/70 text-gray-700 hover:bg-gray-200/70'
                  } text-xs px-3 py-1 rounded-full shadow-sm backdrop-blur-sm transition-all duration-300 cursor-pointer`}
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </motion.div>
          
          {/* Description */} 
          <motion.p 
            variants={itemVariants}
            className={`${
              isDarkMode 
                ? 'text-gray-300' 
                : 'text-gray-700'
            } mb-6 leading-relaxed transition-colors duration-300`}
          >
            {description}
          </motion.p>

          {/* Cover Image */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="overflow-hidden rounded-xl shadow-lg mb-8"
          >
            <img
              src={imageUrl}
              alt={title}
              className="w-full max-h-[400px] object-cover hover:scale-105 transition-all duration-700"
            />
          </motion.div>

          {/* Sections */}
          {sections.map((section, idx) => (
            <motion.section 
              key={idx} 
              variants={itemVariants}
              className="mb-10"
            >
              <h2 className={`text-2xl font-semibold ${
                isDarkMode ? 'text-purple-300' : 'text-indigo-700'
              } mb-3 transition-colors duration-300`}>{section.heading}</h2>

              {section.description && (
                <p className={`${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                } leading-relaxed mb-4 transition-colors duration-300`}>{section.description}</p>
              )}

              {section.list && (
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {section.list.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className={`text-lg mr-2 ${
                        isDarkMode ? 'text-purple-400' : 'text-indigo-500'
                      }`}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {idx !== sections.length - 1 && (
                <hr className={`my-8 ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                } transition-colors duration-300`} />
              )}
            </motion.section>
          ))}
        </motion.article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <motion.section 
            variants={itemVariants}
            className="mt-16 mb-10 px-4 sm:px-0"
          >
            <motion.h3 
              variants={itemVariants}
              className={`text-xl font-semibold mb-6 ${
                isDarkMode ? 'text-purple-300' : 'text-indigo-700'
              } transition-colors duration-300`}
            >
              Related Articles
            </motion.h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((article, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Resource_Card
                    title={article.title}
                    description={article.description}
                    imageUrl={article.imageUrl || "https://via.placeholder.com/300"}
                    link={article.link || "#"}
                    timeToRead={article.timeToRead || "5 min read"}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </motion.main>
    </div>
  );
};

export default Resource;
