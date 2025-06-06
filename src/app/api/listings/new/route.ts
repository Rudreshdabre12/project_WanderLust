// src/app/api/listings/new/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connect } from "@/dbConfig/dbConfig";
import Listing from "@/models/listings";
import Joi from "joi";

// Connect to the database
connect();
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      price,
      location,
      country,
      owner,
      image,
      user
    } = body;

    // Validate required fields
    if (!title || !description || !price || !location || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract user ID (adjust based on your auth structure)
    const userId = user?.data?.data?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Create new listing
    const newListing = new Listing({
      title,
      description,
      price: Number(price),
      location,
      country,
      owner: userId,
      image: {
        url: image?.url || "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        filename: image?.filename || "listingimage"
      }
    });

    const savedListing = await newListing.save();

    return NextResponse.json({
      success: true,
      listing: savedListing
    }, { status: 201 });

  } catch (error) {
    console.error('Listing creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}