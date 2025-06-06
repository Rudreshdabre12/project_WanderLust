import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Listing from "@/models/listings";
import Joi from "joi";
import { v2 as cloudinary } from 'cloudinary';

// Connect to the database
connect();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Define Cloudinary response type
type CloudinaryResponse = {
    secure_url: string;
    public_id: string;
};

// Define the Joi schema for validation
const listingUpdateSchema = Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10),
    imageUrl: Joi.string().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required().min(2),
    country: Joi.string().required().min(2),
    imageFile: Joi.any(), // For handling file uploads
});

export async function PUT(request: NextRequest) {
    try {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const imageUrl = formData.get('imageUrl') as string;
        const price = Number(formData.get('price'));
        const location = formData.get('location') as string;
        const country = formData.get('country') as string;
        const imageFile = formData.get('imageFile') as File | null;

        // Validate the input data
        const { error } = listingUpdateSchema.validate({
            id, title, description, imageUrl, price, location, country
        });

        if (error) {
            return NextResponse.json({
                message: "Validation error",
                success: false,
                error: error.details[0].message
            }, { status: 400 });
        }

        // Check if listing exists
        const existingListing = await Listing.findById(id);
        if (!existingListing) {
            return NextResponse.json({ 
                message: "Listing not found",
                success: false
            }, { status: 404 });
        }

        let finalImageUrl = imageUrl;
        let imageFilename = existingListing.image.filename;

        // Handle new image upload if provided
        if (imageFile) {
            try {
                // Convert File to buffer for Cloudinary upload
                const arrayBuffer = await imageFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Upload to Cloudinary
                const cloudinaryResponse = await new Promise<CloudinaryResponse>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'listings',
                            public_id: `listing_${id}_${Date.now()}`,
                            resource_type: 'auto'
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result as CloudinaryResponse);
                        }
                    );

                    // Write buffer to stream
                    const bufferStream = require('stream').Readable.from(buffer);
                    bufferStream.pipe(uploadStream);
                });

                // Update image URL and filename with Cloudinary response
                finalImageUrl = cloudinaryResponse.secure_url;
                imageFilename = cloudinaryResponse.public_id;

                // Delete old image from Cloudinary if it exists
                if (existingListing.image.filename && 
                    existingListing.image.filename.startsWith('listing_')) {
                    try {
                        await cloudinary.uploader.destroy(existingListing.image.filename);
                    } catch (deleteErr) {
                        console.error('Error deleting old image:', deleteErr);
                    }
                }
            } catch (error) {
                const uploadErr = error as Error;
                console.error('Error uploading to Cloudinary:', uploadErr);
                return NextResponse.json({
                    message: "Error uploading image",
                    success: false,
                    error: uploadErr.message
                }, { status: 500 });
            }
        }

        // Update the listing with new data
        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            {
                title,
                description,
                image: {
                    url: finalImageUrl,
                    filename: imageFilename
                },
                price,
                location,
                country
            },
            { 
                new: true,
                runValidators: true
            }
        );

        return NextResponse.json({
            message: "Listing updated successfully",
            success: true,
            listing: updatedListing
        }, { status: 200 });

    } catch (error) {
        const err = error as Error;
        console.error("Error updating listing:", err.message);
        return NextResponse.json({
            message: "Error updating listing",
            success: false,
            error: err.message
        }, { status: 500 });
    }
}
