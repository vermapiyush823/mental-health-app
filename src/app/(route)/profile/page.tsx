"use client";

import React, { useState } from "react";

const ProfilePage = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsUpdates, setSmsUpdates] = useState(false);
  const [enableEdit, setEnableEdit] = useState(false);
  const [email, setEmail] = useState("piyush@gmail.com");
  const [phone, setPhone] = useState("+91 1234567890");
  const [location, setLocation] = useState("Delhi, India");

  // Save changes and exit edit mode
  const handleSave = () => {
    setEnableEdit(false);
    // Optionally add API call logic here.
    console.log("Changes saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Left Section: Profile Details */}
        <div className="lg:col-span-2 bg-white shadow-lg rounded-lg p-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src="https://randomuser.me/api/portraits/men/1.jpg"
              alt="User Profile"
              className="w-32 h-32 rounded-full shadow-md"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold">Sarah Johnson</h2>
              <p className="text-gray-600">Member since January 2024</p>
              <p className="text-sm font-bold text-green-600 bg-green-100 rounded-xl py-1 px-2 mt-2 inline-block">
                Feeling Good Today
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mt-10">
            <h3 className="text-2xl font-semibold mb-3">Personal Information</h3>
            <table className="w-full text-lg">
              <tbody>
                <tr>
                  <td className="p-3 font-bold">Email:</td>
                  <td className="p-3">
                    {enableEdit ? (
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-400 p-2 rounded-md w-full outline-black"
                      />
                    ) : (
                      email
                    )}
                  </td>
                </tr>
                <tr className="">
                  <td className="p-3 font-bold">Phone:</td>
                  <td className="p-3">
                    {enableEdit ? (
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border border-gray-400 p-2 rounded-md w-full outline-black"
                      />
                    ) : (
                      phone
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Location:</td>
                  <td className="p-3">
                    {enableEdit ? (
                      <input
                      
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="border border-gray-400 p-2 rounded-md w-full outline-black"
                      />
                    ) : (
                      location
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

        {/* Right Section: Mood Statistics & Recent Activities */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          {/* Mood Statistics */}
          <h3 className="text-lg font-semibold mb-3">Mood Statistics</h3>
          <div className="bg-gray-200 h-32 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Coming soon...</p>
          </div>

          {/* Recent Activities */}
          <h3 className="text-lg font-semibold mt-6 mb-3">Recent Activities</h3>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Mood Check-ins:</strong> 28 days streak
            </p>
            <p className="text-gray-700">
              <strong>Journal Entries:</strong> 12 this month
            </p>
            <p className="text-gray-700">
              <strong>Meditation Sessions:</strong> 8 hours total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
