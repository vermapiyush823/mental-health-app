'use client'
import React, { useState } from 'react'

const Chat_Features = () => {
    const [features, setFeatures] = useState([
        {
            title: 'AI-Powered Analysis',
            description: 'Real-time sentiment and emotion analysis of your messages',         
        },
        {
            title:'24/7 Support',
            description: 'Always available to help with your mental health needs',
        },
        {
            title: 'Personalized Responses',
            description:'Tailored support based on your history and preferences'
        }
    ])
    return (
    <div className="flex flex-col gap-y-5 bg-white h-fit rounded-md p-5 shadow-md">
      {/* Title */}
      <h1 className="text-lg font-bold">Chat Features</h1>
        {/* List of Chat Features */}
        <div className="flex flex-col gap-y-4">
            {features.map((feature, index) => (
            <div key={index} className="flex flex-col gap-y-1 p-4 bg-black/10 rounded-md">
              
                <h2 className="font-medium">{feature.title}</h2>
                <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
            ))}
        </div>
      </div>
  )
}

export default Chat_Features