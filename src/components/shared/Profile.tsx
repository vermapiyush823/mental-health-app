"use client"
import React, { useEffect } from 'react'
import { useState } from 'react';
interface ProfileProps {
    userId: string;
}

const Profile = ({userId}:ProfileProps) => {
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
      const moodStyles: { [key: number]: string } = {
        1: "text-red-800 bg-red-200",     // Terrible
        2: "text-red-700 bg-red-200",     // Very Bad
        3: "text-orange-700 bg-orange-200", // Bad
        4: "text-yellow-800 bg-yellow-200", // Unhappy
        5: "text-gray-700 bg-gray-200",   // Neutral
        6: "text-green-700 bg-green-200", // Okay
        7: "text-green-600 bg-green-200", // Good
        8: "text-blue-600 bg-blue-200",   // Very Good
        9: "text-blue-700 bg-blue-200",   // Great
        10: "text-purple-700 bg-purple-200", // Excellent
      };
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
     <div className="min-h-screen bg-gray-100 p-2">
       <div className="grid grid-cols-1  gap-6 max-w-6xl mx-auto">
         {/* Left Section: Profile Details */}
         <div className="lg:col-span-2 bg-white shadow-lg rounded-lg p-6">
           {/* Profile Header */}
           <div className="flex flex-col sm:flex-row items-center gap-6">
  {loading ? (
    <div className="w-32 h-32 rounded-full bg-gray-300 animate-pulse"></div>
  ) : (
   <>
    <img
      src={newImg}
      alt="User Profile"
      className="w-32 h-32 rounded-full shadow-md object-cover"
    />
    {newImgUpdated && (
      <p className="text-green-600 font-semibold">Profile picture updated!</p>
    )}
    </>
  )}
  <div className="text-center sm:text-left">
    {loading ? (
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-gray-300 rounded-md w-48"></div>
        <div className="h-4 bg-gray-300 rounded-md w-32"></div>
        <div className="h-6 bg-gray-300 rounded-md w-24"></div>
      </div>
    ) : (
      <>
        <h2 className="text-3xl font-bold">{name}</h2>
        <p className="text-gray-600">Member since {memberDate}</p>
        <p
          className={`text-sm font-bold rounded-xl py-1 px-2 mt-2 inline-block ${
            moodStyles[todayMoodScore] || "text-gray-700 bg-gray-200"
          }`}
        >
          Feeling {todayMoodLabel} Today
        </p>
      </>
    )}
    <div className="mt-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id="profile-picture-upload"
      />
      <label
        htmlFor="profile-picture-upload"
        className="cursor-pointer bg-black text-white px-4 py-3 rounded-lg"
      >
        Change Picture
      </label>
      <button
        onClick={handleProfilePictureUpdate}
        className="ml-4 text-black border-black border-2 px-4 py-2 rounded-lg"
      >
        Upload
      </button>
    </div>
  </div>
</div>

           {/* Personal Information */}
            <div className="mt-10 flex  overflow-scroll flex-col">
              <h3 className="text-2xl font-semibold mb-3">Personal Information</h3>
              <table className="max-w-6xl text-lg overflow-hidden">
              <tbody >
                <tr>
                  <td className="p-3 font-bold whitespace-nowrap">Email:</td>
                  <td className="p-3 break-words">
                    {loading ? (
                      <div className="animate-pulse h-6 bg-gray-300 rounded-md w-3/4"></div>
                    ) : enableEdit ? (
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-400 p-2 rounded-md w-full outline-black"
                      />
                    ) : (
                      <div className="break-words overflow-hidden">{email}</div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold whitespace-nowrap">Phone:</td>
                  <td className="p-3 break-words">
                    {loading ? (
                      <div className="animate-pulse h-6 bg-gray-300 rounded-md w-3/4"></div>
                    ) : enableEdit ? (
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border border-gray-400 p-2 rounded-md w-full outline-black"
                      />
                    ) : (
                      <div className="break-words overflow-hidden">{phone}</div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold whitespace-nowrap">Location:</td>
                  <td className="p-3 break-words">
                    {loading ? (
                      <div className="animate-pulse h-6 bg-gray-300 rounded-md w-3/4"></div>
                    ) : enableEdit ? (
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="border border-gray-400 p-2 rounded-md w-full outline-black"
                      />
                    ) : (
                      <div className="break-words overflow-hidden">{location}</div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold whitespace-nowrap">Age:</td>
                  <td className="p-3 break-words">
                    {loading ? (
                      <div className="animate-pulse h-6 bg-gray-300 rounded-md w-16"></div>
                    ) : enableEdit ? (
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="border border-gray-400 p-2 rounded-md w-full outline-black"
                        min="1"
                        max="120"
                      />
                    ) : (
                      <div className="break-words overflow-hidden">{age}</div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold whitespace-nowrap">Gender:</td>
                  <td className="p-3 break-words">
                    {loading ? (
                      <div className="animate-pulse h-6 bg-gray-300 rounded-md w-32"></div>
                    ) : enableEdit ? (
                      <select
                        title="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="border border-gray-400 p-2 rounded-md w-full outline-black"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <div className="break-words overflow-hidden">{gender}</div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
             {/* Preferences */}
             <h3 className="text-2xl font-semibold mt-6 mb-3">Preferences</h3>
             <div className="flex items-center justify-between">
               <p className="text-gray-700">Email Notifications</p>
               <button
                 onClick={() => setEmailNotifications(!emailNotifications)}
                 className={`w-10 h-5 flex items-center rounded-full transition p-1 ${
                   emailNotifications ? "bg-black" : "bg-gray-300"
                 }`}
               >
                 <div
                   className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${
                     emailNotifications ? "translate-x-4" : ""
                   }`}
                 ></div>
               </button>
             </div>

             <div className="flex items-center justify-between mt-2">
               <p className="text-gray-700">SMS Updates</p>
               <button
                 onClick={() => setSmsUpdates(!smsUpdates)}
                 className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
                   smsUpdates ? "bg-black" : "bg-gray-300"
                 }`}
               >
                 <div
                   className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${
                     smsUpdates ? "translate-x-4" : ""
                   }`}
                 ></div>
               </button>
             </div>
           </div>

           {/* Edit/Save Buttons */}
           <div className="flex justify-end space-x-4 mt-6">
             {enableEdit ? (
               <>
                 <button
                   className="border px-4 py-2 rounded-lg text-gray-700"
                   onClick={() => setEnableEdit(false)}
                 >
                   Cancel
                 </button>
                 <button
                   className="bg-black text-white px-4 py-2 rounded-lg"
                   onClick={handleSave}
                 >
                   Save Changes
                 </button>
               </>
             ) : (
               <button
                 className="border px-4 py-2 rounded-lg text-gray-700"
                 onClick={() => setEnableEdit(true)}
               >
                 Edit Profile
               </button>
             )}
           </div>
         </div>
       </div>
     </div>
   );
};
export default Profile