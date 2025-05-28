import mongoose from "mongoose";
import Listing from "@/models/listings";
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
        filename: Joi.string().required(),
    }).required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    country: Joi.string().required(),
    user: Joi.object({
        data: Joi.object({
            data: Joi.object({
                id: Joi.string().required()
            }).required()
        }).required()
    }).required()
});

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();

        // Validate request body using Joi
        const { error } = listingSchema.validate(reqBody);
        if (error) {
            return NextResponse.json({
                message: "Validation error",
                success: false,
                error: error.details[0].message
            }, { status: 400 });
        }

        const { title, description, image, price, location, country, user } = reqBody;

const newListing = new Listing({
    title,
    description,
    image: {
        url: image.url,
        filename: image.filename,
    },
    price,
    location,
    country,
    owner: user.data.data.id // <-- correct extraction
});
        const savedListing = await newListing.save();
        console.log(savedListing);
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
