import React from 'react'
import Link from 'next/link'

interface ResourceCardProps {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  timeToRead: string;
}

const Resource_Card = (resource: ResourceCardProps) => {
  return (
    <Link 
      href={resource.link}
      className='block bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md overflow-hidden col-span-1 h-full flex flex-col no-underline hover:shadow-lg transition-shadow duration-300'
    >
        {/* Image */}
        <div className="relative w-full pt-[56.25%]">
          <img
            src={resource.imageUrl}
            alt={resource.title}
            className='absolute top-0 left-0 w-full h-full object-cover'
          />
        </div>

        {/* Content */}
        <div className='p-4 sm:p-5 md:p-6 flex-1 flex flex-col justify-between'>
          <div>
            <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2'>{resource.title}</h2>
            <p className='text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2'>{resource.description}</p>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between text-xs sm:text-sm text-gray-500 mt-auto'>
            <span>{resource.timeToRead}</span>
            <span className='text-black font-medium hover:underline'>
              Read More
            </span>
          </div>
        </div>
    </Link>
  )
}

export default Resource_Card
