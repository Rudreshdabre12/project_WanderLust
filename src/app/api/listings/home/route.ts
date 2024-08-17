import mongoose from "mongoose";
import Link from "next/link";
import listings from "@/models/listings"
import { NextRequest, NextResponse } from "next/server";
import {connect} from "@/dbConfig/dbConfig";
connect();
export async function GET(request : NextRequest){
     try{
       const allListings= await listings.find({});
       const response=NextResponse.json(allListings);
       return response;
     }catch(err:any){
        return NextResponse.json(err.message);
     }
}