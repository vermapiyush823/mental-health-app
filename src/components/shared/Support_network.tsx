"use client"; // Ensures client-side rendering in Next.js
import React, { useState, useEffect } from "react";
import Image from "next/image";
import UserIcon from "../../../assets/icons/user.png";

const SupportNetwork = () => {
  // State for managing support members
  const [supportMembers, setSupportMembers] = useState([
    { name: "Dr. John Smith", role: "Primary Therapist" },
    { name: "Emily Wilson", role: "Support Group Leader" },
  ]);

  // State for storing random colors (fixes hydration issue)
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    // Generate random colors for each support member when component mounts
    setColors(supportMembers.map(() => getRandomColor()));
  }, []); // Runs only once when the component mounts

  // Function to generate a random RGB color
  const getRandomColor = () => {
    return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
  };

  // State for handling form visibility
  const [showForm, setShowForm] = useState(false);

  // State for handling form input values
  const [newMember, setNewMember] = useState({ name: "", role: "" });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMember({ ...newMember, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const addContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMember.name.trim() && newMember.role.trim()) {
      setSupportMembers([...supportMembers, newMember]);
      setColors([...colors, getRandomColor()]); // Assign a new color
      setNewMember({ name: "", role: "" }); // Reset input fields
      setShowForm(false); // Hide form after submission
    }
  };

  return (
    <div className="flex flex-col gap-y-5 bg-white h-fit rounded-md p-5 shadow-md">
      {/* Title */}
      <h1 className="text-lg font-bold">Support Network</h1>

      {/* Show message if no support members exist */}
      {supportMembers.length === 0 && (
        <p className="text-sm text-gray-500">
          You have no support members added. Click the button below to add a new contact.
        </p>
      )}

      {/* List of Support Members */}
      <div className="flex flex-col gap-y-4">
        {supportMembers.map((member, index) => (
          <div key={index} className="flex items-center gap-x-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: colors[index] }} // Use stored color
            >
              {member.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-medium">{member.name}</h2>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toggle Add Contact Form */}
      {showForm && (
        <form onSubmit={addContact} className="flex flex-col gap-y-3">
          <input
            type="text"
            name="name"
            value={newMember.name}
            onChange={handleChange}
            placeholder="Enter Name"
            className="border rounded-md p-2 text-sm w-full"
          />
          <input
            type="text"
            name="role"
            value={newMember.role}
            onChange={handleChange}
            placeholder="Enter Role"
            className="border rounded-md p-2 text-sm w-full"
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md font-medium hover:bg-black/55 transition"
          >
            Save Contact
          </button>
        </form>
      )}

      {/* Button to Show/Hide Form */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center justify-center gap-x-2 w-full bg-gray-200 py-2 rounded-md text-gray-700 font-medium hover:bg-gray-300 transition"
      >
        <Image src={UserIcon} alt="User Icon" width={20} height={20} />
        {showForm ? "Cancel" : "Add Contact"}
      </button>
    </div>
  );
};

export default SupportNetwork;
