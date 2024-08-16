import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Listing from "@/models/listings";
import Joi from "joi";

// Connect to the database
connect();

// Define the Joi schema for validation
const listingUpdateSchema = Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    imageUrl: Joi.string().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    country: Joi.string().required(),
});

export async function PUT(request: NextRequest) {
    try {
        const reqBody = await request.json();

        // Validate the request body using Joi
        const { error } = listingUpdateSchema.validate(reqBody);
        if (error) {
            return NextResponse.json({
                message: "Validation error",
                success: false,
                error: error.details[0].message
            }, { status: 400 });
        }

        const { id, title, description, imageUrl, price, location, country } = reqBody;

        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            { title, description, image: { url: imageUrl }, price, location, country },
            { new: true }
        );

        if (!updatedListing) {
            return NextResponse.json({ message: "Listing not found" }, { status: 404 });
        }

        return NextResponse.json(updatedListing, { status: 200 });
    } catch (err: any) {
        console.log("Error updating listing:", err.message);
        return NextResponse.json({
            message: "Error updating listing: " + err.message
        }, { status: 500 });
    }
}
