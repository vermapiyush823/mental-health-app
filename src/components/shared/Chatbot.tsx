"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Send from "../../../assets/icons/send.svg";
import Image from "next/image";
import BotIcon from "../../../assets/icons/bot.svg";
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

const genAI = new GoogleGenerativeAI("AIzaSyBlFmpcrqV7t0a1Cl_ob9whNPJFXkbjwMg"); 
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
  const [moodData, setMoodData] = useState<any[]>([]);
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
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Handle mounting for theme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use isDarkMode only if component is mounted
  const isDarkMode = mounted && resolvedTheme === 'dark';

  // Animation variants for the container
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

  // Item variants for message animations
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Define theme-dependent styles
  const cardBgClass = isDarkMode 
    ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 text-gray-100 shadow-lg" 
    : "bg-white/90 backdrop-blur-sm border border-gray-100 text-gray-900 shadow-xl";
    
  // Gradient overlay
  const gradientOverlay = `absolute inset-0 bg-gradient-to-br ${
    isDarkMode 
      ? 'from-purple-500/5 to-indigo-500/5' 
      : 'from-indigo-500/5 to-purple-500/5'
  } pointer-events-none rounded-lg`;

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        const response = await fetch(`/api/mood-track/get-week-data?userId=${userId}`);
        const data = await response.json();
        setMoodData(data.data);
      } catch (error) {
        console.error("Error fetching mood data:", error);
      }
    };

    fetchMoodData();
  }, [userId]);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const chatContainer = document.getElementById('chat-messages-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
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
    
    // Only scroll if not showing history and after a small delay to ensure DOM is updated
    if (!showHistory) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, showHistory]);
  
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

  // Initialize chat ID from session storage or generate a new one
  useEffect(() => {
    // Check if we have a chatId in session storage first
    const storedChatId = sessionStorage.getItem(`chatId_${userId}`);
    
    if (storedChatId) {
      // Use the stored chatId if available
      setChatId(storedChatId);
      console.log("Restored chat ID from session storage:", storedChatId);
    } else if (chatId === '') {
      // Generate a new consistent ID for this session
      const generatedId = `chat_${userId}_${Date.now()}`;
      setChatId(generatedId);
      // Store in session storage for persistence across refreshes
      sessionStorage.setItem(`chatId_${userId}`, generatedId);
      console.log("Generated new chat ID:", generatedId);
    }
  }, [userId, chatId]);

  // Save chat ID to session storage whenever it changes
  useEffect(() => {
    if (chatId) {
      sessionStorage.setItem(`chatId_${userId}`, chatId);
    }
  }, [chatId, userId]);

  // Automatically save chat when messages change
  const saveChat = useCallback(async () => {
    if (!currentSession || !userId || currentSession.userMessages.length === 0) return;

    // Skip saving if already in progress to prevent duplicate calls
    if (isSaving) return;
    
    // Make sure we're using the stored chatId or generate a consistent one
    const currentChatId = chatId || sessionStorage.getItem(`chatId_${userId}`) || `chat_${userId}_${Date.now()}`;
    
    // If chatId is empty, set it
    if (chatId === '') {
      setChatId(currentChatId);
      sessionStorage.setItem(`chatId_${userId}`, currentChatId);
    }
    
    setIsSaving(true);
    try {
      const response = await fetch("/api/chat/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          oldChatId: currentChatId,
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
      
      // If the server returned a different chatId, update ours
      if (data.data.chatId && data.data.chatId !== currentChatId) {
        setChatId(data.data.chatId);
        sessionStorage.setItem(`chatId_${userId}`, data.data.chatId);
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error auto-saving chat:", error);
    } finally {
      setIsSaving(false);
    }
  }, [userId, chatId, currentSession, isSaving]);
  
  // Let's use manual save instead of debounce
  // This ensures we don't have race conditions with state updates
  useEffect(() => {
    let saveTimeout: NodeJS.Timeout | null = null;
    
    if (currentSession?.userMessages.length && currentSession.userMessages.length > 0) {
      // Only save if not already saving and enough time has passed since last save
      if (!isSaving && (lastSaved === null || 
          new Date().getTime() - lastSaved.getTime() > 10000)) {
        
        // Clear any existing timeout first
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }
        
        // Set a new timeout
        saveTimeout = setTimeout(() => {
          saveChat();
        }, 10000);
      }
    }
    
    // Cleanup function
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [currentSession?.userMessages, currentSession?.botMessages, saveChat, lastSaved, isSaving]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsTyping(true);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Format mood data for better readability by the AI based on the actual response format
      const formattedMoodData = moodData && moodData.length > 0 
        ? moodData.map(entry => {
            return {
              date: entry.date ? new Date(entry.date).toLocaleDateString() : 'Unknown date',
              overallScore: entry.score || 'Not recorded',
              sleepHours: entry.sleep || 'Not recorded',
              stressLevel: entry.stress || 'Not recorded',
              recommendations: entry.recommendations || []
            };
          })
        : 'No mood data available for the last 7 days';
      
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
      
      IMPORTANT ABOUT MOOD DATA:
      The user's 7-day mood history is available below. When the user asks about their mood history, ALWAYS analyze this data specifically:
      
      User's 7-day mood history: ${JSON.stringify(formattedMoodData, null, 2)}
      
      Important notes about this data:
      - Overall score ranges from 1-10 (where 10 is excellent mood)
      - Sleep is measured in hours
      - Stress levels are categorized as Low/Medium/High
      - Recommendations are personalized suggestions based on their mood data
      
      When user asks ANYTHING related to their mood history, patterns, or trends, you MUST reference this specific data in your response. 
      For example, if they ask "What could you say about my mood history for 7 days" - analyze the actual data provided above and mention:
      - Their overall mood score
      - Their sleep patterns
      - Their stress levels
      - Any recommendations that might be helpful
      
      DO NOT say you can't access the data - you have it available above.
      
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
    
    // Generate a new chatId for this session
    const newChatId = `chat_${userId}_${Date.now()}`;
    
    // Reset states
    setChatId(newChatId);
    // Update session storage with new chat ID
    sessionStorage.setItem(`chatId_${userId}`, newChatId);
    
    setMessages([
      { role: "bot", text: "Hello! I'm your mental health support assistant. I'm here to listen and help you navigate your emotions. How are you feeling today?" },
    ]);
    setCurrentSession({
      startDate: now,
      startTime,
      userMessages: [],
      botMessages: ["Hello! I'm your mental health support assistant. I'm here to listen and help you navigate your emotions. How are you feeling today?"]
    });
    
    // Reset last saved time to ensure it saves this new session
    setLastSaved(null);
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
  const titleVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        duration: 0.4
      }
    }
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
      text: chat.chatbotMessage[0] || "Hello! I'm your mental health support assistant. I'm here to listen and help you navigate your emotions. How are you feeling today?"
    });
    
    // Add user and bot messages alternately
    for (let i = 0; i < chat.userMessage.length; i++) {
      newMessages.push({ role: "user", text: chat.userMessage[i] });
      
      // Add bot response if available (using correct index)
      if (i + 1 < chat.chatbotMessage.length) { 
        newMessages.push({ role: "bot", text: chat.chatbotMessage[i + 1] });
      }
    }
    
    // Set messages and update current session
    setMessages(newMessages);
    
    // Set the chatId to continue the existing chat
    setChatId(chat.chatId);
    // Update session storage with loaded chat ID
    sessionStorage.setItem(`chatId_${userId}`, chat.chatId);
    
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
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`flex flex-col h-[80vh] sm:h-[81.9vh] ${cardBgClass} gap-y-4 sm:py-6 sm:px-8 py-2 px-4 rounded-lg overflow-hidden relative`}
    >
      {/* Gradient overlay */}
      <div className={gradientOverlay}></div>

      {/* Animated background blobs */}
      <div 
        className={`fixed rounded-full filter blur-[80px] opacity-40 ${
          isDarkMode 
            ? 'bg-blue-500/20 -bottom-10 -left-10 w-80 h-80' 
            : 'bg-pink-500/20 -bottom-10 -left-10 w-80 h-80'
        }`}
        style={{
          animation: "blob-move 7s infinite ease-in-out",
          animationDelay: "0ms"
        }}
      ></div>
      
      <div 
        className={`fixed rounded-full filter blur-[80px] opacity-40 ${
          isDarkMode 
            ? 'bg-purple-500/20 top-1/4 right-1/4 w-72 h-72' 
            : 'bg-indigo-500/20 top-1/4 right-1/4 w-72 h-72'
        }`}
        style={{
          animation: "blob-move 7s infinite ease-in-out",
          animationDelay: "2000ms"
        }}
      ></div>

      <div className="flex justify-between items-center z-10">
        <motion.h1 
                variants={titleVariants} 
                className='text-lg font-bold tracking-wide flex items-center gap-2 z-10'
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                  Mental Health Chatbot
                </span>
              </motion.h1>
        <div className="flex gap-2 items-center">
          {isSaving && (
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Saving...</span>
          )}
        
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchChatHistory}
            disabled={loading}
            className={`text-xs ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} py-2 sm:py-3 px-3 rounded-md transition-all duration-300`}
          >
            View History
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={startNewChat}
            disabled={loading || !currentSession?.userMessages.length}
            className={`text-xs ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            } text-white py-2 sm:py-3 px-3 rounded-md transition-all duration-300 shadow-md hover:shadow-lg`}
          >
            New Chat
          </motion.button>
        </div>
      </div>

      {showHistory ? (
        <div className={`flex-1 overflow-y-scroll p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} space-y-4 rounded-md z-10`}>
          <div className="flex justify-between mb-4">
            <h2 className={`font-medium ${isDarkMode ? 'text-purple-300' : 'text-indigo-700'}`}>Chat History</h2>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={closeHistory} 
              className={`text-xs ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              } text-white py-2 px-2 rounded-md transition-all duration-300 shadow-md hover:shadow-lg`}
            >
              Back to Chat
            </motion.button>
          </div>
          
          {chatHistory.length === 0 ? (
            <p className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>No chat history found</p>
          ) : (
            chatHistory.map((chat, idx) => (
              <motion.div 
                key={idx}
                variants={messageVariants}
                whileHover={{ scale: 1.01 }}
                className={`${
                  isDarkMode 
                    ? 'bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700' 
                    : 'bg-white hover:bg-gray-50 border border-gray-100'
                } p-3 rounded-md shadow-sm
                transition duration-300 ease-in-out
                hover:shadow-md cursor-pointer group`}
                onClick={() => loadChatHistory(chat)}
              >
                <div className="flex justify-between mb-2 text-xs text-gray-500">
                <div className="flex items-center gap-x-2">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{formatDate(chat.date)}</span>
                  <span
                    className={`${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-700 group-hover:bg-white group-hover:text-black' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:bg-gray-800 group-hover:text-white'
                    } text-white px-2 py-1 rounded-md transition duration-300 ease-in-out text-xs`}
                  >{chat.userMessage[0]}</span>
                  </div>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{chat.time}</span>
                </div>
                <div className={`space-y-2 max-h-24 overflow-y-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {chat.userMessage.map((msg: string, i: number) => (
                    <div key={`user-${i}`} className="flex flex-col">
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'}`}>You:</span>
                      <p className="text-sm ml-2">{msg}</p>
                      {chat.chatbotMessage[i] && (
                        <>
                          <span className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>Assistant:</span>
                          <p className="text-sm ml-2">{chat.chatbotMessage[i]}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div 
          id="chat-messages-container"
          className={`flex-1 overflow-y-auto p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50 border border-gray-200'} space-y-4 rounded-md scroll-smooth z-10`}
        >
          {messages.map((msg, index) => (
            <motion.div 
              key={index} 
              variants={messageVariants}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-center">
                {msg.role === "bot" && <Image src={BotIcon} alt="Bot Icon" width={35} height={35} className="mr-2" />}
                <div className={`p-3 text-sm rounded-lg max-w-xs shadow-md ${
                  msg.role === "user" 
                    ? isDarkMode 
                      ? "bg-gradient-to-r from-purple-600 to-indigo-700 text-white" 
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" 
                    : isDarkMode
                      ? "bg-gray-800 text-gray-100 border border-gray-700" 
                      : "bg-white text-gray-800 border border-gray-100"
                }`}>
                  {msg.text}
                </div>
                {msg.role === "user" && <Image src={userImg} alt="User Icon" width={35} height={35} className={`h-10 w-10 border-2 border-purple-300/50 shadow-md 
              '} 
                 ml-2 rounded-full`} />}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center">
                <Image src={BotIcon} alt="Bot Icon" width={35} height={35} className="mr-2" />
                <div className={`p-3 text-sm rounded-lg max-w-xs shadow-md ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-100 border border-gray-700" 
                    : "bg-white text-gray-800 border border-gray-100"
                }`}>
                  <TypingIndicator />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-0 w-full" />
        </div>
      )}

      <div className={`${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'} py-3 px-6 flex flex-nowrap justify-between gap-x-2 items-center z-10`}>
        <input
          type="text"
          className={`outline-none p-3 w-full rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600 focus:border-purple-400 text-white' 
              : 'bg-white/90 border-gray-300 focus:border-indigo-400 text-gray-900'
          } focus:outline-none focus:ring-2 transition-all duration-300 ${
            isDarkMode ? 'focus:ring-purple-500/50' : 'focus:ring-indigo-500/50'
          }`}
          placeholder="Type your message here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isTyping && sendMessage()}
          disabled={isTyping || showHistory}
        />
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={sendMessage} 
          className={`h-full px-4 py-3 w-fit ${
            isTyping || showHistory 
              ? 'bg-gray-400' 
              : isDarkMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
          } text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300`}
          disabled={isTyping || showHistory}
        >
          <Image src={Send} alt="Send Icon" width={20} height={20} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Chatbot;
