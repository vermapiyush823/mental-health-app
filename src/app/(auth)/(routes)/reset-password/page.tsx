"use client"
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";
import Revibe from "../../../../../assets/icons/revibe-logo.svg";

const ResetPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  
  // Track the current step in the reset password flow
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  
  // Store the OTP value received from the backend to compare with user input
  const [tokenId, setTokenId] = useState("");
  
  // Create refs for OTP input fields
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Initialize the refs array
  useEffect(() => {
    otpInputRefs.current = otpInputRefs.current.slice(0, 6);
  }, []);

  // Handle mounting for theme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';

  const handleGetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setTokenId(data.tokenId);
      setCurrentStep(2);
    } catch (err: any) {
      console.error("OTP request error:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    
    setOtp(newOtpValues.join(""));
    
    if (value !== "" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otpValues[index] === "" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").trim();
    
    if (!/^\d+$/.test(pastedText)) return;
    
    const digits = pastedText.slice(0, 6).split("");
    const newOtpValues = [...otpValues];
    
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtpValues[index] = digit;
      }
    });
    
    setOtpValues(newOtpValues);
    setOtp(newOtpValues.join(""));
    
    const nextEmptyIndex = newOtpValues.findIndex(val => val === "");
    if (nextEmptyIndex !== -1) {
      otpInputRefs.current[nextEmptyIndex]?.focus();
    } else if (digits.length < 6) {
      otpInputRefs.current[digits.length]?.focus();
    } else {
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }
    
    try {
      const response = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp, tokenId }),
      });
      
      const data = await response.json();
      if (!response.ok) {
          throw new Error(data.error || "Failed to verify OTP");
      }
      
      if (data.message === "OTP verified successfully") {
          setCurrentStep(3);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setError(err.message || "Failed to verify OTP. Please try again.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/change-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push('/sign-in');
      }, 3000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "Failed to reset password. Please try again.");
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
        staggerChildren: 0.1,
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

  const stepVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
    exit: { 
      x: -50, 
      opacity: 0,
      transition: { ease: "easeInOut" }
    }
  };

  return (
    <div className="flex min-h-screen w-lg items-center justify-center overflow-hidden relative">
  {/* CSS-based animated blobs */}
{/* Tailwind-animated blobs */}
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
            <div className={`absolute -bottom-1 left-0 h-1 w-full ${isDarkMode ? 'bg-purple-500' : 'bg-indigo-400'} transform scale-x-0 origin-left animate-slideRight`}></div>
          </div>
        </motion.div>

        <motion.h2 
          variants={itemVariants} 
          className="text-xl font-medium text-center mb-6 tracking-wide"
        >
          Reset Your Password
        </motion.h2>

        {/* Step 1: Enter Email */}
        {currentStep === 1 && (
          <motion.div
            key="step-1"
            initial="hidden"
            animate="visible"
            variants={stepVariants}
          >
            <form onSubmit={handleGetOTP} className="space-y-5">
              <motion.div variants={itemVariants}>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <div className={`relative group ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
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

              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                variants={itemVariants}
                type="submit"
                className={`w-full ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                } text-white py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl`}
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
                    Sending OTP...
                  </div>
                ) : (
                  "Get OTP"
                )}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* Step 2: Enter OTP */}
        {currentStep === 2 && (
          <motion.div
            key="step-2"
            initial="hidden"
            animate="visible"
            variants={stepVariants}
            className="space-y-5"
          >
            <motion.p variants={itemVariants} className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2 text-center`}>
              We've sent an OTP to your email address.<br />Please enter it below.
            </motion.p>
            
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <motion.div variants={itemVariants} className="mb-4">
                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Enter 6-digit OTP</label>
                
                <div className="flex justify-between space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      custom={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <input
                        ref={el => { otpInputRefs.current[index] = el; }}
                        type="text"
                        value={otpValues[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className={`w-10 h-12 text-center font-bold text-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-400'
                        } rounded-md focus:outline-none focus:ring-2 ${
                          isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-indigo-500'
                        } transition-all duration-300`}
                        maxLength={1}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        required
                      />
                    </motion.div>
                  ))}
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

              <motion.button
                variants={itemVariants}
                type="submit"
                className={`w-full ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                } text-white py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                  otp.length !== 6 ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={otp.length !== 6}
                whileHover={otp.length === 6 ? { scale: 1.02 } : {}}
                whileTap={otp.length === 6 ? { scale: 0.98 } : {}}
              >
                Verify OTP
              </motion.button>

              <motion.button
                variants={itemVariants}
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`w-full mt-2 border ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                } py-2 rounded-lg transition-all duration-300`}
              >
                Back to Email
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* Step 3: Create New Password */}
        {currentStep === 3 && (
          <motion.div
            key="step-3"
            initial="hidden"
            animate="visible"
            variants={stepVariants}
          >
            <form onSubmit={handleResetPassword} className="space-y-5">
              <motion.div variants={itemVariants}>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
                <div className={`relative group ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`block w-full px-4 focus:outline-none py-2.5 rounded-lg transition-all duration-300 ${
                      isDarkMode 
                        ? "border border-gray-600 bg-gray-700/50 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        : "border border-gray-300 bg-white text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    }`}
                 
                    placeholder="Create new password"
                    required
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
                <div className={`relative group ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full px-4 focus:outline-none py-2.5 rounded-lg transition-all duration-300 ${
                      isDarkMode 
                        ? "border border-gray-600 bg-gray-700/50 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        : "border border-gray-300 bg-white text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    }`}
                 
                    placeholder="Confirm new password"
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
                  Password reset successful! Redirecting to login...
                </motion.p>
              )}

              <motion.button
                variants={itemVariants}
                type="submit"
                className={`w-full ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                } text-white py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl`}
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
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </motion.button>
            </form>
          </motion.div>
        )}

        <motion.div 
          variants={itemVariants}
          className="relative flex py-5 items-center mt-5"
        >
          <div className={`flex-grow border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
          <span className={`flex-shrink mx-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Remember your password?</span>
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
            Back to Sign In
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
