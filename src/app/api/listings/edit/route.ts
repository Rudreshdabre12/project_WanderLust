import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Listing from "@/models/listings";
connect();
export async function PUT(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const {id,title,description,imageUrl,price,location,country} = reqBody;
        if (!id || !title || !description || !imageUrl || !price || !location || !country) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }
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
        return NextResponse.json({ message: "Error updating listing: " + err.message }, { status: 500 });
    }
}
