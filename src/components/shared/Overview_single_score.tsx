import React from 'react'

interface Props {
    catgory: string,
    score: string | number
}

const overview_single_score = (
    {catgory, score}: Props
) => {
  return (
    <div className='flex flex-col bg-black/10 p-4 rounded-lg w-full h-full'>
        <p className='text-sm text-gray-500 '>{catgory}</p>
        <p className='text-lg font-bold'>
            {
                catgory === 'Weekly Mood Score' ? (
                    score+'/10'):
                catgory === 'Average Sleep Hours' ? (
                    score + ' hours'):
                catgory === 'Stress Level' ? (
                    score
                ) : (
                    ''
                )

            }
        </p>
    </div>
  )
}

export default overview_single_score