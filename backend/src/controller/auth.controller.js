import { User } from "../models/user.model.js";

export const authCallback= async (req,res)=>{
  try {
    const {id, firstName, lastName, imageUrl} = req.body;

    //check  if user alredy exist
    const user= await User.findOne({clerkId: id});

    if(!user){
      //signup
      await User.create({
        clearId:id,
        fullName:`${firstName} ${lastName}`,
        imageUrl
      })
    }
    res.status(200).json({success:true})
  } catch (error) {
    console.log("Error in auth callback", error);
    res.status(500).json({message: "Internal server error", error});
  }
};