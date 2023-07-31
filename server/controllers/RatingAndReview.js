const RatingAndReview=require("../models/RatingAndReview");
const Course=require("../models/Course");
const { default: mongoose } = require("mongoose");


//createRating
exports.createRating=async(req,res)=>{
    try{
        //get user id
        const userId=req.user.id;
        //fetch data from body
        const{rating,review,courseId}=req.body;
        //check if user is enrolled or not
        const courseDetails=await Course.findOne(
                                            {
                                                _id:courseId,
                                                studentsEnrolled:{$elemMatch:{$eq:userId}},
                                            })
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"Student is not enrolled in the course"
            })
        }
        //check user already reviewed or not
        const alreadyReviewed=await RatingAndReview.findOne(
                                                        {
                                                            user:userId,
                                                            course:courseId
                                                        })
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"course is already reviewed by the student"
            })
        }
        //create rating and review
        const ratingReview=await RatingAndReview.create({
            rating,
            review,
            course:courseId,
            user:userId
        })
        //update course with this rating and review
        const updatedCoursedetails=await Course.findByIdAndUpdate({_id:courseId},
                                    {
                                        $push:{
                                            ratingAndReviews:ratingReview._id
                                        }
                                    },{new:true})
        console.log(updatedCoursedetails)
        //return res
        return res.status(200).json({
            success:true,
            message:"Rated and Reviewed Successfully",
            ratingReview
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}
//getAvgRating
exports.getAverageRating=async(req,res)=>{
    try{
        //get courseId
        const courseId=req.body.courseId;
        //calculate avg rating
        const result=await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"}
                }
            }
        ])
        //return res
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
                averageRating:0
            })   
        }
        return res.status(200).json({
            success:true,
            message:"avg rating is zero"
        })  
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}
//getAllRatingandReviews
exports.getAllRatingandReviews=async(req,res)=>{
    try{
        const allReviews=await RatingAndReview.find({})
                                .sort({rating:"desc"})
                                .populate({
                                    path:"user",
                                    select:"firstName lastName email image"
                                })
                                .populate({
                                    path:"course",
                                    select:"courseName"
                                })
                                .exec()
        return res.status(200).json({
            success:true,
            message:"avg rating is zero",
            data:allReviews
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}