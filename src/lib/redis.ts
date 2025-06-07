import { Redis } from '@upstash/redis';

declare global {
    var redis: Redis | undefined;
}

// Initialize Redis only if URL and token are available
const getRedisClient = () => {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        throw new Error('Redis credentials not configured');
    }

    if (!global.redis) {
        global.redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }

    return global.redis;
};

// Cache duration in seconds
export const CACHE_DURATION = {
    LISTINGS: process.env.NODE_ENV === 'production' ? 60 * 30 : 60 * 5, // 30 minutes in production, 5 minutes in development
    SINGLE_LISTING: process.env.NODE_ENV === 'production' ? 60 * 60 : 60 * 10, // 1 hour in production, 10 minutes in development
} as const;

// Cache keys with environment prefix to avoid conflicts
const ENV_PREFIX = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

export const CACHE_KEYS = {
    ALL_LISTINGS: `${ENV_PREFIX}:all_listings`,
    LISTING: (id: string) => `${ENV_PREFIX}:listing:${id}`,
} as const;

export { getRedisClient }; 