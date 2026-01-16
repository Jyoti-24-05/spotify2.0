import mongoose from "mongoose";

const userSchema= new mongoose.Schema({
  fullName:{
    type:String,
    required:true,
  },
  imageUrl:{
    type:String,
    required:true,
  },
  clerkId:{
    type:String,
    required:true,
    unique:true,
  },
},
  { timestamp: true}//created at updated at
);

export const User= mongoose.model("User", userSchema);