const Profile=require("../models/Profile");
const User=require("../models/User");
const Course=require("../models/Course");
const{uploadImageToCloudinary}=require("../utils/imageUploader");
// const cron=//require("node-cron");
exports.updateProfile=async(req,res)=>{
    try{
        //get data
        const{firstName = "",lastName = "",dateOfBirth="",about="",contactNumber,gender=""}=req.body;
        //get userId
        const id=req.user.id;

        // Find the profile by id
		const userDetails = await User.findById(id);
		const profile = await Profile.findById(userDetails.additionalDetails);

    const user = await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
    })
    await user.save()
    

		// Update the profile fields
		profile.dateOfBirth = dateOfBirth;
		profile.about = about;
		profile.contactNumber = contactNumber;
    profile.gender = gender
		// Save the updated profile
		await profile.save();
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()
        //return res
        return res.status(200).json({
            success:true,
            message:"profile updated successfully!",
            updatedUserDetails
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
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
        console.log(202020)
        const userDetails=await User.findById({_id:id});
        console.log(userDetails)
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
        // await Course.findByIdAndDelete({_id:userDetails.courses});
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

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};

exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses, 
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};