import Redis from 'ioredis';

const getRedisUrl = () => {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }

    throw new Error('REDIS_URL is not defined in environment variables');
};

const getRedisConfig = () => {
    const url = getRedisUrl();
    
    return {
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        reconnectOnError(err: Error) {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
                return true;
            }
            return false;
        },
    };
};

let redis: Redis;

try {
    redis = new Redis(getRedisUrl(), getRedisConfig());

    redis.on('error', (error: Error) => {
        console.error('Redis connection error:', error);
    });

    redis.on('connect', () => {
        console.log('Successfully connected to Redis');
    });

    redis.on('reconnecting', () => {
        console.log('Reconnecting to Redis...');
    });

} catch (error) {
    console.error('Failed to initialize Redis:', error);
    // Initialize a mock Redis client for fallback
    redis = {
        get: async () => null,
        set: async () => null,
        setex: async () => null,
        del: async () => null,
        flushall: async () => null,
    } as any;
}

export { redis };

// Cache duration in seconds
export const CACHE_DURATION = {
    LISTINGS: process.env.NODE_ENV === 'production' ? 60 * 30 : 60 * 5, // 30 minutes in production, 5 minutes in development
    SINGLE_LISTING: process.env.NODE_ENV === 'production' ? 60 * 60 : 60 * 10, // 1 hour in production, 10 minutes in development
};

// Cache keys with environment prefix to avoid conflicts
const ENV_PREFIX = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

export const CACHE_KEYS = {
    ALL_LISTINGS: `${ENV_PREFIX}:all_listings`,
    LISTING: (id: string) => `${ENV_PREFIX}:listing:${id}`,
}; 