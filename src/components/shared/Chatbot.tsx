"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Send from "../../../assets/icons/send.svg";
import Image from "next/image";
import BotIcon from "../../../assets/icons/bot.svg";
import { GoogleGenerativeAI } from "@google/generative-ai"; 

const genAI = new GoogleGenerativeAI("AIzaSyBdzw6R-jZs5S7x3mUBTfzBl7gl3Ld-uNA"); 
interface ChatbotProps {
  userId: string;
}

interface ChatSession {
  startDate: Date;
  startTime: string;
  userMessages: string[];
  botMessages: string[];
}

const TypingIndicator = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
  </div>
);

// Debounce function to limit API calls
const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

const Chatbot = ({userId}:ChatbotProps) => {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I'm your mental health support assistant. I'm here to listen and help you navigate your emotions. How are you feeling today?" },
  ]);
  const [userImg, setUserImg] = useState<string>("https://api.dicebear.com/6.x/avataaars/svg");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      // Initialize a new chat session
      const now = new Date();
      const startTime = now.toLocaleTimeString();
      setCurrentSession({
        startDate: now,
        startTime,
        userMessages: [],
        botMessages: ["Hello! I'm your mental health support assistant. I'm here to listen and help you navigate your emotions. How are you feeling today?"]
      });
      return;
    }
    scrollToBottom();
  }, [messages]);
  
  // Update the current session when messages change
  useEffect(() => {
    if (currentSession) {
      setCurrentSession(prev => {
        if (!prev) return null;
        
        const userMsgs = messages
          .filter(msg => msg.role === "user")
          .map(msg => msg.text);
        
        const botMsgs = messages
          .filter(msg => msg.role === "bot")
          .map(msg => msg.text);
        
        return {
          ...prev,
          userMessages: userMsgs,
          botMessages: botMsgs
        };
      });
    }
  }, [messages]);

