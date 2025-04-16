"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "./ThemeSwitcher";
import { useTheme } from "next-themes";

interface HeaderProps {
  userId: string;
}

const Header = ({ userId }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [newImg, setNewImg] = useState(
    "https://api.dicebear.com/6.x/avataaars/svg"
  );
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const fetchUserDetails = async () => {
    try {
      const response = await fetch("/api/get/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData.message);
        return;
      }
      const userData = await response.json();
      if (userData.user.data.image) {
        setNewImg(userData.user.data.image);
      }
    } catch (err) {
      console.error("Error during fetching user details", err);
    }
  };

  // Fetch user details on initial render
  useEffect(() => {
    fetchUserDetails();
  }, []);

  const router = useRouter();
  const logout = async () => {
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
      } else {
        router.push("/sign-in");
      }
    } catch (err) {
      console.error("Error during sign-up:", err);
    }
  };

  // Define theme-based styles
  const isDarkMode = mounted && resolvedTheme === 'dark';

  return (
    <nav className={`flex border-b items-center h-16 justify-between px-6 w-full ${
      isDarkMode 
        ? 'bg-gray-900 border-gray-700 text-white' 
        : 'bg-white border-gray-300 text-gray-900'
    }`}>
      {/* Left Side: Logo & Navigation */}
      <div className="flex items-center gap-x-4 sm:gap-x-10 h-full">
        <h3 className={`text-lg font-bold ${
          isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
        }`}>
          LO <span className={isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}>GO</span>
        </h3>

        {/* Navigation Links */}
        <ul className={`absolute top-16 z-50 left-0 w-full border-none sm:border-b sm:static sm:flex sm:items-center sm:gap-x-6 text-md transition-all duration-300 ease-in-out ${
          isDarkMode 
            ? 'bg-gray-900 border-gray-700 text-gray-300' 
            : 'bg-white border-gray-300 text-gray-600'
          } ${
            menuOpen ? 'flex flex-col py-4 shadow-md' : 'hidden sm:flex'
          }`}
        >
          <li className={`cursor-pointer px-6 sm:px-0 py-2 sm:py-0 ${
            isDarkMode ? 'hover:text-white' : 'hover:text-black'
          }`}>
            <Link href="/" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li className={`cursor-pointer px-6 sm:px-0 py-2 sm:py-0 ${
            isDarkMode ? 'hover:text-white' : 'hover:text-black'
          }`}>
            <Link href="/mood-track" onClick={closeMenu}>
              Mood Tracker
            </Link>
          </li>
          <li className={`cursor-pointer px-6 sm:px-0 py-2 sm:py-0 ${
            isDarkMode ? 'hover:text-white' : 'hover:text-black'
          }`}>
            <Link href="/resources" onClick={closeMenu}>
              Resources
            </Link>
          </li>
          <li className={`cursor-pointer px-6 sm:px-0 py-2 sm:py-0 ${
            isDarkMode ? 'hover:text-white' : 'hover:text-black'
          }`}>
            <Link href="/support" onClick={closeMenu}>
              Support
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                logout();
                closeMenu();
              }}
              className={`sm:hidden cursor-pointer px-6 sm:px-0 py-2 sm:py-0 ${
                isDarkMode 
                  ? 'text-purple-400 hover:text-white' 
                  : 'text-purple-700 hover:text-black'
              }`}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Right Side: Theme Switcher & Profile */}
      <div className="flex items-center gap-x-4 sm:gap-x-6">
        {/* Theme Switcher */}
        <ThemeSwitcher />
        
        <Link href="/profile" onClick={closeMenu}>
          <img
            src={newImg}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>
        
        <button
          type="button"
          onClick={() => logout()}
          className={`px-4 py-2 rounded-md sm:flex hidden ${
            isDarkMode 
              ? 'bg-gray-700 text-white' 
              : 'bg-black text-white'
          }`}
        >
          Logout
        </button>
        
        <button
          className={`sm:hidden ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Header;
