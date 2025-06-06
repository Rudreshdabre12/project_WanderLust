import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Booking from "@/models/bookings";
import Listing from "@/models/listings";
import User from "@/models/user";

connect();

export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const url = new URL(request.url);
        const listingId = url.searchParams.get('listingId');
        const userId = url.searchParams.get('userId');

        // Build the query
        let query: any = {};
        
        // If both listingId and userId are provided, show only that user's bookings for that listing
        if (listingId && userId) {
            query = {
                listing: listingId,
                user: userId
            };
        }
        // If only listingId is provided, show all confirmed bookings for that listing
        else if (listingId) {
            query = {
                listing: listingId,
                status: 'confirmed'
            };
        }
        // If only userId is provided, show all that user's bookings
        else if (userId) {
            query = {
                user: userId
            };
        }

        // Verify user authentication for user-specific queries
        if (userId) {
            try {
                const tokenResponse = await fetch('http://localhost:3000/api/users/getTokenData', {
                    method: 'POST',
                    headers: {
                        'Cookie': request.headers.get('cookie') || ''
                    }
                });
                const tokenData = await tokenResponse.json();
                
                // Only allow users to see their own bookings
                if (tokenData.data?.id !== userId) {
                    return NextResponse.json(
                        { error: "Unauthorized: You can only view your own bookings" },
                        { status: 403 }
                    );
                }
            } catch (error) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );
            }
        }

        // Fetch and populate bookings
        const bookings = await Booking.find(query)
            .populate({
                path: 'listing',
                model: Listing,
                select: 'title image price location country'
            })
            .populate({
                path: 'user',
                model: User,
                select: 'username email'
            })
            .sort({ bookingDate: -1 });

        if (!bookings) {
            return NextResponse.json([]);
        }

        // Transform and validate the data
        const transformedBookings = bookings.map(booking => {
            const bookingObj = booking.toObject();
            return {
                _id: bookingObj._id,
                user: {
                    username: bookingObj.user?.username || 'Anonymous',
                    email: bookingObj.user?.email
                },
                listing: {
                    _id: bookingObj.listing?._id || '',
                    title: bookingObj.listing?.title || 'Untitled Listing',
                    image: {
                        url: bookingObj.listing?.image?.url || 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b'
                    },
                    price: bookingObj.listing?.price || 0,
                    location: bookingObj.listing?.location || 'Location not available',
                    country: bookingObj.listing?.country || 'Country not available'
                },
                amount: bookingObj.amount || 0,
                status: bookingObj.status || 'unknown',
                bookingDate: bookingObj.bookingDate || new Date(),
                paymentId: bookingObj.paymentId,
                orderId: bookingObj.orderId
            };
        });

        return NextResponse.json(transformedBookings);
    } catch (error: any) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json(
            { error: "Error fetching bookings: " + error.message },
            { status: 500 }
        );
    }
} 