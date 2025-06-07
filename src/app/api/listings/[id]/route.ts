import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import listings from "@/models/listings";
import { redis, CACHE_KEYS, CACHE_DURATION } from "@/lib/redis";

connect();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const listingId = params.id;

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
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// Update route - invalidate cache when listing is updated
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const listingId = params.id;
        const reqBody = await request.json();
        const updatedListing = await listings.findByIdAndUpdate(listingId, reqBody, { new: true });

        // Invalidate both single listing and all listings cache
        await Promise.all([
            redis.del(CACHE_KEYS.LISTING(listingId)),
            redis.del(CACHE_KEYS.ALL_LISTINGS)
        ]);

        return NextResponse.json(updatedListing);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// Delete route - invalidate cache when listing is deleted
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const listingId = params.id;
        await listings.findByIdAndDelete(listingId);

        // Invalidate both single listing and all listings cache
        await Promise.all([
            redis.del(CACHE_KEYS.LISTING(listingId)),
            redis.del(CACHE_KEYS.ALL_LISTINGS)
        ]);

        return NextResponse.json({ message: "Listing deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
} 