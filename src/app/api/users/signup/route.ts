import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs"

let isConnected = false;

export async function POST(request: NextRequest) {
    try {
        // Connect to MongoDB if not already connected
        if (!isConnected) {
            await connect();
            isConnected = true;
        }

        const reqBody = await request.json();
        const { username, email, password } = reqBody;

        // Validate required fields
        if (!username || !email || !password) {
            return NextResponse.json(
                { error: "Username, email, and password are required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });

        if (existingUser) {
            if (existingUser.email === email.toLowerCase()) {
                return NextResponse.json(
                    { error: "Email already registered" },
                    { status: 400 }
                );
            }
            if (existingUser.username === username.toLowerCase()) {
                return NextResponse.json(
                    { error: "Username already taken" },
                    { status: 400 }
                );
            }
        }

        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Create new user
        const newUser = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        // Return success response without sensitive data
        return NextResponse.json({
            message: "User created successfully",
            success: true,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error("Signup error:", error);
        
        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json(
                { error: `${field} already exists` },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { 
                error: "Failed to create user",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}