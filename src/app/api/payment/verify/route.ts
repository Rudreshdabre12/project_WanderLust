import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';
import { connect } from "@/dbConfig/dbConfig";
import Booking from "@/models/bookings";

connect();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { paymentId, orderId, signature, listingId, amount } = body;

        // Validate required fields
        if (!paymentId || !orderId || !signature || !listingId || !amount) {
            return NextResponse.json({ 
                success: false, 
                error: "Missing required fields" 
            }, { status: 400 });
        }

        console.log('Verifying payment:', { paymentId, orderId, listingId, amount });

        // Get user data from the token API
        const tokenResponse = await fetch('http://localhost:3000/api/users/getTokenData', {
            method: 'POST',
            headers: {
                'Cookie': request.headers.get('cookie') || ''
            }
        });
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.data?.id) {
            console.error('User authentication failed:', tokenData);
            return NextResponse.json({ 
                success: false, 
                error: "Unauthorized" 
            }, { status: 401 });
        }

        const userId = tokenData.data.id;

        if (!process.env.RAZORPAY_KEY_SECRET) {
            console.error('Razorpay secret key not configured');
            return NextResponse.json({
                success: false,
                error: "Payment verification configuration error"
            }, { status: 500 });
        }

        // Verify the payment signature
        const text = orderId + "|" + paymentId;
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest("hex");

        console.log('Signature verification:', {
            provided: signature,
            generated: generated_signature
        });

        if (generated_signature === signature) {
            try {
                // Save booking details
                const booking = await Booking.create({
                    listing: listingId,
                    user: userId,
                    paymentId,
                    orderId,
                    amount: amount / 100, // Convert from paise to rupees
                    status: 'confirmed'
                });

                console.log('Booking created:', booking);

                return NextResponse.json({
                    success: true,
                    message: "Payment verified and booking confirmed",
                    booking
                });
            } catch (dbError: any) {
                console.error('Database error while creating booking:', dbError);
                return NextResponse.json({
                    success: false,
                    error: "Failed to create booking record",
                    details: dbError.message
                }, { status: 500 });
            }
        } else {
            console.error('Signature verification failed');
            return NextResponse.json({
                success: false,
                message: "Payment verification failed: Invalid signature"
            }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Payment verification error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Error verifying payment"
        }, { status: 500 });
    }
} 