"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";
import Revibe from "../../../../../assets/icons/revibe-logo.svg";

const SignUpPage = () => {
  const [name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  // Handle mounting for theme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, age, gender, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Sign-up successful:", data);
      router.push('/sign-in');
      setSuccess("Account created successfully! You can now sign in.");
    } catch (err) {
      console.error("Error during sign-up:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
      {/* CSS-based animated background gradient */}
<div 
  className={`absolute rounded-full filter blur-[60px] opacity-60 ${
    isDarkMode 
      ? 'bg-blue-500/20 top-1/4 left-1/4 w-80 h-80' 
      : 'bg-pink-500/30 top-1/4 left-1/4 w-80 h-80'
  }`}
  style={{
    animation: "blobove 7s infinite ease-in-out",
    animationDelay: "0ms"
  }}
></div>
<div 
  className={`absolute rounded-full filter blur-[60px] opacity-60 ${
    isDarkMode 
      ? 'bg-indigo-500/20 top-1/3 right-1/3 w-96 h-96' 
      : 'bg-indigo-500/30 top-1/3 right-1/3 w-96 h-96'
  }`}
  style={{
    animation: "blob-move 7s infinite ease-in-out",
    animationDelay: "2000ms"
  }}
></div>
<div 
  className={`absolute rounded-full filter blur-[60px] opacity-60 ${
    isDarkMode 
      ? 'bg-purple-500/20 bottom-1/4 right-1/4 w-72 h-72' 
      : 'bg-purple-500/30 bottom-1/4 right-1/4 w-72 h-72'
  }`}
  style={{
    animation: "blob-move 7s infinite ease-in-out",
    animationDelay: "4000ms"
  }}
></div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`auth-content relative z-10 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-6 backdrop-blur-md bg-opacity-80 dark:bg-opacity-30 border border-white/10`}
      >
          <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className={`relative text-3xl font-extrabold ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'} tracking-wider`}>
           
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative z-10 flex items-center"
            >
               <motion.img
                src={Revibe.src}
                alt="Logo"
                className={`h-12 w-12 rounded-full mr-1 shadow-md`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              ReVibe
              <span className={`${isDarkMode ? 'text-pink-300' : 'text-pink-500'}`}>.</span>
            </motion.span>
            <div className={`absolute -bottom-1 left-0 h-1 w-full ${isDarkMode ? 'bg-purple-500' : 'bg-indigo-400'} transform scale-x-0 origin-left`}></div>
          </div>
        </motion.div>

        <motion.h2 variants={itemVariants} className="text-xl font-medium text-center mb-6">Create Your Account</motion.h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div variants={itemVariants}>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
            <div className={`relative group`}>
              <input
                type="text"
                value={name}
                onChange={(e) => setFullName(e.target.value)}
                className={`block w-full px-4 py-2.5 focus:outline-none rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? "border border-gray-600 bg-gray-700/50 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    : "border border-gray-300 bg-white text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                }`}
                placeholder="Enter your full name"
                required
                disabled={isLoading}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className={`block text-sm font-medium mb-1  ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <div className={`relative group`}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full px-4 focus:outline-none py-2.5 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? "border border-gray-600 bg-gray-700/50 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    : "border border-gray-300 bg-white text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                }`}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />

            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={itemVariants}>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Age</label>
              <div className={`relative group`}>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value) || "")}
                  className={`block w-full px-4 focus:outline-none py-2.5 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? "border border-gray-600 bg-gray-700/50 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      : "border border-gray-300 bg-white text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                  placeholder="Age"
                  min={1}
                  required
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Gender</label>
              <div className={`relative group`}>
                <select
                  value={gender}
                  title="gender"
                  onChange={(e) => setGender(e.target.value)}
                  className={`block w-full px-4 focus:outline-none py-3 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? "border border-gray-600 bg-gray-700/50 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      : "border border-gray-300 bg-white text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                  required
                  disabled={isLoading}
                >
                  <option value="" className={isDarkMode ? 'bg-gray-700' : 'bg-white'}>Select</option>
                  <option value="Male" className={isDarkMode ? 'bg-gray-700' : 'bg-white'}>Male</option>
                  <option value="Female" className={isDarkMode ? 'bg-gray-700' : 'bg-white'}>Female</option>
                  <option value="Other" className={isDarkMode ? 'bg-gray-700' : 'bg-white'}>Other</option>
                </select>
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
            <div className={`relative group`}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full px-4 focus:outline-none py-2.5 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? "border border-gray-600 bg-gray-700/50 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    : "border border-gray-300 bg-white text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                }`}
                placeholder="Create a password"
                required
                disabled={isLoading}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
            <div className={`relative group`}>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`block w-full px-4 focus:outline-none py-2.5 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? "border border-gray-600 bg-gray-700/50 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    : "border border-gray-300 bg-white text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                }`}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
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
                Creating account...
              </div>
            ) : (
              "Create Account"
            )}
          </motion.button>
        </form>

        <motion.div 
          variants={itemVariants}
          className="relative flex py-5 items-center mt-5"
        >
          <div className={`flex-grow border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
          <span className={`flex-shrink mx-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Already have an account?</span>
          <div className={`flex-grow border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
        </motion.div>

        <motion.p 
          variants={itemVariants}
          className="text-center"
        >
          <Link 
            href="/sign-in" 
            className={`inline-block w-full py-2.5 rounded-lg border ${
              isDarkMode 
                ? 'border-purple-600 text-purple-300 hover:bg-purple-900/30' 
                : 'border-indigo-500 text-indigo-700 hover:bg-indigo-50'
            } font-medium text-sm transition-all duration-300`}
          >
            Sign In
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;