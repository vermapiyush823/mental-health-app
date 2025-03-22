"use client";
import React, { useState } from "react";
import Bell from "../../../assets/icons/Bell.svg";
import Image from "next/image";
import MenuIcon from "../../../assets/icons/burger-menu-svgrepo-com.svg";
import CloseIcon from "../../../assets/icons/cross-svgrepo-com.svg";
import Link from "next/link";
import { useRouter } from "next/navigation";
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [error,setError] = useState('');
  const router = useRouter();
  const logout = async()=>{
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Something went wrong");
        return;
      }else{
        router.push('/sign-in');
      }
    } catch (err) {
      console.error("Error during sign-up:", err);
    }
  }
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
          <li>
          <button type="button"
          onClick={()=>logout()}
        className="hover:text-black sm:hidden text-purple-700 cursor-pointer px-6 sm:px-0 py-2 sm:py-0">
          Logout
        </button>
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
          className="w-10 h-10 rounded-full"
        />
        </Link> 
        {/* Mobile Menu Button (Hidden on Large Screens) */}
        <button type="button"
          onClick={()=>logout()}
        className="bg-black text-white px-4 py-2 rounded-lg sm:flex hidden">
          Logout
        </button>
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
