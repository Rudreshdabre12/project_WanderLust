import mongoose from "mongoose";
import Link from "next/link";
import { NextRequest, NextResponse } from "next/server";
import {connect} from "@/dbConfig/dbConfig";
import Listing from "@/models/listings";
import Review from "@/models/reviews.js";
import User from "@/models/user";
connect();
export async function POST(request : NextRequest){
     try{
        const {id}=await request.json();
        //console.log(id);
        const r = await Review.find();
        const u = await User.find();
        const mylisting=await Listing.findById(id).populate({
         path: 'reviews',
         populate: { path: 'author' }  // Populate the author of each review
     })
      //   console.log(mylisting.reviews.populate('reviews'))
        console.log(mylisting);
        
       const response=NextResponse.json(mylisting);
       
       return response;
     }catch(err:any){
      console.log(err.message);
      
        return NextResponse.json(err.message);
     }
}