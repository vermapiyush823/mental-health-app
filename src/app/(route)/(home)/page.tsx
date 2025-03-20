import Dashboard_profile from '@/components/shared/Dashboard_profile'
import Overview from '@/components/shared/Overview'
import React from 'react'
const page = () => {
  return (
    <div className='flex flex-col mt-8 gap-y-5 w-full items-center justify-center'>
      <Dashboard_profile/>
      <div className='w-[95%] flex'>
        <Overview/>
      </div>
    </div>
  )
}

export default page