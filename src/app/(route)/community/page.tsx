import React from 'react'
import Dashboard_profile from '@/components/shared/Dashboard_profile'
import Community_Chat from '@/components/shared/Community_Chat'
import { cookies } from 'next/headers'

const CommunityPage = async() => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value || "";

  return (
    <div className="flex flex-col mt-4 sm:mt-8 mb-8 gap-y-5 w-full items-center">
      <div className='w-full justify-center items-center hidden sm:flex'>
        <Dashboard_profile userId={userId} />
      </div>
      <div className="w-[95%] grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className='col-span-1 sm:col-span-3 w-full'>
          <Community_Chat userId={userId} />
        </div>
      </div>
    </div>
  )
}

export default CommunityPage