import React from 'react'
import Dashboard_profile from '@/components/shared/Dashboard_profile'
import Chatbot from '@/components/shared/Chatbot'
import SupportNetwork from '@/components/shared/Support_network'
import Chat_Features from '@/components/shared/Chat_Features'
import { cookies } from 'next/headers'

const page = async() => {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value || "";
  return (
    <div className="flex flex-col mt-4 sm:mt-8 mb-8 gap-y-5 w-full items-center">
      <div className='w-full justify-center items-center hidden sm:flex'>
        <Dashboard_profile userId={userId} />
      </div>
      <div className="w-[95%] grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className='col-span-1 sm:col-span-2 w-full'>
            <Chatbot userId={userId} />
          </div>
        <div className="col-span-1 flex flex-col w-full gap-y-6">
          <Chat_Features />
          <SupportNetwork userId={userId} />
        </div>
      </div>
    </div>
  )
}

export default page