'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Send from '../../../assets/icons/send.svg'
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid'

interface Message {
  _id: string;
  userId: string;
  username: string;
  message: string;
  createdAt: string;
}

interface CommunityChatProps {
  userId: string;
}

// Avatar component to display first letter of username
const UserAvatar = ({ username, userId, isDarkMode }: { username: string; userId: string; isDarkMode: boolean }) => {
  // Calculate a consistent avatar color based on username (fallback)
  const avatarColor = isDarkMode 
    ? ['bg-blue-700', 'bg-purple-700', 'bg-pink-700', 'bg-indigo-700', 'bg-teal-700'][Math.abs(username.charCodeAt(0)) % 5]
    : ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'][Math.abs(username.charCodeAt(0)) % 5];
  
  // State to store the image URL
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Fetch user image URL from our dedicated API only when userId changes
  useEffect(() => {
    const fetchUserImage = async () => {
      try {
        const response = await fetch('/api/get/user-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (error) {
        console.error('Error fetching user image:', error);
        // Continue with fallback avatar if image fetch fails
      }
    };
    
    if (userId) {
      fetchUserImage();
    }
  }, [userId]); // Only re-run when userId changes

  return (
    <div className={`flex items-center justify-center mx-2 w-8 h-8 xs:w-8 xs:h-8 sm:w-8 sm:h-8 rounded-full mr-1.5 xs:mr-2 ${!imageUrl ? avatarColor : ''} flex-shrink-0 shadow-md overflow-hidden`}>
      {imageUrl ? (
        <Image 
          src={imageUrl}
          alt={username}
          className="rounded-full object-cover w-full h-full"
          width={32}
          height={32}
        />
      ) : (
        <span className="text-xs xs:text-sm text-white font-medium">
          {username.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
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
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  
  // Add state for message deletion confirmation
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Add state for delete operation loading
  const [isDeleting, setIsDeleting] = useState(false);

  // Add mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile devices on mount
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile(mobile);
      return mobile;
    };
    
    checkMobile();
    
    // Also check on resize in case of orientation changes
    const handleResize = () => {
      checkMobile();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Throttle message animations on mobile devices
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: isMobile ? 50 : 100,
        // Disable animation for older messages on mobile to improve performance
        ...((message:any, i:any) => {
          if (isMobile && i < messages.length - 5) {
            return { duration: 0 };
          }
          return {};
        })
      }
    }
  };

  // Fetch initial messages from the API with improved error handling and retries
  const fetchMessages = async (retryCount = 0) => {
    setLoadingMessages(true);
    setError(null);
    
    try {
      // Use a smaller limit for the initial load to prevent timeouts
      const response = await fetch(`/api/community-chat?limit=15`);
      
      if (response.status === 408 || response.status === 504) {
        throw new Error('Request timed out. Server might be busy.');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data.data);
    } catch (err:any) {
      console.error('Error fetching messages:', err);
      
      // Implement retry logic for certain errors
      if (retryCount < 2 && 
          (err.message.includes('timeout') || 
           err.message.includes('network') ||
           err.message.includes('exceeded'))) {
        console.log(`Retrying fetch (${retryCount + 1}/2)...`);
        setTimeout(() => fetchMessages(retryCount + 1), 2000);
        return;
      }
      
      setError('Unable to load messages. Please try again later.');
    } finally {
      setLoadingMessages(false);
    }
  }

  // Set up Server-Sent Events connection
  useEffect(() => {
    // Keep track of connection attempts for backoff strategy
    let connectionAttempts = 0;
    const maxRetryDelay = 10000; // 10 seconds max delay between retries
    const reconnectInterval = 55000; // Reconnect every 55 seconds (before Vercel's 60s timeout)
    let reconnectTimer: NodeJS.Timeout | null = null;
    
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
          eventSourceRef.current = null;
          
          // Clear the reconnect timer if it exists
          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
          }
          
          // Implement exponential backoff for reconnection
          connectionAttempts++;
          const delay = Math.min(
            1000 * Math.pow(1.5, Math.min(connectionAttempts, 8)), 
            maxRetryDelay
          );
          
          console.log(`Reconnection attempt #${connectionAttempts} in ${delay}ms`);
          setTimeout(setupEventSource, delay);
        };

        // This is the standard message event handler for SSE
        eventSource.onmessage = (event) => {
          // Success! Reset connection attempts on successful messages
          connectionAttempts = 0;
          
          // If we get any message, we know we're connected
          setIsConnected(true);
          
          // Handle pings or actual data
          if (event.data.startsWith(':')) {
            // This is a ping, just log it
            console.log('SSE: Received ping');
            return;
          }
          
          console.log('SSE: Raw message received:', event.data);
          try {
            const data = JSON.parse(event.data);
            console.log('SSE: Parsed data:', data);
            
            switch (data.type) {
              case 'connection':
                console.log('SSE: Connected to stream', data);
                setIsConnected(true);
                break;
                
              case 'messages':
                // Handle batch of messages
                if (Array.isArray(data.data)) {
                  console.log(`SSE: Received batch of ${data.data.length} messages`);
                  setMessages(prevMessages => {
                    // Create a map of existing messages for deduplication
                    const existingIds = new Set(prevMessages.map(msg => msg._id));
                    
                    // Add only new messages
                    const newMessages = data.data.filter((msg: Message) => !existingIds.has(msg._id));
                    console.log(`SSE: Adding ${newMessages.length} new messages to state`);
                    
                    if (newMessages.length > 0) {
                      return [...prevMessages, ...newMessages];
                    }
                    return prevMessages;
                  });
                }
                break;

              case 'newMessages':
                // Handle a batch of new messages from DB polling
                if (Array.isArray(data.data)) {
                  console.log(`SSE: Received ${data.data.length} new messages from polling`);
                  setMessages(prevMessages => {
                    // Create a map of existing messages for deduplication
                    const existingIds = new Set(prevMessages.map(msg => msg._id));
                    
                    // Add only new messages
                    const newMessages = data.data.filter((msg: Message) => !existingIds.has(msg._id));
                    console.log(`SSE: Adding ${newMessages.length} new messages to state`);
                    
                    if (newMessages.length > 0) {
                      return [...prevMessages, ...newMessages];
                    }
                    return prevMessages;
                  });
                }
                break;
                
              case 'newMessage':
                // Handle single new message
                console.log('SSE: Received new message:', data.data);
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
                console.log('SSE: Received deletion event:', data);
                console.log('SSE: Data structure:', JSON.stringify(data));
                
                // More robust data validation with fallback extraction
                let messageIdToDelete;
                
                if (data && data.data) {
                  // Try to extract messageId from the standard location
                  messageIdToDelete = data.data.messageId;
                  
                  // If it's not there, try alternate paths that might be present
                  if (messageIdToDelete === undefined) {
                    messageIdToDelete = data.data._id || data.data.id;
                  }
                }
                
                // Final fallback directly to the data object if all else fails
                if (messageIdToDelete === undefined && data) {
                  messageIdToDelete = data.messageId || data._id || data.id;
                }
                
                if (!messageIdToDelete) {
                  console.error('SSE: Invalid deletion format, could not extract messageId:', data);
                  return;
                }
                
                console.log('SSE: Removing message with ID:', messageIdToDelete);
                
                setMessages(prevMessages => {
                  const beforeCount = prevMessages.length;
                  // Use the extracted messageId, string coercion for safety
                  const filteredMessages = prevMessages.filter(msg => msg._id !== messageIdToDelete.toString());
                  const afterCount = filteredMessages.length;
                  
                  console.log(`SSE: Messages before: ${beforeCount}, after: ${afterCount}, removed: ${beforeCount - afterCount}`);
                  
                  // Only update state if we actually removed something
                  if (beforeCount !== afterCount) {
                    return filteredMessages;
                  }
                  return prevMessages;
                });
                break;
                
              default:
                console.log('SSE: Unknown event type:', data.type);
            }
          } catch (error) {
            console.error('SSE: Error parsing data:', error, 'Raw data was:', event.data);
          }
        };
        
        // Set up proactive reconnection before Vercel times out
        reconnectTimer = setTimeout(() => {
          console.log('Proactively reconnecting before timeout...');
          setupEventSource();
        }, reconnectInterval);
        
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
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
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
    if (!messageId) {
      console.error('No message ID provided for deletion');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // 1. Immediately update the UI (optimistic update)
      setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
      
      // 2. Call the API to delete the message
      const response = await fetch('/api/community-chat/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          messageId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete message');
      }
      
      // 3. Production-specific fix: Force refresh messages from server
      // This ensures deleted messages are truly removed even if SSE fails
      const fetchResponse = await fetch(`/api/community-chat?limit=15&timestamp=${Date.now()}`);
      
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        // Carefully merge existing and fetched messages to avoid jumps
        setMessages(prevMessages => {
          // Create a set of all message IDs from the server response
          const serverMessageIds = new Set(data.data.map((msg: Message) => msg._id));
          
          // Filter out any messages from our current state that aren't in the server response
          // (including the deleted message and any others that might have been deleted elsewhere)
          const validExistingMessages = prevMessages.filter(msg => serverMessageIds.has(msg._id));
          
          // Combine with any new messages from the server that we don't already have
          const existingIds = new Set(validExistingMessages.map(msg => msg._id));
          const newMessages = data.data.filter((msg: Message) => !existingIds.has(msg._id));
          
          return [...validExistingMessages, ...newMessages];
        });
      }
      
      // 4. Production enhancement: Add a secondary check after a delay
      // This helps in cases where the SSE deletion event might be missed
      setTimeout(async () => {
        try {
          // Double-check that the message is truly gone from the server
          const verifyResponse = await fetch(`/api/community-chat?limit=15&timestamp=${Date.now() + 1000}`);
          
          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            // Check if the message still exists on the server
            const deletedMessageStillExists = verifyData.data.some((msg: Message) => msg._id === messageId);
            
            if (deletedMessageStillExists) {
              console.log('Message still exists after deletion, forcing another client-side removal');
              // Force remove it again from the client
              setMessages(prevMsgs => prevMsgs.filter(msg => msg._id !== messageId));
            }
          }
        } catch (err) {
          console.error('Error in verification check:', err);
        }
      }, 2000); // Wait 2 seconds before verification
      
      setError(null);
      
    } catch (err: any) {
      console.error('Error deleting message:', err);
      setError(`Failed to delete message: ${err.message}`);
      // If there's an error, restore the message by refreshing
      fetchMessages();
    } finally {
      setIsDeleting(false);
    }
  }

  // Auto-scroll to bottom when new messages come in
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
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
      className={`flex flex-col h-[calc(100vh-140px)] xs:h-[75vh] sm:h-[80vh] md:h-[81vh] ${cardBgClass} gap-y-2 xs:gap-y-4 sm:py-6 sm:px-8 py-2 px-3 xs:px-4 rounded-lg overflow-hidden relative`}
    >
      {/* Gradient overlay */}
      <div className={gradientOverlay}></div>

      {/* Header */}
      <div className="flex justify-between items-center z-10">
        <motion.h1 
          variants={messageVariants} 
          className='text-base xs:text-lg font-bold tracking-wide flex items-center gap-2 z-10'
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
            Community Chat
          </span>
          {isConnected && (
            <span className="flex items-center">
              <span className="relative flex h-2 w-2 xs:h-3 xs:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 xs:h-3 xs:w-3 bg-green-500"></span>
              </span>
              <span className="text-[10px] xs:text-xs text-gray-400 ml-1 xs:ml-2">live</span>
            </span>
          )}
        </motion.h1>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto p-2 xs:p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50/80 border border-gray-200'} space-y-3 xs:space-y-4 rounded-md scroll-smooth z-10`}
      >
        {loadingMessages ? (
          <div className="flex flex-col gap-2 xs:gap-3 animate-pulse">
            <div className={`h-12 xs:h-16 ${isDarkMode ? 'bg-gray-600/70' : 'bg-gray-200'} rounded-lg`}></div>
            <div className={`h-12 xs:h-16 ${isDarkMode ? 'bg-gray-600/70' : 'bg-gray-200'} rounded-lg`}></div>
            <div className={`h-12 xs:h-16 ${isDarkMode ? 'bg-gray-600/70' : 'bg-gray-200'} rounded-lg`}></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className={`text-sm xs:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
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
              <div className="flex items-start max-w-[90%] xs:max-w-[85%] group">
                {msg.userId !== userId && (
                  <UserAvatar username={msg.username} userId={msg.userId} isDarkMode={isDarkMode} />
                )}
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 xs:gap-2">
                    <span className={`text-[10px] xs:text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {msg.userId === userId ? 'You' : msg.username}
                    </span>
                    <span className={`text-[10px] xs:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                  
                  <div className={`p-2 xs:p-3 text-xs xs:text-sm rounded-lg shadow-md ${
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
                    onClick={() => {
                      setMessageToDelete(msg._id);
                      setShowDeleteConfirm(true);
                    }}
                    className={`ml-1 xs:ml-2 p-1 xs:p-1.5 rounded-full transition-opacity ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-red-900/70 text-gray-300 hover:text-red-300' 
                        : 'bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-600'
                    }`}
                  >
                    <TrashIcon className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
                  </button>
                )}
                
                {/* User avatar for user's own messages (right aligned) */}
                {msg.userId === userId && (
                  <UserAvatar username={msg.username} userId={msg.userId} isDarkMode={isDarkMode} />
                )}
              </div>
            </motion.div>
          ))
        )}
        
        {/* Error message if any */}
        {error && (
          <div className={`p-2 xs:p-3 text-xs xs:text-sm rounded-lg ${
            isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-600'
          }`}>
            {error}
          </div>
        )}
        
        {/* This element is for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
            onClick={(e) => {
              // Close when clicking outside the modal
              if (e.target === e.currentTarget) {
                setShowDeleteConfirm(false);
              }
            }}
            role="dialog"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
          >
            <div className={`p-4 xs:p-6 rounded-lg shadow-lg max-w-xs sm:max-w-sm w-full mx-4 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
              <div className="flex items-center gap-2 mb-4">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                <h2 id="delete-dialog-title" className="text-sm xs:text-base font-semibold">Confirm Deletion</h2>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="ml-auto hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <p id="delete-dialog-description" className="text-xs xs:text-sm mb-4">Are you sure you want to delete this message? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`px-3 py-1.5 text-xs xs:text-sm rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (messageToDelete) {
                      deleteUserMessage(messageToDelete);
                      setMessageToDelete(null);
                    }
                    setShowDeleteConfirm(false);
                  }}
                  className={`px-3 py-1.5 text-xs xs:text-sm rounded-lg ${isDeleting 
                    ? 'bg-red-400 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600'} text-white flex items-center gap-1`}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message input */}
      <div className={`${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'} py-2 xs:py-3 px-2 xs:px-4 flex gap-x-2 items-center z-10`}>
        <input
          type="text"
          className={`outline-none p-2 xs:p-3 w-full rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600 focus:border-purple-400 text-white' 
              : 'bg-white/90 border-gray-300 focus:border-indigo-400 text-gray-900'
          } focus:outline-none focus:ring-1 xs:focus:ring-2 text-sm xs:text-base transition-all duration-300 ${
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
          className={`h-full px-3 xs:px-4 py-2 xs:py-3 w-fit ${
            isLoading 
              ? 'bg-gray-400' 
              : isDarkMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
          } text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300`}
          disabled={isLoading || !input.trim()}
        >
          <Image src={Send} alt="Send Icon" width={isMobile ? 16 : 20} height={isMobile ? 16 : 20} />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default Community_Chat