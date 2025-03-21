import React from 'react'
import Dashboard_profile from '@/components/shared/Dashboard_profile'
import Chatbot from '@/components/shared/Chatbot'
import SupportNetwork from '@/components/shared/Support_network'
import Chat_Features from '@/components/shared/Chat_Features'
const page = () => {
  return (
    <div className="flex flex-col mt-8 mb-8 gap-y-5 w-full items-center">
      <div className='w-full justify-center items-center hidden sm:flex'>
        <Dashboard_profile/>
      </div>
      <div className="w-[95%] grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className='col-span-1 sm:col-span-2  w-full'>
          <Chatbot/>
          </div>
        <div className="col-span-1 flex flex-col w-full gap-y-5">
        <Chat_Features/>
        <SupportNetwork/>
        </div>
      </div>
    </div>
  )
}

export default page