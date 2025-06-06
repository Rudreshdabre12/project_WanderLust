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
    title: Joi.string().required(),
    description: Joi.string().required(),
    imageUrl: Joi.string().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    country: Joi.string().required()
}).unknown(true); // Allow unknown keys for FormData

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request: NextRequest) {
    try {
        const formData = await request.formData();
        
        // Convert FormData to object
        const data = {
            id: formData.get('id'),
            title: formData.get('title'),
            description: formData.get('description'),
            imageUrl: formData.get('imageUrl'),
            price: Number(formData.get('price')),
            location: formData.get('location'),
            country: formData.get('country')
        };

        // Validate the input data
        const { error } = listingUpdateSchema.validate(data);

        if (error) {
            console.error('Validation error:', error.details);
            return NextResponse.json({
                message: "Validation error",
                success: false,
                error: error.details[0].message
            }, { status: 400 });
        }

        // Check if listing exists
        const existingListing = await Listing.findById(data.id);
        if (!existingListing) {
            return NextResponse.json({ 
                message: "Listing not found",
                success: false
            }, { status: 404 });
        }

        let finalImageUrl = data.imageUrl;
        let imageFilename = existingListing.image.filename;

        // Handle new image upload if provided
        const imageFile = formData.get('imageFile') as File | null;
        if (imageFile && imageFile.size > 0) {
            try {
                // Convert File to buffer for Cloudinary upload
                const arrayBuffer = await imageFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Upload to Cloudinary
                const cloudinaryResponse = await new Promise<CloudinaryResponse>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'listings',
                            public_id: `listing_${data.id}_${Date.now()}`,
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
                console.error('Error uploading to Cloudinary:', error);
                return NextResponse.json({
                    message: "Error uploading image",
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }, { status: 500 });
            }
        }

        // Update the listing with new data
        const updatedListing = await Listing.findByIdAndUpdate(
            data.id,
            {
                title: data.title,
                description: data.description,
                image: {
                    url: finalImageUrl,
                    filename: imageFilename
                },
                price: data.price,
                location: data.location,
                country: data.country
            },
            { 
                new: true,
                runValidators: true
            }
        );

        if (!updatedListing) {
            return NextResponse.json({
                message: "Failed to update listing",
                success: false
            }, { status: 500 });
        }

        const response = NextResponse.json({
            message: "Listing updated successfully",
            success: true,
            listing: updatedListing
        }, { status: 200 });

        // Add cache control headers
        response.headers.set('Cache-Control', 'no-store');
        return response;

    } catch (error) {
        console.error("Error updating listing:", error);
        return NextResponse.json({
            message: "Error updating listing",
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
