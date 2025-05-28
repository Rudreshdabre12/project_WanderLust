import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    // Check if token exists
    const tokenCookie = req.cookies.get("token");
    
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json(
        { error: "No token provided" }, 
        { status: 401 }
      );
    }

    // Check if TOKEN_SECRET exists
    if (!process.env.TOKEN_SECRET) {
      console.error("TOKEN_SECRET environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" }, 
        { status: 500 }
      );
    }

    // Verify and decode the token
    const decodedToken = jwt.verify(
      tokenCookie.value,
      process.env.TOKEN_SECRET
    );

    // Remove sensitive information if present
    const { iat, exp, ...tokenData } = decodedToken;
    
    console.log("Token decoded successfully:", tokenData);
    
    return NextResponse.json({
      success: true,
      data: tokenData,
      // Optionally include token metadata
      tokenInfo: {
        issuedAt: iat ? new Date(iat * 1000) : null,
        expiresAt: exp ? new Date(exp * 1000) : null
      }
    });

  } catch (err) {
    console.error("Token verification error:", err.message);
    
    // Handle specific JWT errors
    if (err.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: "Token expired" }, 
        { status: 401 }
      );
    }
    
    if (err.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: "Invalid token" }, 
        { status: 401 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: "Authentication failed" }, 
      { status: 500 }
    );
  }
}