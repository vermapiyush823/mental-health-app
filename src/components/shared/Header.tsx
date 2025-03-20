import React from 'react';
import Bell from '../../../assets/icons/Bell.svg'
import Image from 'next/image';
const Header = () => {
  return (
    <nav className='flex border-b bg-white border-gray-300 items-center h-16 justify-between px-6'>
      <div className='flex items-center gap-x-10 h-full'>
        <h3 className='text-lg font-bold text-indigo-600'>LO <span className="text-indigo-800">GO</span></h3>
        <ul className='flex items-center gap-x-6 text-gray-600 text-md'>
          <li className='hover:text-black cursor-pointer'>Dashboard</li>
          <li className='hover:text-black cursor-pointer'>Track Mood</li>
          <li className='hover:text-black cursor-pointer'>Resources</li>
          <li className='hover:text-black cursor-pointer'>Support</li>
        </ul>
      </div>
      <div className='flex items-center gap-x-6'>
        <button className='bg-black text-white flex gap-x-1 px-4 py-2 rounded-sm text-sm'>
            <Image src={Bell} alt="bell" />
            Notifications
        </button>
        <img 
          src="https://randomuser.me/api/portraits/men/1.jpg" 
          alt="Profile" 
          className="w-8 h-8 rounded-full"
        />
      </div>
    </nav>
  );
};

export default Header;
