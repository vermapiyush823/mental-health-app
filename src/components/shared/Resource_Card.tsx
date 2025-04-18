import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

interface ResourceCardProps {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  timeToRead: string;
}

const Resource_Card = (resource: ResourceCardProps) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
    >
      <Link 
        href={resource.link}
        className={`block ${
          isDarkMode 
            ? 'bg-gray-800/90 text-gray-100 border border-gray-700' 
            : 'bg-white/95 text-gray-900 border border-gray-100'
        } rounded-xl shadow-lg overflow-hidden col-span-1 h-full flex flex-col no-underline 
        hover:shadow-xl transition-all duration-300 backdrop-blur-sm`}
      >
        {/* Image with gradient overlay */}
        <div className="relative w-full pt-[56.25%] overflow-hidden">
          <img
            src={resource.imageUrl}
            alt={resource.title}
            className='absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105'
          />
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${
            isDarkMode 
              ? 'from-gray-900/70 to-transparent' 
              : 'from-black/40 to-transparent'
          } opacity-60`}></div>
          
          {/* Time to read badge */}
          <div className={`absolute bottom-3 right-3 ${
            isDarkMode 
              ? 'bg-gray-800/90 text-gray-300' 
              : 'bg-white/80 text-gray-800'
          } px-2 py-1 text-xs rounded-full backdrop-blur-sm shadow-sm`}>
            {resource.timeToRead}
          </div>
        </div>

        {/* Content */}
        <div className='p-4 sm:p-5 flex-1 flex flex-col justify-between'>
          <div>
            <h2 className={`text-lg font-semibold ${
              isDarkMode ? 'text-purple-300' : 'text-indigo-700'
            } mb-2 line-clamp-2`}>{resource.title}</h2>
            <p className={`${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            } text-sm mb-3 line-clamp-3`}>{resource.description}</p>
          </div>

          {/* Footer with "Read More" button */}
          <div className='mt-auto'>
            <span className={`inline-block ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 hover:from-purple-600/30 hover:to-indigo-600/30' 
                : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100'
            } px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300`}>
              Read More
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default Resource_Card
