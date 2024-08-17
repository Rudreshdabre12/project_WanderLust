import { getDataFromToken } from "@/helper/getDataFromToken";

import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function giveTokenData(request){

    try {
        const userId = await getDataFromToken(request);
        const user = await User.findOne({_id: userId}).select("-password");
        return NextResponse.json({
            message: "User found",
            data: user
        })
    } catch (error) {
        return NextResponse.json({error: error.message}, {status: 400});
    }

}