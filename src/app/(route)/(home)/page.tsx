import Dashboard_profile from '@/components/shared/Dashboard_profile'
import Overview from '@/components/shared/Overview'
import Personal_Goals from '@/components/shared/Personal_Goals'
import React from 'react'

const Page = () => {
  return (
    <div className="flex flex-col mt-8 gap-y-5 w-full items-center">
      <Dashboard_profile />
      <div className="w-[95%] flex flex-col md:flex-row gap-5">
        <Overview />
        <Personal_Goals/>
      </div>
    </div>
  )
}

export default Page
