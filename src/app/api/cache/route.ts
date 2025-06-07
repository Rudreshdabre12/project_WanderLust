import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

// Route to clear all cache
export async function DELETE(request: NextRequest) {
    try {
        const redis = getRedisClient();
        await redis.flushall();
        return NextResponse.json({ message: "Cache cleared successfully" });
    } catch (error: any) {
        console.error("Error clearing cache:", error);
        return NextResponse.json({ 
            message: "Failed to clear cache",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// Route to clear specific cache key
export async function POST(request: NextRequest) {
    try {
        const { key } = await request.json();
        if (!key) {
            return NextResponse.json({ message: "Cache key is required" }, { status: 400 });
        }

        const redis = getRedisClient();
        await redis.del(key);
        return NextResponse.json({ message: `Cache for key ${key} cleared successfully` });
    } catch (error: any) {
        console.error("Error clearing cache key:", error);
        return NextResponse.json({ 
            message: "Failed to clear cache key",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
} 