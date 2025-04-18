"use client"
import React, { useEffect } from 'react'
import { useState } from 'react';
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { PencilSquareIcon, CheckIcon, XMarkIcon, ArrowUpTrayIcon, CameraIcon } from '@heroicons/react/24/outline'
interface ProfileProps {
    userId: string;
}

const Profile = ({userId}:ProfileProps) => {
    // Theme handling
    const [mounted, setMounted] = useState<boolean>(false);
    const { resolvedTheme } = useTheme();
    
    // Make sure component is mounted before using theme
    useEffect(() => {
      setMounted(true);
    }, []);
    
    // Define dynamic theme mode
    const isDarkMode = mounted && resolvedTheme === 'dark';
    
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
          stiffness: 100 
        }
      }
    };
    
    const moodLabels = [
        "Terrible", // 1
        "Very Bad", // 2
        "Bad",      // 3
        "Unhappy",  // 4
        "Neutral",  // 5
        "Okay",     // 6
        "Good",     // 7
        "Very Good",// 8
        "Great",    // 9
        "Excellent" // 10
    ];
    
    // Dynamic mood styles based on the current theme
    const getMoodStyle = (score: number) => {
      const baseStyle = "font-medium shadow-md transition-all duration-300";
      const styles = {
        1: isDarkMode ? `${baseStyle} text-red-300 bg-red-900/50 border border-red-700` : `${baseStyle} text-red-800 bg-red-100 border border-red-200`, // Terrible
        2: isDarkMode ? `${baseStyle} text-red-300 bg-red-900/50 border border-red-700` : `${baseStyle} text-red-700 bg-red-100 border border-red-200`, // Very Bad
        3: isDarkMode ? `${baseStyle} text-orange-300 bg-orange-900/50 border border-orange-700` : `${baseStyle} text-orange-700 bg-orange-100 border border-orange-200`, // Bad
        4: isDarkMode ? `${baseStyle} text-yellow-300 bg-yellow-900/50 border border-yellow-700` : `${baseStyle} text-yellow-800 bg-yellow-100 border border-yellow-200`, // Unhappy
        5: isDarkMode ? `${baseStyle} text-gray-300 bg-gray-800/50 border border-gray-600` : `${baseStyle} text-gray-700 bg-gray-100 border border-gray-200`, // Neutral
        6: isDarkMode ? `${baseStyle} text-green-300 bg-green-900/50 border border-green-700` : `${baseStyle} text-green-700 bg-green-100 border border-green-200`, // Okay
        7: isDarkMode ? `${baseStyle} text-green-300 bg-green-900/50 border border-green-700` : `${baseStyle} text-green-600 bg-green-100 border border-green-200`, // Good
        8: isDarkMode ? `${baseStyle} text-blue-300 bg-blue-900/50 border border-blue-700` : `${baseStyle} text-blue-600 bg-blue-100 border border-blue-200`, // Very Good
        9: isDarkMode ? `${baseStyle} text-blue-300 bg-blue-900/50 border border-blue-700` : `${baseStyle} text-blue-700 bg-blue-100 border border-blue-200`, // Great
        10: isDarkMode ? `${baseStyle} text-purple-300 bg-purple-900/50 border border-purple-700` : `${baseStyle} text-purple-700 bg-purple-100 border border-purple-200` // Excellent
      };
      
      return styles[score as keyof typeof styles] || 
        (isDarkMode ? "text-gray-300 bg-gray-700" : "text-gray-700 bg-gray-200");
    };
    
    // Theme-dependent styles
    const cardBgClass = isDarkMode 
      ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50" 
      : "bg-white/90 backdrop-blur-sm shadow-xl border border-gray-100";
    const headingClass = isDarkMode ? "text-white" : "text-gray-900";
    const subTextClass = isDarkMode ? "text-gray-400" : "text-gray-500";
    const buttonGradientClass = isDarkMode 
      ? "bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white" 
      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white";
    const secondaryButtonClass = isDarkMode
      ? "border border-gray-600 hover:bg-gray-700 text-gray-300"
      : "border border-gray-300 hover:bg-gray-100 text-gray-700";
    const pulseClass = isDarkMode ? "bg-gray-600" : "bg-gray-400";
    const inputClass = isDarkMode 
      ? "border border-gray-600 bg-gray-700/50 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
      : "border border-gray-300 bg-white text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [newImg, setNewImg] = useState<string>("https://api.dicebear.com/6.x/avataaars/svg");
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            console.log(file);
            setNewImg(URL.createObjectURL(file)); // Preview image
        }
    };
    const [newImgUpdated, setNewImgUpdated] = useState(false);
    const handleProfilePictureUpdate = async () => {
        if (!selectedImage) return;

        const formData = new FormData();
        formData.append("file", selectedImage);
        formData.append("userId", userId);

        try {
            const response = await fetch("/api/update/image", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Profile picture updated successfully", data.url);
                setNewImgUpdated(true);
                setTimeout(() => setNewImgUpdated(false), 3000);

                setNewImg(data.url.url); // Update with new image from server
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error updating profile picture");
            }
        } catch (error) {
            console.error("Failed to update profile picture ", error);
        }
    };
      
    const [emailNotifications, setEmailNotifications] = useState(true);
   const [smsUpdates, setSmsUpdates] = useState(false);
   const [enableEdit, setEnableEdit] = useState(false);
   const [email, setEmail] = useState("piyush@gmail.com");
   const [phone, setPhone] = useState("+91 1234567890");
   const [location, setLocation] = useState("Delhi, India");
   const [gender, setGender] = useState("Prefer not to say");
   const [age, setAge] = useState("25");
   const [memberDate, setMemberDate] = useState("January 2024");
    const [name, setName] = useState("John Doe");      
    const [todayMoodScore, setTodayMoodScore] = useState(7);
    const [todayMoodLabel, setTodayMoodLabel] = useState("Good");
    const [loading, setLoading] = useState(true);
    
    const fetchUserDetails = async () => {
        try{
            setLoading(true);
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
                setEmail(userData.user.data.email);
                setPhone(userData.user.data.phone||'Add Phone');
                setLocation(userData.user.data.location||'Set Location');
                setGender(userData.user.data.gender);
                setAge(userData.user.data.age);
                setName(userData.user.data.name);
                setNewImg(userData.user.data.image?userData.user.data.image:newImg);
                setMemberDate(
                    userData.user.data.createdAt
                      ? new Date(userData.user.data.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "Unknown"
                  );
                  const moodScores = userData?.user?.data?.moodScore || [7]; // Ensure it's an array
                  const lastMood = moodScores.length > 0 ? moodScores[moodScores.length - 1] : null;
                  
                  if (lastMood) {
                    setTodayMoodScore(lastMood?.score);
                    setTodayMoodLabel(moodLabels[lastMood?.score]);
                } 
                setLoading(false);
        }
        catch(err){
            console.error("Error during fetching user details", err);
            setLoading(false);
        }
    }
    // Fetch mood details on initial render
    const fetchMoodDetails = async () => {
        try {
            const response = await fetch(`/api/mood-track/get-mood-today?userId=${userId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch mood details");
            }
            const data = await response.json();
            const moodData = data.data;
            console.log("Mood Data", moodData);
            setTodayMoodScore(Math.round(moodData));
            setTodayMoodLabel(moodLabels[Math.round(moodData)]);
        } catch (error) {
            console.error("Error fetching mood details:", error);
        }
    };

    
    // Fetch user details on initial render
    useEffect(() => {
        fetchUserDetails();
    }, []);
    useEffect(() => {
        fetchMoodDetails();
    }, [userId]);

   // Save changes and exit edit mode
   const handleSave = async () => {
     setEnableEdit(false);
     try {
       const response = await fetch("/api/update/details", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({userId, email, phone, location, gender, age}),
       });
       
       if (!response.ok) {
         const errorData = await response.json();
         console.error("Error:", errorData.message);
         return;
       }
       console.log("Changes saved successfully!");

     } catch (err) {
       console.error("Error during updating details", err);
     }
   };

   return (
     <motion.div 
       initial="hidden"
       animate="visible"
       variants={containerVariants}
       className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}
     >
       <div className="max-w-6xl mx-auto space-y-6">
         {/* Main Profile Card */}
         <motion.div 
           variants={itemVariants}
           className={`${cardBgClass} rounded-xl overflow-hidden relative`}
         >
           {/* Subtle gradient overlay */}
           <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 pointer-events-none"></div>
           
           {/* Profile Header */}
           <div className="p-6 md:p-8">
             <div className="flex flex-col sm:flex-row items-center gap-6">
               {loading ? (
                 <div className={`animate-pulse ${pulseClass} w-32 h-32 rounded-full`}></div>
               ) : (
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative w-32 h-32 overflow-hidden rounded-full border-2 border-purple-300/50 shadow-lg"
                  >
                    <img
                      src={newImg}
                      alt="User Profile"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent"></div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: newImgUpdated ? 1 : 0 }}
                    className="absolute -bottom-2 left-0 right-0 text-center"
                  >
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                      Updated!
                    </span>
                  </motion.div>
                </div>
               )}
               
               <div className="text-center sm:text-left flex-1">
                 {loading ? (
                   <div className="animate-pulse space-y-3">
                     <div className={`h-8 ${pulseClass} rounded-md w-48 mx-auto sm:mx-0`}></div>
                     <div className={`h-4 ${pulseClass} rounded-md w-32 mx-auto sm:mx-0`}></div>
                     <div className={`h-6 ${pulseClass} rounded-md w-24 mx-auto sm:mx-0`}></div>
                   </div>
                 ) : (
                   <>
                     <motion.h2 variants={itemVariants} className={`text-3xl font-bold ${headingClass}`}>
                       {name}
                     </motion.h2>
                     <motion.p variants={itemVariants} className={`${subTextClass}`}>
                       Member since {memberDate}
                     </motion.p>
                     <motion.div variants={itemVariants} className="mt-2">
                       <span className={`inline-block px-4 py-1.5 rounded-xl ${getMoodStyle(todayMoodScore)}`}>
                         Feeling {todayMoodLabel} Today
                       </span>
                     </motion.div>
                   </>
                 )}
                 
                 <motion.div variants={itemVariants} className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                   <div className="relative">
                     <input
                       type="file"
                       accept="image/*"
                       onChange={handleImageChange}
                       className="hidden"
                       id="profile-picture-upload"
                     />
                     <label
                       htmlFor="profile-picture-upload"
                       className={`cursor-pointer ${buttonGradientClass} flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300`}
                     >
                       <CameraIcon className="w-5 h-5" />
                       <span>Change Picture</span>
                     </label>
                   </div>
                   
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={handleProfilePictureUpdate}
                     disabled={!selectedImage}
                     className={`${secondaryButtonClass} flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${!selectedImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                     <ArrowUpTrayIcon className="w-5 h-5" />
                     <span>Upload</span>
                   </motion.button>
                 </motion.div>
               </div>
             </div>
           </div>

           {/* Personal Information */}
           <motion.div variants={itemVariants} className="px-6 md:px-8 pb-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className={`text-2xl font-semibold ${headingClass}`}>Personal Information</h3>
               
               {/* Edit/Save Buttons */}
               <div className="flex gap-3">
                 {enableEdit ? (
                   <>
                     <motion.button
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       className={`${secondaryButtonClass} flex items-center gap-2 px-4 py-2 rounded-lg`}
                       onClick={() => setEnableEdit(false)}
                     >
                       <XMarkIcon className="w-5 h-5" />
                       <span>Cancel</span>
                     </motion.button>
                     
                     <motion.button
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       className={`${buttonGradientClass} flex items-center gap-2 px-4 py-2 rounded-lg shadow-md`}
                       onClick={handleSave}
                     >
                       <CheckIcon className="w-5 h-5" />
                       <span>Save</span>
                     </motion.button>
                   </>
                 ) : (
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     className={`${buttonGradientClass} flex items-center gap-2 px-4 py-2 rounded-lg shadow-md`}
                     onClick={() => setEnableEdit(true)}
                   >
                     <PencilSquareIcon className="w-5 h-5" />
                     <span>Edit Profile</span>
                   </motion.button>
                 )}
               </div>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-lg">
                 <tbody>
                   <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                     <td className={`p-4 font-bold whitespace-nowrap ${headingClass}`}>Email:</td>
                     <td className="p-4">
                       {loading ? (
                         <div className={`animate-pulse h-6 ${pulseClass} rounded-md w-3/4`}></div>
                       ) : enableEdit ? (
                         <input
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className={`${inputClass} p-2 rounded-md w-full outline-none`}
                         />
                       ) : (
                         <div className={`break-words overflow-hidden ${subTextClass}`}>{email}</div>
                       )}
                     </td>
                   </tr>
                   
                   <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                     <td className={`p-4 font-bold whitespace-nowrap ${headingClass}`}>Phone:</td>
                     <td className="p-4">
                       {loading ? (
                         <div className={`animate-pulse h-6 ${pulseClass} rounded-md w-3/4`}></div>
                       ) : enableEdit ? (
                         <input
                           type="text"
                           value={phone}
                           onChange={(e) => setPhone(e.target.value)}
                           className={`${inputClass} p-2 rounded-md w-full outline-none`}
                         />
                       ) : (
                         <div className={`break-words overflow-hidden ${subTextClass}`}>{phone}</div>
                       )}
                     </td>
                   </tr>
                   
                   <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                     <td className={`p-4 font-bold whitespace-nowrap ${headingClass}`}>Location:</td>
                     <td className="p-4">
                       {loading ? (
                         <div className={`animate-pulse h-6 ${pulseClass} rounded-md w-3/4`}></div>
                       ) : enableEdit ? (
                         <input
                           type="text"
                           value={location}
                           onChange={(e) => setLocation(e.target.value)}
                           className={`${inputClass} p-2 rounded-md w-full outline-none`}
                         />
                       ) : (
                         <div className={`break-words overflow-hidden ${subTextClass}`}>{location}</div>
                       )}
                     </td>
                   </tr>
                   
                   <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                     <td className={`p-4 font-bold whitespace-nowrap ${headingClass}`}>Age:</td>
                     <td className="p-4">
                       {loading ? (
                         <div className={`animate-pulse h-6 ${pulseClass} rounded-md w-16`}></div>
                       ) : enableEdit ? (
                         <input
                           type="number"
                           value={age}
                           onChange={(e) => setAge(e.target.value)}
                           className={`${inputClass} p-2 rounded-md w-full outline-none`}
                           min="1"
                           max="120"
                         />
                       ) : (
                         <div className={`break-words overflow-hidden ${subTextClass}`}>{age}</div>
                       )}
                     </td>
                   </tr>
                   
                   <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                     <td className={`p-4 font-bold whitespace-nowrap ${headingClass}`}>Gender:</td>
                     <td className="p-4">
                       {loading ? (
                         <div className={`animate-pulse h-6 ${pulseClass} rounded-md w-32`}></div>
                       ) : enableEdit ? (
                         <select
                           title="gender"
                           value={gender}
                           onChange={(e) => setGender(e.target.value)}
                           className={`${inputClass} p-2 rounded-md w-full outline-none`}
                         >
                           <option value="Male">Male</option>
                           <option value="Female">Female</option>
                           <option value="Other">Other</option>
                           <option value="Prefer not to say">Prefer not to say</option>
                         </select>
                       ) : (
                         <div className={`break-words overflow-hidden ${subTextClass}`}>{gender}</div>
                       )}
                     </td>
                   </tr>
                 </tbody>
               </table>
             </div>
           </motion.div>
         </motion.div>

         {/* Preferences Card */}
         <motion.div 
           variants={itemVariants}
           className={`${cardBgClass} rounded-xl p-6 md:p-8 relative`}
         >
           {/* Subtle gradient overlay */}
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
           
           <h3 className={`text-2xl font-semibold mb-5 ${headingClass}`}>Preferences</h3>
           
           <div className="space-y-4 z-10 relative">
             <motion.div 
               variants={itemVariants}
               className="flex items-center justify-between"
             >
               <p className={subTextClass}>Email Notifications</p>
               <button
                 onClick={() => setEmailNotifications(!emailNotifications)}
                 className={`w-12 h-6 flex items-center rounded-full transition p-1 ${
                   emailNotifications 
                     ? isDarkMode ? "bg-purple-600" : "bg-indigo-600" 
                     : isDarkMode ? "bg-gray-700" : "bg-gray-300"
                 }`}
               >
                 <div
                   className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                     emailNotifications ? "translate-x-6" : "translate-x-0"
                   }`}
                 ></div>
               </button>
             </motion.div>

             <motion.div 
               variants={itemVariants}
               className="flex items-center justify-between"
             >
               <p className={subTextClass}>SMS Updates</p>
               <button
                 onClick={() => setSmsUpdates(!smsUpdates)}
                 className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                   smsUpdates 
                     ? isDarkMode ? "bg-purple-600" : "bg-indigo-600" 
                     : isDarkMode ? "bg-gray-700" : "bg-gray-300"
                 }`}
               >
                 <div
                   className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                     smsUpdates ? "translate-x-6" : "translate-x-0"
                   }`}
                 ></div>
               </button>
             </motion.div>
           </div>
         </motion.div>
       </div>
     </motion.div>
   );
};

export default Profile;