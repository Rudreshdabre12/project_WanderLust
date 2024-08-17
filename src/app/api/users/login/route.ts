import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import {giveTokenData} from "@/utills/getData"
connect();

export async  function POST(request:NextRequest){
    try{
       const reqBody=await request.json();
       console.log(giveTokenData());
       const {username,password}=reqBody;
       console.log(reqBody);
       const user=await User.findOne({username});
       if(!user){
        return NextResponse.json({error:"user does not exist"},{status:400});
       }
       const validPassword=await bcryptjs.compare(password,user.password);
       if(!validPassword){
          return NextResponse.json({error:"Invalid Password"},{status:400});
       }
       //create token data
       const tokenData={
         id:user._id,
         username:user.username,
         email:user.email,
       }
       //create token
       const token=await jwt.sign(tokenData,process.env.TOKEN_SECRET!,{expiresIn:"1d"})
       const response=NextResponse.json({
        message:"login successfully",
        success:true,
       })
       response.cookies.set("token",token,{
        httpOnly:true,
       })
       return response;
    }catch(error:any){
        return NextResponse.json({error:error.message},{status:500});
    }
}