"use client";

import React, { useState } from "react";

const ProfilePage = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsUpdates, setSmsUpdates] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex  justify-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full">
        {/* Profile Header */}
        <div className="flex items-center space-x-4">
          <img
            src="https://randomuser.me/api/portraits/men/1.jpg"
            alt="User Profile"
            className="w-40 h-40 rounded-full"
          />
          <div>
            <h2 className="text-3xl font-bold">Sarah Johnson</h2>
            <p className="text-gray-600">Member since January 2024</p>
            <p className="text-sm font-bold text-green-600 bg-green-100 rounded-xl py-1 px-2 mt-1 w-fit">
            Feeling Good Today
          </p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-2 gap-8 mt-20">
          {/* Left Section: Personal Information & Preferences */}
          <div>
            <h3 className="text-2xl font-semibold mb-3">Personal Information</h3>
            <p className="text-gray-700"><strong>Email:</strong> sarah.johnson@example.com</p>
            <p className="text-gray-700"><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p className="text-gray-700"><strong>Location:</strong> San Francisco, CA</p>

            {/* Preferences */}
            <h3 className="text-lg font-semibold mt-6 mb-3">Preferences</h3>
            <div className="flex items-center justify-between">
              <p className="text-gray-700">Email Notifications</p>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
                  emailNotifications ? "bg-black" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${
                    emailNotifications ? "translate-x-5" : ""
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
                    smsUpdates ? "translate-x-5" : ""
                  }`}
                ></div>
              </button>
            </div>
          </div>

          {/* Right Section: Mood Statistics & Recent Activities */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Mood Statistics</h3>
            <div className="bg-gray-200 h-32 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Coming soon...</p>
            </div>

            {/* Recent Activities */}
            <h3 className="text-lg font-semibold mt-6 mb-3">Recent Activities</h3>
            <p className="text-gray-700"><strong>Mood Check-ins:</strong> 28 days streak</p>
            <p className="text-gray-700"><strong>Journal Entries:</strong> 12 this month</p>
            <p className="text-gray-700"><strong>Meditation Sessions:</strong> 8 hours total</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button className="border px-4 py-2 rounded-lg text-gray-700">Edit Profile</button>
          <button className="bg-black text-white px-4 py-2 rounded-lg">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
