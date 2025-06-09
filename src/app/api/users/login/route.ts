import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"

let isConnected = false;

export async function POST(request: NextRequest) {
    try {
        // Connect to MongoDB if not already connected
        if (!isConnected) {
            await connect();
            isConnected = true;
        }
        // Verify TOKEN_SECRET exists
        if (!process.env.TOKEN_SECRET) {
            throw new Error("TOKEN_SECRET is not defined");
        }
        const reqBody = await request.json();
        const { username, password } = reqBody;
        // Validate required fields
        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }
        // Find user (case insensitive)
        const user = await User.findOne({ 
            username: username.toLowerCase()
        }).select('+password');  // Explicitly select password field

        if (!user) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 400 }
            );
        }

        // Verify password
        const validPassword = await bcryptjs.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 400 }
            );
        }

        // Create token data
        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        // Create token
        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: "1d" });

        // Create response
        const response = NextResponse.json({
            message: "Login successful",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

        // Set cookie with secure options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 // 1 day in seconds
        };

        response.cookies.set("token", token, cookieOptions as any);

        return response;
    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json(
            { 
                error: "Authentication failed",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}