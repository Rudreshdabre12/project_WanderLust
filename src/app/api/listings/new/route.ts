import mongoose from "mongoose";
import listings from "@/models/listings";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Joi from "joi";

// Connect to the database
connect();

// Define the Joi schema for validation
const listingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.object({
        url: Joi.string().required(),
        filename: Joi.string().required(), // Added filename validation
    }).required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    country: Joi.string().required(),
});

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();

        // Validate the request body using Joi
        const { error } = listingSchema.validate(reqBody);
        if (error) {
            return NextResponse.json({
                message: "Validation error",
                success: false,
                error: error.details[0].message
            }, { status: 400 });
        }

        const { title, description, image, price, location, country } = reqBody;

        const newListing = new listings({
            title: title,
            description: description,
            image: {
                url: image.url,
                filename: image.filename // Ensure to include filename if needed
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
