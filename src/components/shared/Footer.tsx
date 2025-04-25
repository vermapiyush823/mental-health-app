"use client";
import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Revibe from '../../../assets/icons/revibe-logo.svg'


const Footer = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentYear = new Date().getFullYear();
  const isDarkMode = resolvedTheme === 'dark';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  useEffect(() => {
    setMounted(true);
  }
    , []);

    // Make sure component is mounted before using theme
    if (!mounted) {
        return null;
        }


  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
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

  return (
    <footer className={`w-full py-8 px-4 mt-auto border-t transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700 text-gray-200' 
        : 'bg-gray-50 border-gray-200 text-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and branding section */}
          <div className="flex items-center">
            <motion.img
              src={Revibe.src}
              alt="ReVibe Logo"
              className="h-10 w-10 mr-2 rounded-full shadow-md"
              whileHover={{ scale: 1.05 }}
            />
            <span className={`text-xl font-bold ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'}`}>
              ReVibe<span className={isDarkMode ? 'text-pink-300' : 'text-pink-500'}>.</span>
            </span>
          </div>
          
          {/* Quick links */}
          <div className="flex items-center flex-wrap justify-center space-y-2 space-x-6">
            <Link href="/" className={`text-sm hover:underline ${isDarkMode ? 'text-gray-300 hover:text-purple-300' : 'text-gray-600 hover:text-indigo-600'}`}>
              Home
            </Link>
            <Link href="/resources" className={`text-sm hover:underline ${isDarkMode ? 'text-gray-300 hover:text-purple-300' : 'text-gray-600 hover:text-indigo-600'}`}>
              Resources
            </Link>
            <Link href="/community" className={`text-sm hover:underline ${isDarkMode ? 'text-gray-300 hover:text-purple-300' : 'text-gray-600 hover:text-indigo-600'}`}>
                Community
            </Link>
            <Link href="/support" className={`text-sm hover:underline ${isDarkMode ? 'text-gray-300 hover:text-purple-300' : 'text-gray-600 hover:text-indigo-600'}`}>
              Support
            </Link>
            <Link href="/mood-track" className={`text-sm hover:underline ${isDarkMode ? 'text-gray-300 hover:text-purple-300' : 'text-gray-600 hover:text-indigo-600'}`}>
                Mood Tracker
            </Link>
          </div>
          
          {/* Social icons */}
          <div className="flex items-center space-x-4">
            {[
              { name: "Twitter", icon: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" },
              { name: "Instagram", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
              { name: "Facebook", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.046v-3.47h3.046v-2.644c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.736-.9 10.126-5.864 10.126-11.854z" },
            ].map((social, index) => (
              <motion.a
                key={index}
                href="#"
                className={`${isDarkMode ? 'text-gray-400 hover:text-purple-300' : 'text-gray-500 hover:text-indigo-600'} transition-colors duration-300`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={social.name}
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d={social.icon} />
                </svg>
              </motion.a>
            ))}
          </div>
        </div>
        
        {/* Tag line */}
        <div className="mt-6 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Empowering mental wellness through awareness, tracking, and community support.
          </p>
        </div>

        {/* Bottom copyright section */}
        <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} text-center`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            © {currentYear} ReVibe. All rights reserved.
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            This app is designed to provide information and support, not to replace professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;