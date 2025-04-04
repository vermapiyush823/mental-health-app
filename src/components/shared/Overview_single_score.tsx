import React from 'react'

interface Props {
    catgory: string
    score: string
}

const overview_single_score = (
    {catgory, score}: Props
) => {
  return (
    <div className='flex flex-col bg-black/10 p-4 rounded-lg w-full h-full'>
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