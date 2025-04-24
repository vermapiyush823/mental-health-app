// Simple test script to verify Redis connectivity
const Redis = require('ioredis');
require('dotenv').config();

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  console.error('❌ REDIS_URL is not defined in environment variables');
  console.error('Please set REDIS_URL in your .env file');
  process.exit(1);
}

console.log(`🔄 Connecting to Redis at ${REDIS_URL.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`);

const redis = new Redis(REDIS_URL);

redis.on('connect', () => {
  console.log('✅ Successfully connected to Redis!');
  testRedis();
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
  process.exit(1);
});

async function testRedis() {
  try {
    // Test basic set/get
    await redis.set('test-key', 'Hello from Mental Health App');
    const value = await redis.get('test-key');
    console.log('📝 Test value retrieved:', value);

    // Test pub/sub
    const subscriber = redis.duplicate();
    
    await subscriber.subscribe('test-channel');
    console.log('🔈 Subscribed to test-channel');
    
    subscriber.on('message', (channel, message) => {
      console.log(`📨 Received message on ${channel}: ${message}`);
      
      // Clean up and exit after successful test
      setTimeout(async () => {
        await subscriber.unsubscribe('test-channel');
        await redis.del('test-key');
        redis.disconnect();
        subscriber.disconnect();
        console.log('✅ Redis test completed successfully!');
        process.exit(0);
      }, 100);
    });

    // Wait for subscription to be ready
    setTimeout(() => {
      console.log('📤 Publishing test message...');
      redis.publish('test-channel', 'This is a test message');
    }, 500);

  } catch (error) {
    console.error('❌ Error during Redis test:', error);
    redis.disconnect();
    process.exit(1);
  }
}