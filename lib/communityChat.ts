// Simple in-memory pub/sub system for community chat
// In production, you'd want to use Redis or similar for this

type Subscriber = (message: any) => void;

class EventBus {
  private static instance: EventBus;
  private subscribers: Map<string, Set<Subscriber>> = new Map();
  
  // Latest messages kept in memory for new clients
  private recentMessages: any[] = [];
  private maxRecentMessages = 50;
  
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
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(channel);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(channel);
        }
      }
    };
  }
  
  // Publish to a channel
  public publish(channel: string, message: any): void {
    console.log(`Publishing to ${channel}:`, message);
    
    // Store new messages for future subscribers
    if (channel === 'newMessage' && message) {
      this.recentMessages.push(message);
      
      // Keep the list at a reasonable size
      if (this.recentMessages.length > this.maxRecentMessages) {
        this.recentMessages = this.recentMessages.slice(-this.maxRecentMessages);
      }
    }
    
    // Handle message deletions in the recent messages queue
    if (channel === 'deleteMessage' && message && message.messageId) {
      this.recentMessages = this.recentMessages.filter(
        msg => msg._id !== message.messageId
      );
    }
    
    // Notify all subscribers
    const subs = this.subscribers.get(channel);
    if (subs) {
      console.log(`Broadcasting to ${subs.size} subscribers`);
      subs.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }
  
  // Get recent messages for new connections
  public getRecentMessages(): any[] {
    return [...this.recentMessages];
  }
}

// Export a singleton instance
export const eventBus = EventBus.getInstance();