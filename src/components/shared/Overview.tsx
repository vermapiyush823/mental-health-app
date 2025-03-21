'use client'
import React from 'react'
import MentalHealthChart from './Mental_Health_Charts'
import Overview_single_score from './Overview_single_score'
import Ai_insights from './Ai_insights'
const Overview = () => {
  return (
    <div className='flex flex-col gap-y-5 bg-white h-fit  rounded-md p-5'>
        <h1 className='text-lg font-bold'>Mental Health Overview</h1>
        <MentalHealthChart/>
        <div className='grid justify-center items-center gap-5 grid-cols-2 sm:grid-cols-3  w-full'>
            <Overview_single_score catgory='Weekly Mood Score' score='7'/>
            <Overview_single_score catgory='Sleep Quality' score='8'/>
            <Overview_single_score catgory='Stress Level' score='Low'/>
        </div>
        <Ai_insights
            insights={[
                'You are doing great',
                'Keep up the good work',
                'You are on the right track'
            ]}
            
        />
    </div>
  )
}

export default Overview