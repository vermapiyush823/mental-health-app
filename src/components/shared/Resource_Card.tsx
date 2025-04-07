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
      className='block bg-white rounded-2xl shadow-md overflow-hidden col-span-1 h-[330px] flex flex-col no-underline hover:shadow-lg transition-shadow duration-300'
    >
        {/* Image */}
        <img
          src={resource.imageUrl}
          alt={resource.title}
          className='w-full h-40 object-cover'
        />

        {/* Content */}
        <div className='p-6 flex flex-col justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>{resource.title}</h2>
            <p className='text-gray-600 text-base mb-4 line-clamp-2'>{resource.description}</p>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between text-sm text-gray-500'>
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
