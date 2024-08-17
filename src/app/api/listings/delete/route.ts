import mongoose from "mongoose";
import Listing from "@/models/listings";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { id } = reqBody;
        console.log(id);    
        // const res = await Listing.findById(id);
        // console.log(res);
        
         await Listing.findByIdAndDelete(id);
        return NextResponse.json({ message: "Listing deleted successfully" }, { status: 200 });
    } catch (err: any) {
        console.log(err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
