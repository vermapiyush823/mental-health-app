"use client"; // Ensures client-side rendering in Next.js
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

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
    return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMember({ ...newMember, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMember.name.trim() || !newMember.email.trim() ) {
      setError("All fields are required");
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

  // For safe SSR, use a conditional check for the theme
  const isDarkMode = mounted && resolvedTheme === 'dark';

  return (
    <div className={`flex flex-col gap-y-5 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} h-fit rounded-md p-5 shadow-md transition-colors duration-300`}>
      {/* Title */}
      <h1 className="text-lg font-bold">Support Network</h1>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
      )}

      {/* Loading State */}
      {isLoading && (
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Loading...</p>
      )}

      {/* Show message if no support members exist */}
      {!isLoading && supportMembers.length === 0 && (
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          You have no support members added. Click the button below to add a new contact.
        </p>
      )}

      {/* List of Support Members */}
      <div className="flex flex-col gap-y-4">
        {supportMembers.map((member, index) => (
          <div key={index} className={`flex items-center justify-between gap-x-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded-md transition-colors duration-300`}>
            <div className="flex items-center gap-x-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: colors[index] }} // Use stored color
              >
                {member.name ? member.name.charAt(0) : '?'}
              </div>
              <div>
                <h2 className="font-medium">{member.name || 'Unknown'}</h2>
                {member.email && <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{member.email}</p>}
                {member.phone && <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{member.phone}</p>}
              </div>
            </div>
            <div className="flex gap-x-2 gap-y-2 flex-wrap justify-center items-center">
              <button 
                onClick={() => handleEdit(member)}
                className={`text-xs ${isDarkMode ? 'bg-gray-600 text-gray-100 hover:bg-gray-500' : 'bg-white text-black hover:bg-gray-100'} w-full px-2 py-1 sm:py-2 rounded border transition-colors duration-300`}
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(member.name)}
                className={`text-xs ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-black hover:bg-black/55'} w-full text-white px-2 py-1 sm:py-2 rounded border transition-colors duration-300`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Toggle Add Contact Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className={`flex flex-col gap-y-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded-md transition-colors duration-300`}>
          <input
            type="text"
            name="name"
            value={newMember.name}
            onChange={handleChange}
            placeholder="Enter Name"
            className={`border rounded-md p-2 text-sm w-full ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} transition-colors duration-300`}
          />
          <input
            type="email"
            name="email"
            value={newMember.email}
            onChange={handleChange}
            placeholder="Enter Email"
            className={`border rounded-md p-2 text-sm w-full ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} transition-colors duration-300`}
          />
          <input
            type="tel"
            name="phone"
            value={newMember.phone}
            onChange={handleChange}
            placeholder="Enter Phone Number"
            className={`border rounded-md p-2 text-sm w-full ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} transition-colors duration-300`}
          />
          <div className="flex gap-x-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-black hover:bg-black/55'} text-white py-2 rounded-md font-medium transition-colors duration-300 disabled:bg-gray-600`}
            >
              {isLoading ? "Saving..." : isEditing ? "Update Contact" : "Save Contact"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={`flex-1 ${isDarkMode ? 'bg-gray-600 text-gray-100 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} py-2 rounded-md font-medium transition-colors duration-300`}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Button to Show/Hide Form */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className={`flex items-center justify-center gap-x-2 w-full ${isDarkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} py-2 rounded-md font-medium transition-colors duration-300`}
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
            />
          </svg>
          Add Contact
        </button>
      )}
    </div>
  );
};

export default SupportNetwork;
