const redis = require('redis');

// For local Redis (default port)
const redisClient = redis.createClient({
  url: 'redis://localhost:6379',
  legacyMode: true, // if using callbacks
});

redisClient.connect().catch(console.error);

redisClient.on('connect', () => {
  console.log('✅ Redis client connected');
});

redisClient.on('error', (err) => {
  console.log('❌ Redis Client Error', err);
});
