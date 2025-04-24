// Simple in-memory pub/sub system for community chat
// In production, you'd want to use Redis or similar for this

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
        this.recentMessages = this.recentMessages.filter(
          msg => msg._id !== messageId
        );
      } else {
        console.warn('Received deleteMessage event without a valid messageId structure:', message);
      }
    }
    
    // Notify all subscribers
    const subs = this.subscribers.get(channel);
    if (subs) {
      console.log(`Broadcasting to ${subs.size} subscribers`);
      
      // Convert to array to avoid issues with deleting during iteration
      const subscribersArray = Array.from(subs);
      
      subscribersArray.forEach(callback => {
        try {
          callback(message);
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
  eventBus.publish(type, data);
}