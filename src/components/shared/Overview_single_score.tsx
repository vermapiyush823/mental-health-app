import React from 'react'

interface Props {
    catgory: string
    score: string
}

const overview_single_score = (
    {catgory, score}: Props
) => {
  return (
    <div className='flex flex-col bg-black/15 p-4 rounded-lg '>
        <p className='text-sm text-gray-500 '>{catgory}</p>
        <p className='text-lg font-bold'>
            {
                score==='Low' ? score : `${score}/10`
            }
        </p>
    </div>
  )
}

export default overview_single_score