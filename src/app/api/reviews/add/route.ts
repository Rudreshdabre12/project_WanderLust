import Review from "@/models/reviews"
import Listing from "@/models/listings";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
connect();
export async function POST(request:NextRequest){
    try{
        const reqBody=await request.json();
        console.log(reqBody);
        console.log(reqBody.id);
        const newReview=new Review({
            comment:reqBody.comment,
            rating:reqBody.rating,
            author:reqBody.author,
        });
         const currListing=await Listing.findById(reqBody.id);
         console.log(currListing);
        const savedReview=await newReview.save();
        await currListing.reviews.push(savedReview);
        await currListing.save();
            return NextResponse.json({
                message:"Review created successfully",
                success:true,
                savedReview,
            })
    }catch(err:any){
        return NextResponse.json({error:err.message},{status:500});
    }
}