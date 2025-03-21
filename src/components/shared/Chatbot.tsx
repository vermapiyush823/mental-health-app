"use client";
import React, { useState, useRef, useEffect } from "react";
import Send from "../../../assets/icons/send.svg";
import Image from "next/image";
import BotIcon from "../../../assets/icons/bot.svg";
import UserIcon from "../../../assets/icons/user.png";
import { GoogleGenerativeAI } from "@google/generative-ai"; 

const genAI = new GoogleGenerativeAI("AIzaSyBdzw6R-jZs5S7x3mUBTfzBl7gl3Ld-uNA"); 

const TypingIndicator = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
  </div>
);

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I'm your mental health support assistant. I'm here to listen and help you navigate your emotions. How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });      
      const prompt = `You are a supportive mental health chatbot. Your role is to:
      1. Provide emotional support and understanding
      2. Listen and respond with empathy
      3. If you detect signs of serious distress, depression, or harmful thoughts, gently suggest speaking with a mental health professional
      4. Stay focused on mental health and emotional well-being topics
      5. Never provide medical advice or diagnoses
      6. Be encouraging and positive while acknowledging feelings
      7. The user may share personal experiences, thoughts, or feelings
      8. The user will be from India
      9. Output should not be more than 90 words.

      Previous conversation: ${JSON.stringify(messages)}
      User's message: ${input}
      
      Respond in a caring, supportive manner:`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const botResponse = { role: "bot", text: response.text() };

      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "bot", text: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] sm:h-[60vh] bg-white gap-y-4 sm:py-4 sm:px-8 py-2 px-4 rounded-md">
      <h1 className="text-md font-semibold bg-white">AI Chat Assistant</h1>

      <div className="flex-1 overflow-y-scroll p-4 bg-gray-100 space-y-4 rounded-md">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex items-center">
              {msg.role === "bot" && <Image src={BotIcon} alt="Bot Icon" width={35} height={35} className="mr-2" />}
              <div className={`p-2 text-sm rounded-md max-w-xs ${msg.role === "user" ? "bg-black text-white" : "bg-white shadow"}`}>
                {msg.text}
              </div>
              {msg.role === "user" && <Image src={UserIcon} alt="User Icon" width={35} height={35} className="ml-2" />}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center">
              <Image src={BotIcon} alt="Bot Icon" width={35} height={35} className="mr-2" />
              <div className="p-2 text-sm rounded-md max-w-xs bg-white shadow">
                <TypingIndicator />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white py-3 px-6 border-t border-gray-300 flex flex-nowrap justify-between gap-x-2 items-center">
        <input
          type="text"
          className="outline-none p-2 w-full rounded-md border border-gray-300"
          placeholder="Type your message here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isTyping && sendMessage()}
          disabled={isTyping}
        />
        <button 
          onClick={sendMessage} 
          className={`h-full px-4 w-fit ${isTyping ? 'bg-gray-400' : 'bg-black'} text-white rounded-md`}
          disabled={isTyping}
        >
          <Image src={Send} alt="Send Icon" width={20} height={20} />
          {}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
