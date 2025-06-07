import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// Route to clear all cache
export async function DELETE(request: NextRequest) {
    try {
        await redis.flushall();
        return NextResponse.json({ message: "Cache cleared successfully" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// Route to clear specific cache key
export async function POST(request: NextRequest) {
    try {
        const { key } = await request.json();
        if (!key) {
            return NextResponse.json({ message: "Cache key is required" }, { status: 400 });
        }

        await redis.del(key);
        return NextResponse.json({ message: `Cache for key ${key} cleared successfully` });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
} 