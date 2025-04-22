'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Send from '../../../assets/icons/send.svg'
import { TrashIcon } from '@heroicons/react/24/outline'

interface Message {
  _id: string;
  userId: string;
  username: string;
  userImage: string;
  message: string;
  createdAt: string;
}

interface CommunityChatProps {
  userId: string;
}

const Community_Chat = ({ userId }: CommunityChatProps) => {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Make sure component is mounted before using theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDarkMode = mounted && resolvedTheme === 'dark'

  // Define theme-dependent styles
  const cardBgClass = isDarkMode 
    ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 text-gray-100 shadow-lg" 
    : "bg-white/90 backdrop-blur-sm border border-gray-100 text-gray-900 shadow-xl"

  // Gradient overlay for visual effect
  const gradientOverlay = `absolute inset-0 bg-gradient-to-br ${
    isDarkMode 
      ? 'from-purple-500/5 to-indigo-500/5' 
      : 'from-indigo-500/5 to-purple-500/5'
  } pointer-events-none rounded-lg`

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
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  }

  // Fetch initial messages from the API
  const fetchMessages = async () => {
    setLoadingMessages(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/community-chat?limit=50`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      
      const data = await response.json()
      setMessages(data.data)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Failed to load messages. Please try again.')
    } finally {
      setLoadingMessages(false)
    }
  }

  // Set up Server-Sent Events connection
  useEffect(() => {
    // Keep track of connection attempts for backoff strategy
    let connectionAttempts = 0;
    const maxRetryDelay = 30000; // 30 seconds max delay
    
    // Function to set up the event source
    const setupEventSource = () => {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      try {
        console.log('Setting up SSE connection...');
        // Create a new EventSource connection
        const eventSource = new EventSource('/api/community-chat/sse');
        eventSourceRef.current = eventSource;

        // Handle connection error
        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error);
          setIsConnected(false);
          
          // Clean up the errored connection
          eventSource.close();
          
          // Implement exponential backoff for reconnection
          connectionAttempts++;
          const delay = Math.min(
            1000 * Math.pow(1.5, connectionAttempts), 
            maxRetryDelay
          );
          
          console.log(`Reconnection attempt #${connectionAttempts} in ${delay}ms`);
          setTimeout(setupEventSource, delay);
        };

        // This is the standard message event handler for SSE
        eventSource.onmessage = (event) => {
          // Success! Reset connection attempts
          connectionAttempts = 0;
          
          // If we get any message, we know we're connected
          setIsConnected(true);
          
          console.log('SSE message received:', event.data);
          try {
            const data = JSON.parse(event.data);
            console.log('Parsed SSE data:', data);
            
            switch (data.type) {
              case 'connection':
                console.log('Connected to SSE stream', data);
                setIsConnected(true);
                break;
                
              case 'messages':
                // Handle batch of messages
                if (Array.isArray(data.data)) {
                  console.log(`Received batch of ${data.data.length} messages`);
                  setMessages(prevMessages => {
                    // Create a map of existing messages for deduplication
                    const existingIds = new Set(prevMessages.map(msg => msg._id));
                    
                    // Add only new messages
                    const newMessages = data.data.filter((msg: Message) => !existingIds.has(msg._id));
                    console.log(`Adding ${newMessages.length} new messages to state`);
                    
                    if (newMessages.length > 0) {
                      return [...prevMessages, ...newMessages];
                    }
                    return prevMessages;
                  });
                }
                break;
                
              case 'newMessage':
                // Handle single new message
                console.log('Received new message:', data.data);
                setMessages(prevMessages => {
                  // Check if message already exists (prevent duplicates)
                  const exists = prevMessages.some(msg => msg._id === data.data._id);
                  if (!exists) {
                    return [...prevMessages, data.data];
                  }
                  return prevMessages;
                });
                break;
                
              case 'deleteMessage':
                // Handle message deletion
                console.log('Received message deletion:', data.data);
                setMessages(prevMessages => 
                  prevMessages.filter(msg => msg._id !== data.data.messageId)
                );
                break;
                
              default:
                console.log('Unknown SSE event type:', data.type);
            }
          } catch (error) {
            console.error('Error parsing SSE data:', error);
          }
        };
      } catch (error) {
        console.error('Error initializing EventSource:', error);
        setTimeout(setupEventSource, 3000);
      }
    };

    // Initial setup - fetch messages first, then set up SSE
    fetchMessages().then(() => {
      setupEventSource();
    }).catch(error => {
      console.error('Error fetching initial messages:', error);
      // Still try to set up SSE even if initial fetch fails
      setupEventSource();
    });

    // Cleanup on component unmount
    return () => {
      console.log('Cleaning up SSE connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [])

  // Send a new message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    
    setIsLoading(true)
    setError(null)
    
    // Store the message that's being sent
    const messageText = input.trim()
    
    // Clear input immediately for better UX
    setInput('')
    
    try {
      const response = await fetch('/api/community-chat/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          message: messageText
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }
      
      // Always add the message locally regardless of SSE connection
      // This ensures the user sees their own messages immediately
      if (data.success && data.data) {
        setMessages(prevMessages => {
          // Check if the message already exists to prevent duplicates
          const exists = prevMessages.some(msg => msg._id === data.data._id)
          if (!exists) {
            return [...prevMessages, data.data]
          }
          return prevMessages
        })
      }
      
      // No need to show any success message - the message appearing is enough feedback
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message. Please try again.')
      
      // Restore the input text if there's an error
      setInput(messageText)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a message (only if it belongs to current user)
  const deleteUserMessage = async (messageId: string) => {
    try {
      const response = await fetch('/api/community-chat/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          messageId
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete message')
      }
      
      // Deletion will be reflected via SSE
    } catch (err) {
      console.error('Error deleting message:', err)
      setError('Failed to delete message. Please try again.')
    }
  }

  // Auto-scroll to bottom when new messages come in
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Format timestamp for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`flex flex-col h-[80vh] sm:h-[81.9vh] ${cardBgClass} gap-y-4 sm:py-6 sm:px-8 py-2 px-4 rounded-lg overflow-hidden relative`}
    >
      {/* Gradient overlay */}
      <div className={gradientOverlay}></div>

      {/* Header */}
      <div className="flex justify-between items-center z-10">
        <motion.h1 
          variants={messageVariants} 
          className='text-lg font-bold tracking-wide flex items-center gap-2 z-10'
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
            Community Chat
          </span>
          {isConnected && (
            <span className="flex items-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs text-gray-400 ml-2">live</span>
            </span>
          )}
        </motion.h1>
      </div>

      {/* Messages Container */}
      <div 
        className={`flex-1 overflow-y-auto p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50/80 border border-gray-200'} space-y-4 rounded-md scroll-smooth z-10`}
      >
        {loadingMessages ? (
          <div className="flex flex-col gap-3 animate-pulse">
            <div className={`h-16 ${isDarkMode ? 'bg-gray-600/70' : 'bg-gray-200'} rounded-lg`}></div>
            <div className={`h-16 ${isDarkMode ? 'bg-gray-600/70' : 'bg-gray-200'} rounded-lg`}></div>
            <div className={`h-16 ${isDarkMode ? 'bg-gray-600/70' : 'bg-gray-200'} rounded-lg`}></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>
              No messages yet. Be the first to say hello!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div 
              key={msg._id} 
              variants={messageVariants}
              className={`flex ${msg.userId === userId ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-start max-w-[85%] group">
                {msg.userId !== userId && (
                  <Image 
                    src={msg.userImage} 
                    alt={`${msg.username}'s avatar`} 
                    width={35} 
                    height={35} 
                    className="h-8 w-8 rounded-full mr-2 mt-1" 
                  />
                )}
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {msg.userId === userId ? 'You' : msg.username}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                  
                  <div className={`p-3 text-sm rounded-lg shadow-md ${
                    msg.userId === userId 
                      ? isDarkMode 
                        ? "bg-gradient-to-r from-purple-600 to-indigo-700 text-white" 
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" 
                      : isDarkMode
                        ? "bg-gray-800 text-gray-100 border border-gray-700" 
                        : "bg-white text-gray-800 border border-gray-100"
                  }`}>
                    {msg.message}
                  </div>
                </div>
                
                {/* Delete button only for user's own messages */}
                {msg.userId === userId && (
                  <button 
                    onClick={() => deleteUserMessage(msg._id)}
                    className={`ml-2 p-1.5 rounded-full invisible group-hover:visible transition-opacity ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-red-900/70 text-gray-300 hover:text-red-300' 
                        : 'bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-600'
                    }`}
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                )}
                
                {/* User avatar for user's own messages (right aligned) */}
                {msg.userId === userId && (
                  <Image 
                    src={msg.userImage} 
                    alt="Your avatar" 
                    width={35} 
                    height={35} 
                    className="h-8 w-8 rounded-full ml-2 mt-1" 
                  />
                )}
              </div>
            </motion.div>
          ))
        )}
        
        {/* Error message if any */}
        {error && (
          <div className={`p-3 text-sm rounded-lg ${
            isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-600'
          }`}>
            {error}
          </div>
        )}
        
        {/* This element is for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className={`${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'} py-3 px-4 flex gap-x-2 items-center z-10`}>
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
          onKeyDown={(e) => e.key === "Enter" && !isLoading && sendMessage()}
          disabled={isLoading}
        />
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={sendMessage} 
          className={`h-full px-4 py-3 w-fit ${
            isLoading 
              ? 'bg-gray-400' 
              : isDarkMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
          } text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300`}
          disabled={isLoading || !input.trim()}
        >
          <Image src={Send} alt="Send Icon" width={20} height={20} />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default Community_Chat