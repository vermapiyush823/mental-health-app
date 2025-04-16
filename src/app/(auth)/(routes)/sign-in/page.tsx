"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

const SignInPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Handle mounting for theme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success message
    setIsLoading(true); // Start loading state

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Sign-in successful:", data);
      
      if (data.message === "Login successful") {
        setSuccess("Login successful! Redirecting...");
        router.push('/');
      } else {
        throw new Error(data.error || "Invalid email or password");
      }
      
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false); // End loading state regardless of outcome
    }
  };

  // Animations for page elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.08,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="flex min-h-screen w-lg items-center justify-center overflow-hidden relative py-10">
      {/* CSS module-based animated background gradient */}
      <div 
    className={`absolute rounded-full filter blur-[60px] opacity-60 animate-blob ${
      isDarkMode 
        ? 'bg-blue-500/20 top-1/4 left-1/4 w-80 h-80' 
        : 'bg-pink-500/30 top-1/4 left-1/4 w-80 h-80'
    }`}
    style={{
      animationDelay: "0ms",
      animationDuration: "7s"
    }}
  ></div>
  <div 
    className={`absolute rounded-full filter blur-[60px] opacity-60 animate-blob ${
      isDarkMode 
        ? 'bg-indigo-500/20 top-1/3 right-1/3 w-96 h-96' 
        : 'bg-indigo-500/30 top-1/3 right-1/3 w-96 h-96'
    }`}
    style={{
      animationDelay: "2000ms",
      animationDuration: "7s"
    }}
  ></div>
  <div 
    className={`absolute rounded-full filter blur-[60px] opacity-60 animate-blob ${
      isDarkMode 
        ? 'bg-purple-500/20 bottom-1/4 right-1/4 w-72 h-72' 
        : 'bg-purple-500/30 bottom-1/4 right-1/4 w-72 h-72'
    }`}
    style={{
      animationDelay: "4000ms",
      animationDuration: "7s"
    }}
  ></div>
      <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className={`auth-content relative z-10 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-6 backdrop-blur-md bg-opacity-80 dark:bg-opacity-30 border border-white/10`}
            >
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className={`relative text-3xl font-extrabold ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'} tracking-wider`}>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative z-10"
            >
              MindWell
              <span className={`${isDarkMode ? 'text-pink-300' : 'text-pink-500'}`}>.</span>
            </motion.span>
            <div className={`absolute -bottom-1 left-0 h-1 w-full ${isDarkMode ? 'bg-purple-500' : 'bg-indigo-400'} transform scale-x-0 origin-left`}></div>
          </div>
        </motion.div>

        <motion.h2 variants={itemVariants} className="text-xl font-medium text-center mb-6 tracking-wide">Welcome back</motion.h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div variants={itemVariants}>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <div className={`relative group ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full px-4 py-2.5 border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 focus:border-purple-400' : 'bg-white/90 border-gray-300 focus:border-indigo-400'
                } rounded-lg focus:outline-none focus:ring-2 transition-all duration-300`}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-purple-500 to-pink-500 group-focus-within:w-full transition-all duration-500"></div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
            <div className={`relative group ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full px-4 py-2.5 border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 focus:border-purple-400' : 'bg-white/90 border-gray-300 focus:border-indigo-400'
                } rounded-lg focus:outline-none focus:ring-2 transition-all duration-300`}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-purple-500 to-pink-500 group-focus-within:w-full transition-all duration-500"></div>
            </div>
          </motion.div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {error}
            </motion.p>
          )}

          {success && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-500 text-sm"
            >
              {success}
            </motion.p>
          )}

          <motion.button
            variants={itemVariants}
            type="submit"
            className={`w-full ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            } text-white py-3 rounded-lg mt-2 transition-all duration-300 shadow-lg hover:shadow-xl`}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <motion.p 
          variants={itemVariants}
          className={`text-right text-sm mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          <Link href="/reset-password" className={`${isDarkMode ? 'text-purple-300 hover:text-purple-200' : 'text-indigo-600 hover:text-indigo-800'} font-medium transition-colors`}>
            Forgot your password?
          </Link>
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="relative flex py-5 items-center mt-5"
        >
          <div className={`flex-grow border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
          <span className={`flex-shrink mx-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>New here?</span>
          <div className={`flex-grow border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
        </motion.div>

        <motion.p 
          variants={itemVariants}
          className="text-center"
        >
          <Link 
            href="/sign-up" 
            className={`inline-block w-full py-2.5 rounded-lg border ${
              isDarkMode 
                ? 'border-purple-600 text-purple-300 hover:bg-purple-900/30' 
                : 'border-indigo-500 text-indigo-700 hover:bg-indigo-50'
            } font-medium text-sm transition-all duration-300`}
          >
            Create an Account
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SignInPage;
