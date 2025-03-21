import React from 'react'
import Dashboard_profile from '@/components/shared/Dashboard_profile'
import Chatbot from '@/components/shared/Chatbot'
const page = () => {
  return (
    <div className="flex flex-col mt-8 gap-y-5 w-full items-center">
      <div className='w-full justify-center items-center hidden sm:flex'>
        <Dashboard_profile/>
      </div>
      <div className="w-[95%] grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className='col-span-1 sm:col-span-2  w-full'>
          <Chatbot/>
          </div>
        <div className="col-span-1 flex flex-col w-full gap-y-5">

        </div>
      </div>
    </div>
  )
}

export default page