const Course=require("../models/Course");
const Category=require("../models/Category");
const User=require("../models/User");
const {uploadImageToCloudinary}=require("../utils/imageUploader");

//createCourse Handler

exports.createCourse=async(req,res)=>{
    try{
        //fetch data
        let{courseName,courseDescription,whatYouWillLearn,price,tag,category,status,instructions}=req.body;
        //get thumbnail
        const thumbnail=req.files.thumbnailImage;
        //validation
        if(!courseName
           ||!courseDescription
           ||!whatYouWillLearn
           ||!price
           ||!tag
           ||!thumbnail
           ||!category){
            return res.status(400).json({ 
                success:false,
                message:"All fields are necessary"
            })
        }
        //validation---->check for instructors
        const userId=req.user.id;
        const instructorDetails=await User.findById(userId,{accountType:"Instructor"});
        //TODO: verify userId and instructorDetails._id are same or not?
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"instructor details not found"
            })
        }
        //check given tag is valid or not
        const categoryDetails=await Category.findById(category);
        if(!categoryDetails){
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
            whatYouWillLearn:whatYouWillLearn,
            price,
			tag:tag,
			category: categoryDetails._id,
			thumbnail: thumbnailImage.secure_url,
			status: status,
			instructions: instructions,
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
        await Category.findByIdAndUpdate(
			{ _id: category },
			{
				$push: {
					course: newCourse._id,
				},
			},
			{ new: true }
		);
        //return res
        return res.status(200).json({
            success:true,
            data:newCourse,
            message:"Course Created Successfully!"
        })
    }catch(err){
        return res.status(404).json({
            success:false,
            message:err.message
        })
    }
}


//getAllCourses Handler
exports.getAllCourses=async(req,res)=>{
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

//getCourseDetails
exports.getCourseDetails=async(req,res)=>{
    try{
        //get id
        const {courseId}=req.body;
        //find course details
        const courseDetails=await Course.find(
                                {_id:courseId})
                                .populate(
                                    {
                                        path:"instructor",
                                        populate:{
                                            path:"additionalDetails"
                                        }
                                    }
                                )
                                .populate("category")
                                .populate("ratingAndReviews")
                                .populate({
                                    path:"courseContent",
                                    populate:{
                                        path:"subSection"
                                    }
                                })
                                .exec();
        //validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`course can not be found with ${courseId}`
            })
        }
        //return res
        return res.status(200).json({
            success:true,
            message:"Course Details fetched successfully!",
            data:courseDetails
        })
    }catch(err){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}