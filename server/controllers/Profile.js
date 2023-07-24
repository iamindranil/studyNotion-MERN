const Profile=require("../models/Profile");
const User=require("../models/User");
const Course=require("../models/Course");
// const cron=//require("node-cron");
exports.updateProfile=async(req,res)=>{
    try{
        //get data
        const{dateOfBirth="",about="",contactNumber,gender}=req.body;
        //get userId
        const id=req.user.id;
        //validation
        if(!contactNumber||!gender||!id){
            return res.status(400).json({
                success:false,
                message:"please provide all fields"
            })
        }
        //find profile
        const userDetails=await User.findById(id);
        const profileId=userDetails.additionalDetails;
        const profileDetails=await Profile.findById(profileId);
        //update profile
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.gender=gender;
        profileDetails.contactNumber=contactNumber;
        //update in DB
        await profileDetails.save();
        //return res
        return res.status(200).json({
            success:true,
            message:"profile updated successfully!".
            profileDetails
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"something wrong while profile updation".
            profileDetails
        })
    }
}

//deleteAccount
//cronJob --> explore
exports.deleteAccount=async(req,res)=>{
    try{
        //getId
        const id=req.user.id;
        //validation
        const userDetails=await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"user details not found"
            })
        }
        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails})
        //delete user
        await User.findByIdAndDelete({_id:id})
        //TODO:: unenroll user from all enrolled courses
        await Course.findByIdAndDelete({_id:userDetails.courses});
        //return res
        return res.status(200).json({
            success:true,
            message:"profile deleted successfully!".
            profileDetails
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"something wrong while profile deletion".
            profileDetails
        })
    }
}

//getAllUserDetails
exports.getAllUserDetails=async(req,res)=>{
    try{
        //get id
        const id=req.user.id;
        //validation
        const allUserDetails=await User.findById(id).populate("additionalDetails").exec();
        //return res
        return res.status(200).json({
            success:true,
            message:"all profile details have been fetched successfully!",
            allUserDetails
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"something wrong while fetching all profile details".
            profileDetails
        })
    }
}