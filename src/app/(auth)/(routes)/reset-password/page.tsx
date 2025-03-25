"use client"
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ResetPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Track the current step in the reset password flow
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  
  // Store the OTP value received from the backend to compare with user input
  const [tokenId, setTokenId] = useState("");

  const handleGetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // In a real implementation, this would call an API endpoint to send an OTP
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      // For demo purposes, we're assuming the API returns the OTP
      // In production, the OTP would be sent to the user's email
      setTokenId(data.tokenId);
      setCurrentStep(2);
    } catch (err: any) {
      console.error("OTP request error:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate password match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);

    try {
      // In a real implementation, call an API endpoint to reset the password
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <div className="flex justify-center mb-4">
          <h1 className="text-2xl font-bold text-indigo-600">LOGO</h1>
        </div>
        <h2 className="text-xl font-semibold text-center mb-6">Reset Your Password</h2>
        
        {currentStep === 1 && (
          <form onSubmit={handleGetOTP}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Sending OTP...
                </>
              ) : (
                "Get OTP"
              )}
            </button>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">We've sent an OTP to your email address. Please enter it below.</p>
              <label className="block text-sm font-medium text-gray-700">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter OTP"
                required
                maxLength={6}
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90"
            >
              Verify OTP
            </button>
          </form>
        )}

        {currentStep === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter new password"
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Confirm new password"
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">Password reset successful. Redirecting...</p>}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-4">
          Remember your password?{" "}
          <span className="text-black font-semibold cursor-pointer">
            <Link href="/sign-in">Sign In</Link>
          </span>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
