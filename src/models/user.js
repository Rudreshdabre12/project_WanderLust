import mongoose from "mongoose";
const userSchema=new mongoose.Schema({
    username:{
       type:String,
       required:true,
    },
    email:{
        required:true,
        unique:true,
        type:String,
    },
    password:{
        required:true,
        type:String,
    },
    forgotPasswordToken:String,
    forgotPasswordTokenExpiry:Date,
    verifyToken:String,
    verifyTokenExpiry:Date,
})
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;