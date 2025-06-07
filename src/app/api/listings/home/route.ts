import mongoose from "mongoose";
import Link from "next/link";
import listings from "@/models/listings"
import { NextRequest, NextResponse } from "next/server";
import {connect} from "@/dbConfig/dbConfig";
import { getRedisClient, CACHE_KEYS, CACHE_DURATION } from "@/lib/redis";

let isConnected = false;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        // Connect to MongoDB if not already connected
        if (!isConnected) {
            await connect();
            isConnected = true;
        }

        let shouldInvalidateCache = request.nextUrl.searchParams.get('invalidate') === 'true';
        const redis = getRedisClient();
        
        if (!shouldInvalidateCache) {
            try {
                // Try to get data from cache
                const cachedListings = await redis.get(CACHE_KEYS.ALL_LISTINGS);
                if (cachedListings) {
                    console.log('Cache hit: Serving listings from cache');
                    // Handle both string and object responses from Redis
                    const parsedListings = typeof cachedListings === 'string' 
                        ? JSON.parse(cachedListings)
                        : cachedListings;
                    const response = NextResponse.json(parsedListings);
                    response.headers.set('X-Cache', 'HIT');
                    return response;
                }
            } catch (redisError) {
                // Log Redis error but continue to fetch from database
                console.error('Redis error:', redisError);
            }
        }

        // Fetch from database if cache miss, invalidation requested, or Redis error
        console.log('Cache miss or invalidation: Fetching from database');
        const allListings = await listings.find({}).sort({ createdAt: -1 });

        // Try to set cache if not invalidating
        if (!shouldInvalidateCache) {
            try {
                // Convert Mongoose documents to plain objects before caching
                const listingsToCache = allListings.map(doc => doc.toObject());
                await redis.set(CACHE_KEYS.ALL_LISTINGS, JSON.stringify(listingsToCache));
                await redis.expire(CACHE_KEYS.ALL_LISTINGS, CACHE_DURATION.LISTINGS);
            } catch (redisError) {
                // Log Redis error but don't fail the request
                console.error('Redis cache set error:', redisError);
            }
        }

        const response = NextResponse.json(allListings);
        response.headers.set('X-Cache', shouldInvalidateCache ? 'INVALIDATED' : 'MISS');
        return response;

    } catch (error: any) {
        console.error('Server error:', error);
        
        // Return a proper error response
        return NextResponse.json(
            { 
                message: 'Error fetching listings',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}