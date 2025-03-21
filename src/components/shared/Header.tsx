"use client";
import React, { useState } from "react";
import Bell from "../../../assets/icons/Bell.svg";
import Image from "next/image";
import MenuIcon from "../../../assets/icons/burger-menu-svgrepo-com.svg";
import CloseIcon from "../../../assets/icons/cross-svgrepo-com.svg";
import Link from "next/link";
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex border-b bg-white  border-gray-300 items-center h-16 justify-between px-6 w-full">
      {/* Left Side: Logo & Navigation */}
      <div className="flex items-center gap-x-4 sm:gap-x-10 h-full">
        <h3 className="text-lg font-bold text-indigo-600">
          LO <span className="text-indigo-800">GO</span>
        </h3>


        {/* Navigation Links */}
        <ul
          className={`absolute top-16 left-0 w-full bg-white  border-none sm:border-b border-gray-300 sm:static sm:flex sm:items-center sm:gap-x-6 text-gray-600 text-md transition-all duration-300 ease-in-out ${
            menuOpen ? "flex flex-col py-4 shadow-md" : "hidden sm:flex"
          }`}
        >
          <li className="hover:text-black cursor-pointer px-6 sm:px-0 py-2 sm:py-0">
            <Link href="/">Home</Link>
          </li>
          <li className="hover:text-black cursor-pointer px-6 sm:px-0 py-2 sm:py-0">
            <Link href="/mood-track">Mood Tracker</Link>
          </li>
          <li className="hover:text-black cursor-pointer px-6 sm:px-0 py-2 sm:py-0">
            <Link href="/resources">Resources</Link>
          </li>
          <li className="hover:text-black cursor-pointer px-6 sm:px-0 py-2 sm:py-0">
            <Link href="/support">Support</Link>
          </li>
        </ul>
      </div>

      {/* Right Side: Notifications & Profile */}
      <div className="flex items-center gap-x-4 sm:gap-x-6">
        <button className="bg-black text-white flex gap-x-2 px-4 py-2 rounded-md text-sm items-center">
          <Image src={Bell} alt="bell" width={18} height={18} />
          <span>Notifications</span>
        </button>
          <Link href="/profile">
          <img
          src="https://randomuser.me/api/portraits/men/1.jpg"
          alt="Profile"
          className="w-8 h-8 rounded-full"
        />
        </Link> 
        {/* Mobile Menu Button (Hidden on Large Screens) */}
        <button
          className="sm:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Image
            src={menuOpen ? CloseIcon : MenuIcon}
            alt="menu toggle"
            width={24}
            height={24}
          />
          {}
        </button>
      </div>
    </nav>
  );
};

export default Header;
