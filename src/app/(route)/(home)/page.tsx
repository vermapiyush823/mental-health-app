import Dashboard_profile from '@/components/shared/Dashboard_profile'
import Overview from '@/components/shared/Overview'
import Personal_Goals from '@/components/shared/Personal_Goals'
import Support_network from '@/components/shared/Support_network'
import { cookies } from 'next/headers'
import React from 'react'

const Page = async() => {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value || "";
  return (
    <div className="flex flex-col mt-4 sm:mt-8 mb-8 gap-y-5 w-full items-center">
      <Dashboard_profile userId={userId}/>
      <div className="w-[95%] grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className='col-span-1 sm:col-span-2 w-full grid grid-cols-1'>
          <Overview userId={userId}/>
          </div>
        <div className="col-span-1 flex flex-col w-full gap-y-5">
        <Personal_Goals userId={userId}/>
        <Support_network userId={userId}/>
        </div>
      </div>
    </div>
  )
}

export default Page
