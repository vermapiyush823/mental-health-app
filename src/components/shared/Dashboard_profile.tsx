import React from 'react'
import Edit_icon from '../../../assets/icons/Edit.svg'
import Image from 'next/image'
const Dashboard_profile = () => {
  return (
    <div className='flex justify-between bg-white h-fit  w-[95%] rounded-md p-5'>
        <div className='flex justify-start gap-x-6 w-1/2'>
        <img 
          src="https://randomuser.me/api/portraits/men/1.jpg" 
          alt="Profile" 
          className="w-25 h-25 rounded-full"
        />
        <div className='flex flex-col justify-start'>
            <h3 className='text-2xl font-bold'>Piyush Verma</h3>
            <p className='text-md text-gray-500'>Member since 2024</p>
            <p className='text-sm font-bold text-green-600 bg-green-100 rounded-xl py-1 px-2 mt-1  w-fit'>Feeling Good Today</p>
        </div>
        </div>
        <div className='flex justify-end w-1/2'>
        <button className='bg-gray-200 flex gap-x-1 text-black px-4 py-2 h-fit rounded-md'>
            <Image src={Edit_icon} alt="edit" />
            Edit Profile</button>
        </div>
    </div>
  )
}

export default Dashboard_profile