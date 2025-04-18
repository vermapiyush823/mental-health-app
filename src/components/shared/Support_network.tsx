"use client"; // Ensures client-side rendering in Next.js
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon, UserPlusIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

interface SupportMember {
  name: string;
  email: string;
  phone: string;
}

interface SupportNetworkProps {
  userId: string;
}

const SupportNetwork = ({ userId }: SupportNetworkProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // State for managing support members
  const [supportMembers, setSupportMembers] = useState<SupportMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // State for storing random colors (fixes hydration issue)
  const [colors, setColors] = useState<string[]>([]);

  // State for handling form visibility
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState("");

  // State for handling form input values
  const [newMember, setNewMember] = useState<SupportMember>({
    name: "",
    email: "",
    phone: "",
  });

  // Ensure the component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch support members on component mount
  useEffect(() => {
    fetchSupportMembers();
  }, [userId]);

  // Update colors when support members change
  useEffect(() => {
    setColors(supportMembers.map(() => getRandomColor()));
  }, [supportMembers]);

  // Function to fetch support members
  const fetchSupportMembers = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch(`/api/support-network/get?userId=${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch support members");
      }
      
      console.log("Raw data from API:", data);
      
      // Process the data to ensure all required fields exist
      const validMembers = (data.supportMembers || []).map((member: any) => {
        return {
          name: member.name || '',
          email: member.email || '',
          phone: member.phone || ''
        };
      });
      
      console.log("Processed support members:", validMembers);
      setSupportMembers(validMembers);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      console.error("Error fetching support members:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate a random RGB color
  const getRandomColor = () => {
    // Predefined colors for consistency, but with some variation
    const colorOptions = [
      'rgb(79, 70, 229)', // indigo-600
      'rgb(124, 58, 237)', // violet-600
      'rgb(147, 51, 234)', // purple-600
      'rgb(168, 85, 247)', // purple-500
      'rgb(139, 92, 246)', // violet-500
      'rgb(99, 102, 241)', // indigo-500
      'rgb(59, 130, 246)', // blue-500
    ];
    
    // Add some variation to colors
    const baseColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    return baseColor;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMember({ ...newMember, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMember.name.trim() || !newMember.email.trim() ) {
      setError("Name and email are required");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      let response;
      const memberData = {
        userId,
        name: newMember.name.trim(),
        email: newMember.email.trim(),
        phone: newMember.phone.trim()
      };
      
      console.log("Submitting member data:", memberData);
      
      if (isEditing) {
        // Update existing support member
        response = await fetch('/api/support-network/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...memberData,
            memberId: currentMemberId
          })
        });
      } else {
        // Add new support member
        response = await fetch('/api/support-network/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberData)
        });
      }

      const data = await response.json();
      console.log("Response from server:", data);
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to save support member");
      }
      
      // Show success message
      setMessage(isEditing ? "Contact updated successfully" : "Contact added to your support network");
      setTimeout(() => setMessage(""), 3000);
      
      // Refresh the support members list
      await fetchSupportMembers();
      
      // Reset form and state
      setNewMember({ name: "", email: "", phone: "" });
      setShowForm(false);
      setIsEditing(false);
      setCurrentMemberId("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      console.error("Error saving support member:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing a support member
  const handleEdit = (member: SupportMember) => {
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone
    });
    setCurrentMemberId(member.name);
    setIsEditing(true);
    setShowForm(true);
  };

  // Handle deleting a support member
  const handleDelete = async (memberName: string) => {
    if (!confirm("Are you sure you want to remove this contact?")) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/support-network/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          memberId: memberName
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete support member");
      }
      
      // Show success message
      setMessage("Contact removed from your support network");
      setTimeout(() => setMessage(""), 3000);
      
      // Refresh the support members list
      await fetchSupportMembers();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      console.error("Error deleting support member:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancelling the form
  const handleCancel = () => {
    setNewMember({ name: "", email: "", phone: "" });
    setShowForm(false);
    setIsEditing(false);
    setCurrentMemberId("");
    setError("");
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 15 
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  // For safe SSR, use a conditional check for the theme
  const isDarkMode = mounted && resolvedTheme === 'dark';

  // Define theme-dependent styles
  const cardBgClass = isDarkMode 
    ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 text-gray-100 shadow-lg" 
    : "bg-white/90 backdrop-blur-sm border border-gray-100 text-gray-900 shadow-xl";
  
  // Gradient overlay
  const gradientOverlay = `absolute inset-0 bg-gradient-to-br ${
    isDarkMode 
      ? 'from-indigo-500/5 to-purple-500/5' 
      : 'from-purple-500/5 to-indigo-500/5'
  } pointer-events-none rounded-lg`;

  // Loading skeleton styles
  const skeletonClass = isDarkMode ? 'bg-gray-700/70' : 'bg-gray-200/70';

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`flex flex-col gap-y-5 ${cardBgClass} h-fit rounded-lg p-5 transition-colors duration-300 relative overflow-hidden`}
    >
      {/* Gradient overlay */}
      <div className={gradientOverlay}></div>

      {/* Title */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center justify-between z-10"
      >
        <h1 className="text-lg font-bold tracking-wide">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
            Support Network
          </span>
        </h1>
        {message && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-xs font-medium ${isDarkMode ? 'bg-green-900/20 text-green-300' : 'bg-green-100 text-green-600'} py-1 px-2 rounded-full`}
          >
            {message}
          </motion.p>
        )}
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-sm ${isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-600'} px-3 py-2 rounded-lg z-10`}
        >
          {error}
        </motion.p>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col gap-3 z-10">
          <div className={`h-20 ${skeletonClass} rounded-lg animate-pulse`}></div>
          <div className={`h-20 ${skeletonClass} rounded-lg animate-pulse`}></div>
          <div className={`h-20 ${skeletonClass} rounded-lg animate-pulse`}></div>
        </div>
      )}

      {/* Show message if no support members exist */}
      {!isLoading && supportMembers.length === 0 && (
        <motion.div 
          variants={itemVariants}
          className={`text-sm flex flex-col items-center justify-center py-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} z-10`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-center">Your support network is empty.</p>
          <p className="text-center">Add trusted contacts who can support you on your mental health journey.</p>
        </motion.div>
      )}

      {/* List of Support Members */}
      <motion.div 
        variants={containerVariants} 
        className="flex flex-col gap-y-3 z-10"
      >
        {supportMembers.map((member, index) => (
          <motion.div 
            key={index} 
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`flex flex-col sm:flex-row overflow-x-scroll sm:items-center justify-between gap-x-3 gap-y-3 ${
              isDarkMode ? 'bg-gray-700/80 border border-gray-600/30' : 'bg-gray-50 border border-gray-100'
            } p-4 rounded-lg transition-colors duration-300`}
          >
            <div className="flex items-center gap-x-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-md"
                style={{ backgroundColor: colors[index] }}
              >
                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h2 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{member.name || 'Unknown'}</h2>
                <div className="flex flex-col gap-x-4 gap-y-1 mt-1">
                  {member.email && (
                    <div className="flex items-center gap-x-1">
                      <EnvelopeIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{member.email}</p>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-x-1">
                      <PhoneIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{member.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex sm:flex-col gap-2 ml-auto">
              <motion.button 
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleEdit(member)}
                className={`${
                  isDarkMode 
                    ? 'bg-gray-600/90 hover:bg-gray-500/90 text-gray-200' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } py-1.5 px-3 rounded-lg transition-colors duration-300 text-sm flex items-center gap-x-1.5`}
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </motion.button>
              
              <motion.button 
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleDelete(member.name)}
                className={`${
                  isDarkMode 
                    ? 'bg-red-900/20 hover:bg-red-900/40 text-red-300' 
                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                } py-1.5 px-3 rounded-lg transition-colors duration-300 text-sm flex items-center gap-x-1.5`}
              >
                <TrashIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Remove</span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Toggle Add Contact Form */}
      {showForm && (
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} 
          className={`flex flex-col gap-y-3 ${isDarkMode ? 'bg-gray-700/80 border border-gray-600/30' : 'bg-gray-50 border border-gray-100'} p-4 rounded-lg transition-colors duration-300 z-10`}
        >
          <div className="flex items-center gap-x-3 mb-1">
            <UserPlusIcon className={`w-5 h-5 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
            <h2 className={`text-base font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {isEditing ? 'Edit Contact' : 'Add New Contact'}
            </h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="name" className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-1 block`}>Name*</label>
              <input
                id="name"
                type="text"
                name="name"
                value={newMember.name}
                onChange={handleChange}
                placeholder="Enter Name"
                className={`border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white focus:ring-purple-500/50' 
                    : 'bg-white border-gray-200 text-gray-900 focus:ring-purple-500/50'
                } transition-colors duration-300`}
                disabled={isLoading}
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-1 block`}>Email*</label>
              <input
                id="email"
                type="email"
                name="email"
                value={newMember.email}
                onChange={handleChange}
                placeholder="Enter Email"
                className={`border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white focus:ring-purple-500/50' 
                    : 'bg-white border-gray-200 text-gray-900 focus:ring-purple-500/50'
                } transition-colors duration-300`}
                disabled={isLoading}
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-1 block`}>Phone Number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={newMember.phone}
                onChange={handleChange}
                placeholder="Enter Phone Number"
                className={`border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white focus:ring-purple-500/50' 
                    : 'bg-white border-gray-200 text-gray-900 focus:ring-purple-500/50'
                } transition-colors duration-300`}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="flex gap-x-2 mt-2">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              type="submit"
              disabled={isLoading}
              className={`flex-1 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              } text-white py-2.5 rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-x-2`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {isEditing ? 'Save Changes' : 'Add Contact'}
                </>
              )}
            </motion.button>
            
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              type="button"
              onClick={handleCancel}
              className={`flex-1 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } py-2.5 rounded-lg font-medium transition-colors duration-300 text-sm flex items-center justify-center gap-x-2`}
              disabled={isLoading}
            >
              <XMarkIcon className="w-4 h-4" />
              Cancel
            </motion.button>
          </div>
        </motion.form>
      )}

      {/* Button to Show/Hide Form */}
      {!showForm && (
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => setShowForm(true)}
          className={`${
            isDarkMode 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
          } text-white flex items-center justify-center gap-x-2 py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg mt-2 z-10`}
          disabled={isLoading}
        >
          <UserPlusIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Add New Contact</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default SupportNetwork;
