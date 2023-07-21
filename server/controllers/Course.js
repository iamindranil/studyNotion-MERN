const Course=require("../models/Course");
const Tag=require("../models/Catagory");
const User=require("../models/User");
const {uploadImageToCloudinary}=require("../utils/imageUploader");

//createCourse Handler

exports.createCourse=async(req,res)=>{
    try{
        //fetch data
        const{courseName,courseDescription,whatYouWillLearn,price,tag}=req.body;
        //get thumbnail
        const thumbnail=req.files.thumbnailImage;
        //validation
        if(!courseName
           ||!courseDescription
           ||!whatYouWillLearn
           ||!price
           ||!tag
           ||!thumbnail){
            return req.status(400).json({
                success:false,
                message:"All fields are necessary"
            })
        }
        //validation---->check for instructors
        const userId=req.user.id;
        const instructorDetails=await User.findById(userId);
        //TODO: verify userId and instructorDetails._id are same or not?
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"instructor details not found"
            })
        }
        //check given tag is valid or not
        const tagDetails=await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"Tag details not found"
            })
        }
        //upload image to cloudinary
        const thumbnailImage=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
        //create entry of new course
        const newCourse=await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn,
            tag:tagDetails._id,
            thumbnail:thumbnail.secure_url
        })
        //add new course to user schema of instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true}
        )
        //update the tag schema
        await Tag.create(
            {name:instructorDetails.name},
            {description:courseDescription},
            {
                $push:{
                    course:newCourse._id
                }
            },
            {new:true}
            )
        //return res
        return res.status(200).json({
            success:true,
            message:"Course Created Successfully!"
        })
    }catch(err){
        return res.status(404).json({
            success:false,
            message:"something went wrong while creating course "
        })
    }
}


//showAllCourses Handler
exports.showAllCourses=async(req,res)=>{
    try{
        const allCourses=await Course.find({},{courseName:true,
                                               price:true,
                                               thumbnail:true,
                                               instructor:true,
                                               ratingAndReviews:true,
                                               studentsEnrolled:true})
                                               .populate("instructor")
                                               .exec();
        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            allCourses
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Can not fetch all courses",
            error:err.message
        })
    }
}