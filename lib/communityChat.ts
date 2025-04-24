// Simple in-memory pub/sub system for community chat
// Hybrid approach that uses Redis in production when available

import { isRedisConfigured, getPublisher, REDIS_CHANNELS } from './redis';

type Subscriber = (message: any) => void;

class EventBus {
  private static instance: EventBus;
  private subscribers: Map<string, Set<Subscriber>> = new Map();
  
  // Latest messages kept in memory for new clients
  private recentMessages: any[] = [];
  private maxRecentMessages = 50;
  
  // Track connection status
  private initialized = false;
  
  // Track error counts by subscriber for automatic cleanup
  private errorCounts: WeakMap<Subscriber, number> = new WeakMap();
  private MAX_ERRORS = 3; // Maximum errors before auto-unsubscribe
  
  private constructor() {}
  
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  
  // Subscribe to a channel
  public subscribe(channel: string, callback: Subscriber): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    
    this.subscribers.get(channel)?.add(callback);
    console.log(`New subscriber added to ${channel}, total: ${this.subscribers.get(channel)?.size || 0}`);
    
    // Initialize error count
    this.errorCounts.set(callback, 0);
    
    // Return unsubscribe function
    return () => {
      this.unsubscribe(channel, callback);
    };
  }
  
  // Unsubscribe helper
  private unsubscribe(channel: string, callback: Subscriber): void {
    const subs = this.subscribers.get(channel);
    if (subs) {
      subs.delete(callback);
      console.log(`Subscriber removed from ${channel}, remaining: ${subs.size}`);
      if (subs.size === 0) {
        this.subscribers.delete(channel);
      }
    }
    
    // Clean up error tracking
    this.errorCounts.delete(callback);
  }
  
  // Publish to a channel
  public publish(channel: string, message: any): void {
    console.log(`Publishing to ${channel}:`, message);
    this.initialized = true;
    
    // Store new messages for future subscribers
    if (channel === 'newMessage' && message) {
      this.recentMessages.push(message);
      
      // Keep the list at a reasonable size
      if (this.recentMessages.length > this.maxRecentMessages) {
        this.recentMessages = this.recentMessages.slice(-this.maxRecentMessages);
      }
    }
    
    // Handle message deletions in the recent messages queue
    if (channel === 'deleteMessage') {
      // Extract messageId from any potential structure
      let messageId = null;
      
      // Handle different possible message structures
      if (typeof message === 'string') {
        messageId = message;
      } else if (message && typeof message === 'object') {
        // Try to extract messageId from different possible paths
        messageId = message.messageId || 
                   (message.data && message.data.messageId) || 
                   message._id ||
                   message.id;
      }
      
      if (messageId) {
        console.log(`Filtering out deleted message with ID: ${messageId}`);
        // Ensure string comparison for more reliable equality checks
        const messageIdStr = messageId.toString();
        this.recentMessages = this.recentMessages.filter(
          msg => msg._id !== messageIdStr && msg._id?.toString() !== messageIdStr
        );
      } else {
        console.warn('Received deleteMessage event without a valid messageId structure:', message);
      }
    }
    
    // Normalize the message data structure for consistency
    let normalizedMessage = message;
    if (channel === 'deleteMessage') {
      // Ensure we have a consistent structure for deleteMessage events
      if (typeof message === 'string') {
        normalizedMessage = { messageId: message };
      } else if (message && typeof message === 'object') {
        const messageId = message.messageId || 
                         (message.data && message.data.messageId) || 
                         message._id ||
                         message.id;
        
        if (messageId) {
          normalizedMessage = { messageId: messageId };
        }
      }
    }
    
    // Notify all subscribers with normalized message
    const subs = this.subscribers.get(channel);
    if (subs) {
      console.log(`Broadcasting to ${subs.size} subscribers`);
      
      // Convert to array to avoid issues with deleting during iteration
      const subscribersArray = Array.from(subs);
      
      subscribersArray.forEach(callback => {
        try {
          callback(normalizedMessage);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
          
          // Track errors for this subscriber
          const currentErrorCount = this.errorCounts.get(callback) || 0;
          const newErrorCount = currentErrorCount + 1;
          this.errorCounts.set(callback, newErrorCount);
          
          // Auto-unsubscribe after too many errors (likely a closed connection)
          if (newErrorCount >= this.MAX_ERRORS) {
            console.log(`Auto-unsubscribing client after ${newErrorCount} errors`);
            this.unsubscribe(channel, callback);
          }
        }
      });
    }
  }
  
  // Get recent messages for new connections
  public getRecentMessages(): any[] {
    return [...this.recentMessages];
  }
  
  // Check if event bus has been initialized with any messages
  public isInitialized(): boolean {
    return this.initialized;
  }
}

// Export a singleton instance
export const eventBus = EventBus.getInstance();

// Export a function to broadcast messages through the event bus
export function broadcastMessage(type: string, data: any) {
  console.log(`Broadcasting message to ${type}:`, data);
  
  // Normalize message format for consistency
  let normalizedData = data;
  let messageId: string | undefined;
  
  if (type === 'deleteMessage') {
    // Normalize deletion message format for consistency
    if (typeof data === 'string') {
      messageId = data;
      normalizedData = { messageId: data };
    } else if (data && typeof data === 'object') {
      messageId = data.messageId || data._id || data.id;
      
      if (messageId) {
        // Ensure we have a consistent format
        normalizedData = { messageId: messageId.toString() };
      }
    }
  }
  
  // Always publish via in-memory EventBus for local development
  eventBus.publish(type, normalizedData);
  
  // If Redis is configured, also publish via Redis
  if (isRedisConfigured()) {
    try {
      const redisChannel = type === 'newMessage' 
        ? REDIS_CHANNELS.NEW_MESSAGE 
        : REDIS_CHANNELS.DELETE_MESSAGE;
      
      const message = JSON.stringify({
        type,
        data: normalizedData,
        timestamp: Date.now()
      });
      
      console.log(`Publishing to Redis channel ${redisChannel}:`, message);
      
      // Get Redis publisher and send message
      const publisher = getPublisher();
      publisher.publish(redisChannel, message);
      
      // For deletion events, send redundant messages with delay for reliability
      if (type === 'deleteMessage') {
        setTimeout(() => {
          try {
            console.log(`Redis: Sending delayed deletion message for:`, messageId);
            const redundantMessage = JSON.stringify({
              type,
              data: normalizedData,
              timestamp: Date.now(),
              redundant: true
            });
            publisher.publish(redisChannel, redundantMessage);
          } catch (err) {
            console.error("Error in redundant Redis deletion broadcast:", err);
          }
        }, 800);
      }
    } catch (redisError) {
      console.error('Error publishing to Redis:', redisError);
      
      // If Redis fails, we already published to in-memory EventBus as fallback
    }
  } else {
    // If Redis is not configured, use the fallback in-memory approach with redundancy
    if (type === 'deleteMessage') {
      // Add redundant publishes with delays to improve reliability
      setTimeout(() => {
        try {
          console.log(`Broadcasting delayed deletion reminder for message:`, messageId);
          eventBus.publish(type, { 
            ...normalizedData, 
            redundant: true, 
            timestamp: Date.now() 
          });
        } catch (err) {
          console.error("Error in redundant deletion broadcast:", err);
        }
      }, 800);
    }
  }
}