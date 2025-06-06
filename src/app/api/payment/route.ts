import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Initialize Razorpay
const initRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay configuration missing');
    }

    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, currency = "INR" } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({
                success: false,
                error: "Invalid amount"
            }, { status: 400 });
        }

        console.log('Creating Razorpay order:', { amount, currency });

        const razorpay = initRazorpay();

        const options = {
            amount: amount * 100, // Razorpay expects amount in smallest currency unit (paise)
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        console.log('Razorpay order options:', options);

        const order = await razorpay.orders.create(options);
        console.log('Razorpay order created:', order);

        return NextResponse.json({
            success: true,
            order,
        }, { status: 200 });
    } catch (error: any) {
        console.error("Payment error:", error);
        
        // Handle specific Razorpay errors
        if (error.error?.description) {
            return NextResponse.json({
                success: false,
                error: error.error.description
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error.message || "Error creating payment order"
        }, { status: 500 });
    }
} 