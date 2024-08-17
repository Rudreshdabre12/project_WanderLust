import mongoose from "mongoose";
import listings from "@/models/listings";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { title, description, image, price, location, country } = reqBody;
        const newListing = new listings({
            title: title,
            description: description,
            image: {
                url: image.url 
            },
            price: price,
            location: location,
            country: country
        });

        const savedListing = await newListing.save();

        return NextResponse.json({
            message: "Listing created successfully",
            success: true,
            savedListing
        });
    } catch (err: any) {
        return NextResponse.json({
            message: "Error creating listing",
            success: false,
            error: err.message
        });
    }
}
