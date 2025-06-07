import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import { giveTokenData } from "@/utills/getData"

let isConnected = false;

export async function POST(request: NextRequest) {
    try {
        // Connect to MongoDB if not already connected
        if (!isConnected) {
            await connect();
            isConnected = true;
        }

        const reqBody = await request.json();
        const { username, password } = reqBody;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        }

        // Verify password
        const validPassword = await bcryptjs.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json({ error: "Invalid password" }, { status: 400 });
        }

        // Create token data
        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        // Create token
        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: "1d" });

        // Create response
        const response = NextResponse.json({
            message: "Login successful",
            success: true
        });

        // Set cookie with secure options
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 // 1 day in seconds
        });

        return response;
    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Authentication failed" },
            { status: 500 }
        );
    }
}