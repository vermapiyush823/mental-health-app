import Redis from 'ioredis';

/**
 * Redis Setup Instructions:
 * 
 * For local development:
 * 1. Install Redis locally: 
 *    - macOS: `brew install redis` then `brew services start redis`
 *    - Windows: Use Redis Windows port or Docker
 * 2. Set REDIS_URL in your .env file: 
 *    REDIS_URL=redis://localhost:6379
 * 
 * For production:
 * - Set REDIS_URL to your Railway or other Redis provider URL
 */

// Define Redis channels to prevent typos
export const REDIS_CHANNELS = {
  NEW_MESSAGE: 'community:newMessage',
  DELETE_MESSAGE: 'community:deleteMessage'
};

// Create Redis clients for pub/sub pattern
// We don't initialize them immediately to allow for conditional usage
let _publisher: Redis | null = null;
let _subscriber: Redis | null = null;

// Function to check if Redis is configured
export function isRedisConfigured(): boolean {
  return !!process.env.REDIS_URL;
}

// Create a Redis client with error handling
function createRedisClient(): Redis {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is not defined. See instructions in redis.ts');
  }

  // For local development, use a more forgiving connection setup
  const isLocalhost = process.env.REDIS_URL.includes('localhost') || 
                      process.env.REDIS_URL.includes('127.0.0.1');
                      
  const options = {
    enableReadyCheck: true,
    maxRetriesPerRequest: isLocalhost ? 2 : 3,
    retryStrategy(times: number) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  };

  const client = new Redis(process.env.REDIS_URL, options);
  
  client.on('error', (err) => {
    console.error('Redis connection error:', err);
  });
  
  client.on('connect', () => {
    console.log('Connected to Redis');
  });

  client.on('reconnecting', () => {
    console.log('Reconnecting to Redis...');
  });
  
  return client;
}

// Get the publisher instance (lazy initialization)
export function getPublisher(): Redis {
  if (!_publisher) {
    try {
      _publisher = createRedisClient();
    } catch (error) {
      console.error('Failed to create Redis publisher:', error);
      throw error;
    }
  }
  return _publisher;
}

// Get the subscriber instance (lazy initialization)
export function getSubscriber(): Redis {
  if (!_subscriber) {
    try {
      _subscriber = createRedisClient();
    } catch (error) {
      console.error('Failed to create Redis subscriber:', error);
      throw error;
    }
  }
  return _subscriber;
}

// Clean up Redis connections
export function cleanupRedisConnections(): void {
  if (_publisher) {
    _publisher.disconnect();
    _publisher = null;
  }
  
  if (_subscriber) {
    _subscriber.disconnect();
    _subscriber = null;
  }
}