const fetchUserDetails = async () => {
          try{
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
                  console.log("User data:", userData.user.data);
                  if(userData.user.data.image){
                    setUserImg(userData.user.data.image);
                  }
          }
          catch(err){
              console.error("Error during fetching user details", err);
          }
      }
      // Fetch user details on initial render
      useEffect(() => {
          fetchUserDetails();
      }, []);


  // Automatically save chat when messages change
  const saveChat = useCallback(async () => {
    if (!currentSession || !userId || currentSession.userMessages.length === 0) return;

    setIsSaving(true);
    try {
      // Generate a new chatId if we don't have one
      const currentChatId = chatId || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch("/api/chat/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          chatId: currentChatId, // Use currentChatId instead of oldChatId
          userMessages: currentSession.userMessages,
          chatbotMessages: currentSession.botMessages,
          startDate: currentSession.startDate,
          startTime: currentSession.startTime
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save chat history");
      }
      
      const data = await response.json();
      if (chatId === '') {
        setChatId(currentChatId); // Set the chatId to our generated one if it was empty
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error auto-saving chat:", error);
      // Silent error in auto-save to not interrupt user experience
    } finally {
      setIsSaving(false);
    }
  }, [userId, chatId, currentSession]);
  
  // Debounced version of saveChat to avoid too many API calls
  const debouncedSaveChat = useDebounce(saveChat, 2000);
  
  // Auto-save when messages change and there's at least one user message
  useEffect(() => {
    if (currentSession?.userMessages.length && currentSession.userMessages.length > 0) {
      debouncedSaveChat();
    }
  }, [currentSession?.userMessages, currentSession?.botMessages, debouncedSaveChat]);

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
      3. If you detect signs of serious distress, depression, or harmful thoughts, gently suggest speaking with someone from the user's professional support network(available in the sidebar of this page)
      4. Stay focused on mental health and emotional well-being topics
      5. Never provide medical advice or diagnoses
      6. Be encouraging and positive while acknowledging feelings
      7. The user may share personal experiences, thoughts, or feelings
      8. The user will be from India
      9. Output should not be more than 90 words.
      10. The user may chat in English or Hindi so you should give answers in the same language.

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

  const startNewChat = async () => {
    // Create new session
    const now = new Date();
    const startTime = now.toLocaleTimeString();
    
    // Generate a new chatId
    const newChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Reset states
    setChatId(newChatId);
    setMessages([
      { role: "bot", text: "Hello! I'm your mental health support assistant. I'm here to listen and help you navigate your emotions. How are you feeling today?" },
    ]);
    setCurrentSession({
      startDate: now,
      startTime,
      userMessages: [],
      botMessages: ["Hello! I'm your mental health support assistant. I'm here to listen and help you navigate your emotions. How are you feeling today?"]
    });
  };

  const fetchChatHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chat/get?userId=${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setChatHistory([]);
          alert("No chat history found for this user.");
          return;
        }
        throw new Error("Failed to fetch chat history");
      }
      
      const data = await response.json();
      setChatHistory(data.data.chat || []);
      setChatId(data.data.chatId);
      setShowHistory(true);
      
    } catch (error) {
      console.error("Error fetching chat history:", error);
      alert("Failed to fetch chat history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeHistory = () => {
    setShowHistory(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const loadChatHistory = (chat: any) => {
    // Create messages array from chat history
    const newMessages = [];
    
    // First message is always from bot
    newMessages.push({
      role: "bot",
      text: "Hello! I'm your mental health support assistant. I'm here to listen and help you navigate your emotions. How are you feeling today?"
    });
    
    // Add user and bot messages alternately
    for (let i = 0; i < chat.userMessage.length; i++) {
      newMessages.push({ role: "user", text: chat.userMessage[i] });
      
      if (i < chat.chatbotMessage.length) { // Fixed the index issue here
        newMessages.push({ role: "bot", text: chat.chatbotMessage[i+1] });
      }
    }
    
    // Set messages and update current session
    setMessages(newMessages);
    
    // Set the chatId to continue the existing chat
    setChatId(chat.chatId);
    
    // Update current session with the loaded history
    setCurrentSession({
      startDate: new Date(chat.date),
      startTime: chat.time,
      userMessages: [...chat.userMessage],
      botMessages: [...chat.chatbotMessage]
    });
    
    // Close history view
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col h-[80vh] sm:h-[81.9vh] bg-white gap-y-4 shadow-md sm:py-6 sm:px-8 py-2 px-4 rounded-md">
      <div className="flex justify-between items-center bg-white">
        <h1 className="text-md font-semibold">AI Chat Assistant</h1>
        <div className="flex gap-2 items-center">
          {isSaving && (
            <span className="text-xs text-gray-500">Saving...</span>
          )}
        
          <button 
            onClick={fetchChatHistory}
            disabled={loading}
            className="text-xs bg-gray-200 hover:bg-gray-300 py-2 sm:py-3 px-3 rounded-md"
          >
            View History
          </button>
          <button 
            onClick={startNewChat}
            disabled={loading || !currentSession?.userMessages.length}
            className="text-xs bg-black text-white hover:bg-gray-800 py-2 sm:py-3 px-3 rounded-md"
          >
            New Chat
          </button>
        </div>
      </div>

      {showHistory ? (
        <div className="flex-1 overflow-y-scroll p-4 bg-gray-100 space-y-4 rounded-md">
          <div className="flex justify-between mb-4">
            <h2 className="font-medium">Chat History</h2>
            <button 
              onClick={closeHistory} 
              className="text-xs bg-black text-white hover:bg-black/55 py-2 px-2 rounded-md"
            >
              Back to Chat
            </button>
          </div>
          
          {chatHistory.length === 0 ? (
            <p className="text-center text-gray-500">No chat history found</p>
          ) : (
            chatHistory.map((chat, idx) => (
              <div 
                key={idx} 
                className="bg-white p-3 rounded-md shadow-sm hover:bg-gray-800
                transition duration-300 ease-in-out
                hover:text-white  cursor-pointer group"
                onClick={() => loadChatHistory(chat)}
              >
                <div className="flex justify-between mb-2 text-xs text-gray-500">
                <div className="flex items-center gap-x-2">
                <span>{formatDate(chat.date)}</span>
                  <span
                    className="bg-black  
                      group-hover:bg-white group-hover:text-black text-white px-2 py-1 rounded-md transition duration-300 ease-in-out"
                  >{chat.userMessage[0]}</span>
                  </div>
                  <span>{chat.time}</span>
                </div>
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {chat.userMessage.map((msg: string, i: number) => (
                    <div key={`user-${i}`} className="flex flex-col">
                      <span className="text-xs font-medium">You:</span>
                      <p className="text-sm ml-2">{msg}</p>
                      {chat.chatbotMessage[i] && (
                        <>
                          <span className="text-xs font-medium mt-1">Assistant:</span>
                          <p className="text-sm ml-2">{chat.chatbotMessage[i]}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-scroll p-4 bg-gray-100 space-y-4 rounded-md">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex items-center">
                {msg.role === "bot" && <Image src={BotIcon} alt="Bot Icon" width={35} height={35} className="mr-2" />}
                <div className={`p-2 text-sm rounded-md max-w-xs ${msg.role === "user" ? "bg-black text-white" : "bg-white shadow"}`}>
                  {msg.text}
                </div>
                {msg.role === "user" && <Image src={userImg} alt="User Icon" width={35} height={35} className="h-8 w-8 ml-2 rounded-full" />}
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
      )}

      <div className="bg-white py-3 px-6 border-t border-gray-300 flex flex-nowrap justify-between gap-x-2 items-center">
        <input
          type="text"
          className="outline-none p-2 w-full rounded-md border border-gray-300"
          placeholder="Type your message here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isTyping && sendMessage()}
          disabled={isTyping || showHistory}
        />
        <button 
          onClick={sendMessage} 
          className={`h-full px-4 w-fit ${isTyping || showHistory ? 'bg-gray-400' : 'bg-black'} text-white rounded-md`}
          disabled={isTyping || showHistory}
        >
          <Image src={Send} alt="Send Icon" width={20} height={20} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
