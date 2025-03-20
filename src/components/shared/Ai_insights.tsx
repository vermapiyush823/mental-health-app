import React from 'react'

interface Props {
    insights: string[]
}
const Ai_insights = (
    {insights}: Props
) => {
  return (
    <div className='flex flex-col w-full'>
        <h1 className='text-sm font-bold'>AI Insights</h1>
        <div className='flex flex-col gap-y-1 mt-1'>
            {
                insights.map((insight, index) => {
                    return (
                        <ul key={index} >
                            <li className='text-sm text-gray-500 
                                list-disc list-inside ml-1
                            '>{insight}</li>
                        </ul>
                    )
                })
            }
            </div>
    </div>
  )
}

export default Ai_insights