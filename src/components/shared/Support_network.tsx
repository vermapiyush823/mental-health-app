"use client"; // Ensures client-side rendering in Next.js
import React, { useState, useEffect } from "react";
import Image from "next/image";
import UserIcon from "../../../assets/icons/user.png";

interface SupportMember {
  name: string;
  email: string;
  phone: string;
}

interface SupportNetworkProps {
  userId: string;
}

const SupportNetwork = ({ userId }: SupportNetworkProps) => {
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
    
    if (!newMember.name.trim() || !newMember.email.trim() || !newMember.phone.trim()) {
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

  return (
    <div className="flex flex-col gap-y-5 bg-white h-fit rounded-md p-5 shadow-md">
      {/* Title */}
      <h1 className="text-lg font-bold">Support Network</h1>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
      )}

      {/* Loading State */}
      {isLoading && (
        <p className="text-sm text-gray-500">Loading...</p>
      )}

      {/* Show message if no support members exist */}
      {!isLoading && supportMembers.length === 0 && (
        <p className="text-sm text-gray-500">
          You have no support members added. Click the button below to add a new contact.
        </p>
      )}

      {/* List of Support Members */}
      <div className="flex flex-col gap-y-4">
        {supportMembers.map((member, index) => (
          <div key={index} className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md">
            <div className="flex items-center gap-x-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: colors[index] }} // Use stored color
              >
                {member.name ? member.name.charAt(0) : '?'}
              </div>
              <div>
                <h2 className="font-medium">{member.name || 'Unknown'}</h2>
                {member.email && <p className="text-sm text-gray-500">{member.email}</p>}
                {member.phone && <p className="text-sm text-gray-500">{member.phone}</p>}
              </div>
            </div>
            <div className="flex gap-x-2 gap-y-2 flex-wrap justify-center items-center">
              <button 
                onClick={() => handleEdit(member)}
                className="text-xs bg-white w-full text-black px-2 py-1 sm:py-2 rounded hover:bg-gray-100 border"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(member.name)}
                className="text-xs bg-black w-full text-white px-2 py-1 sm:py-2 rounded hover:bg-black/55 border"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Toggle Add Contact Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-3 bg-gray-50 p-3 rounded-md">
          <input
            type="text"
            name="name"
            value={newMember.name}
            onChange={handleChange}
            placeholder="Enter Name"
            className="border rounded-md p-2 text-sm w-full"
          />
          <input
            type="email"
            name="email"
            value={newMember.email}
            onChange={handleChange}
            placeholder="Enter Email"
            className="border rounded-md p-2 text-sm w-full"
          />
          <input
            type="tel"
            name="phone"
            value={newMember.phone}
            onChange={handleChange}
            placeholder="Enter Phone Number"
            className="border rounded-md p-2 text-sm w-full"
          />
          <div className="flex gap-x-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-black text-white py-2 rounded-md font-medium hover:bg-black/55 transition disabled:bg-gray-400"
            >
              {isLoading ? "Saving..." : isEditing ? "Update Contact" : "Save Contact"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-200 py-2 rounded-md text-gray-700 font-medium hover:bg-gray-300 transition"
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
          className="flex items-center justify-center gap-x-2 w-full bg-gray-200 py-2 rounded-md text-gray-700 font-medium hover:bg-gray-300 transition"
          disabled={isLoading}
        >
          <Image src={UserIcon} alt="User Icon" width={20} height={20} />
          Add Contact
        </button>
      )}
    </div>
  );
};

export default SupportNetwork;
