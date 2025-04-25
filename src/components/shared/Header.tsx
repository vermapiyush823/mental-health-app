"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "./ThemeSwitcher";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import Revibe from '../../../assets/icons/revibe-logo.svg'

interface HeaderProps {
  userId: string;
}

const Header = ({ userId }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [newImg, setNewImg] = useState("https://api.dicebear.com/6.x/avataaars/svg");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [activePage, setActivePage] = useState("/");
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
    
    // Set active page based on current URL
    if (typeof window !== "undefined") {
      setActivePage(window.location.pathname);
    }
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
      console.error("Error during logout:", err);
    }
  };

  // Define theme-based styles
  const isDarkMode = mounted && resolvedTheme === 'dark';
  
  // Navigation items with links
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Mood Tracker", href: "/mood-track" },
    { name: "Resources", href: "/resources" },
    { name: "Community", href: "/community" },
    { name: "Support", href: "/support" }
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05 
      } 
    }
  };
  
  const navItemVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20, height: 0 },
    visible: { 
      opacity: 1, 
      y: 0, 
      height: 'auto',
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      height: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  // Helper function to determine if a nav item is active
  const isActive = (href: string) => {
    return activePage === href;
  };
  
  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-sm ${
      isDarkMode 
        ? 'bg-gray-800/90 border-gray-700 text-white' 
        : 'bg-white/90 border-gray-200 text-gray-900'
    } border-b shadow-sm w-full transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className={`flex items-center relative`}>
           
              <motion.span 
                className={`text-xl font-extrabold flex items-center ${
                  isDarkMode ? 'text-purple-300' : 'text-indigo-600'
                } tracking-wide`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                   <motion.img
                src={Revibe.src}
                alt="Logo"
                className={`h-12 w-12 mr-1 rounded-full shadow-md`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
                ReVibe
                <span className={isDarkMode ? 'text-pink-300' : 'text-pink-500'}>.</span>
              </motion.span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <motion.div 
            className="hidden md:flex"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.ul className="flex space-x-6 items-center">
              {navItems.map((item) => (
                <motion.li key={item.name} variants={navItemVariants}>
                  <Link 
                    href={item.href} 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                      isActive(item.href)
                        ? isDarkMode 
                          ? 'text-purple-300 bg-gray-700/50' 
                          : 'text-indigo-700 bg-indigo-50'
                        : isDarkMode
                          ? 'text-gray-300 hover:text-purple-300 hover:bg-gray-700/30' 
                          : 'text-gray-700 hover:text-indigo-700 hover:bg-gray-100/80'
                    }`}
                    onClick={() => setActivePage(item.href)}
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
          
          {/* Right side items: theme switcher, profile, and logout */}
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Link 
                href="/profile"
                className="flex items-center"
              >
                <div className="relative overflow-hidden rounded-full border-2 border-purple-300/50 shadow-md">
                  <img
                    src={newImg}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent"></div>
                </div>
              </Link>
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => logout()}
              className={`hidden md:flex items-center px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
              }`}
            >
              Logout
            </motion.button>
            
            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="md:hidden"
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
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={`md:hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow-lg`}
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.ul variants={containerVariants} className="px-4 py-3 space-y-2">
              {navItems.map((item) => (
                <motion.li key={item.name} variants={navItemVariants}>
                  <Link 
                    href={item.href} 
                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors duration-300 ${
                      isActive(item.href)
                        ? isDarkMode 
                          ? 'text-purple-300 bg-gray-700' 
                          : 'text-indigo-700 bg-indigo-50'
                        : isDarkMode
                          ? 'text-gray-300 hover:text-purple-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:text-indigo-700 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setActivePage(item.href);
                      closeMenu();
                    }}
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
              
              <motion.li variants={navItemVariants}>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-blue-300 hover:text-blue-200 bg-gray-700 hover:bg-gray-600' 
                      : 'text-blue-700 hover:text-indigo-800 bg-blue-50 hover:bg-indigo-100'
                  }`}
                >
                  Logout
                </button>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Header;
