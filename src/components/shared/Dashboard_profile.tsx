import React from 'react'
import Edit_icon from '../../../assets/icons/Edit.svg'
import Image from 'next/image'
import Link from 'next/link'
const Dashboard_profile = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between bg-white w-[95%] rounded-md p-5 items-center md:items-start gap-4">
      {/* Profile Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full md:w-1/2">
        <img 
          src="https://randomuser.me/api/portraits/men/1.jpg" 
          alt="Profile" 
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full"
        />
        <div className="text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-bold">Piyush Verma</h3>
          <p className="text-md text-gray-500">Member since 2024</p>
          <p className="text-sm font-bold text-green-600 bg-green-100 rounded-xl py-1 px-2 mt-1 w-fit">
            Feeling Good Today
          </p>
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="w-full md:w-auto flex justify-center md:justify-end">
        <Link className="bg-gray-200 flex items-center gap-x-2 text-black px-4 py-2 rounded-md"
          href="/profile"
        >
          <Image src={Edit_icon} alt="edit" width={18} height={18} />
          <span className="text-sm">Edit Profile</span>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard_profile
