import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import listings from "@/models/listings";
import { getRedisClient, CACHE_KEYS, CACHE_DURATION } from "@/lib/redis";

let isConnected = false;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Connect to MongoDB if not already connected
        if (!isConnected) {
            await connect();
            isConnected = true;
        }

        const listingId = params.id;
        const redis = getRedisClient();

        // Try to get data from cache first
        const cachedListing = await redis.get(CACHE_KEYS.LISTING(listingId));
        
        if (cachedListing) {
            console.log('Serving listing from cache');
            // Handle both string and object responses from Redis
            const parsedListing = typeof cachedListing === 'string'
                ? JSON.parse(cachedListing)
                : cachedListing;
            return NextResponse.json(parsedListing);
        }

        // If not in cache, get from database
        console.log('Fetching listing from database');
        const listing = await listings.findById(listingId);
        
        if (!listing) {
            return NextResponse.json({ message: "Listing not found" }, { status: 404 });
        }

        // Store in cache
        // Convert Mongoose document to plain object before caching
        const listingToCache = listing.toObject();
        await redis.set(CACHE_KEYS.LISTING(listingId), JSON.stringify(listingToCache));
        await redis.expire(CACHE_KEYS.LISTING(listingId), CACHE_DURATION.SINGLE_LISTING);

        return NextResponse.json(listing);
    } catch (error: any) {
        console.error("Error fetching listing:", error);
        return NextResponse.json({ 
            message: "Failed to fetch listing",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// Update route - invalidate cache when listing is updated
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Connect to MongoDB if not already connected
        if (!isConnected) {
            await connect();
            isConnected = true;
        }

        const listingId = params.id;
        const reqBody = await request.json();
        const updatedListing = await listings.findByIdAndUpdate(listingId, reqBody, { new: true });

        if (!updatedListing) {
            return NextResponse.json({ message: "Listing not found" }, { status: 404 });
        }

        // Invalidate both single listing and all listings cache
        const redis = getRedisClient();
        await Promise.all([
            redis.del(CACHE_KEYS.LISTING(listingId)),
            redis.del(CACHE_KEYS.ALL_LISTINGS)
        ]);

        return NextResponse.json(updatedListing);
    } catch (error: any) {
        console.error("Error updating listing:", error);
        return NextResponse.json({ 
            message: "Failed to update listing",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// Delete route - invalidate cache when listing is deleted
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Connect to MongoDB if not already connected
        if (!isConnected) {
            await connect();
            isConnected = true;
        }

        const listingId = params.id;
        const deletedListing = await listings.findByIdAndDelete(listingId);

        if (!deletedListing) {
            return NextResponse.json({ message: "Listing not found" }, { status: 404 });
        }

        // Invalidate both single listing and all listings cache
        const redis = getRedisClient();
        await Promise.all([
            redis.del(CACHE_KEYS.LISTING(listingId)),
            redis.del(CACHE_KEYS.ALL_LISTINGS)
        ]);

        return NextResponse.json({ message: "Listing deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting listing:", error);
        return NextResponse.json({ 
            message: "Failed to delete listing",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
} 