import mongoose from "mongoose";
import Link from "next/link";
import listings from "@/models/listings"
import { NextRequest, NextResponse } from "next/server";
import {connect} from "@/dbConfig/dbConfig";
connect();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request : NextRequest){
     try{
       const allListings = await listings.find({});
       const response = NextResponse.json(allListings);
       
       // Add cache control headers
       response.headers.set('Cache-Control', 'no-store');
       return response;
     } catch(err:any){
        return NextResponse.json(err.message);
     }
}