import { Redis } from '@upstash/redis';

declare global {
    var redis: Redis | undefined;
}

const redis = global.redis || new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || 'https://enjoyed-katydid-21041.upstash.io',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || 'AVIxAAIjcDFmNzhhZDFkZGE3OGQ0YTdjODE3MjI0YWQwNWQ4ODc3YXAxMA',
});

if (process.env.NODE_ENV !== 'production') {
    global.redis = redis;
}

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

export { redis }; 