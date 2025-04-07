import React from 'react'
import Resource_Card from '@/components/shared/Resource_Card'
import recource from '../../../../assets/icons/resource.png'
const page = () => {
  return (
    <div>
        <div className="flex flex-col mt-8 mb-8 p-6 gap-y-5 w-full items-center">
            <div className='grid justify-center items-center gap-5 grid-cols-1 sm:grid-cols-3 w-full'>
                <Resource_Card 
                    title='Understanding Mental Health'
                    description='A comprehensive guide to understanding mental health, its importance, and how to maintain it.'
                    imageUrl={recource.src}
                    link='https://example.com/resource1'
                    timeToRead='5 min read'
                />
                <Resource_Card
                    title='Coping Strategies for Stress'
                    description='Learn effective coping strategies to manage stress and improve your mental well-being.'
                    imageUrl='https://example.com/image2.jpg'
                    link='https://example.com/resource2'
                    timeToRead='7 min read'
                />
                <Resource_Card
                    title='Mindfulness and Meditation'
                    description='Explore the benefits of mindfulness and meditation for mental health.'
                    imageUrl='https://example.com/image3.jpg'
                    link='https://example.com/resource3'
                    timeToRead='10 min read'
                />
                <Resource_Card
                    title='Mindfulness and Meditation'
                    description='Explore the benefits of mindfulness and meditation for mental health.'
                    imageUrl='https://example.com/image3.jpg'
                    link='https://example.com/resource3'
                    timeToRead='10 min read'
                />
            </div>
        </div>
    </div>
  )
}

export default page