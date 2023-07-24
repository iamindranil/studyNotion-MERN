const Section=require("../models/Section");
const Course=require("../models/Course");

//createSection
exports.createSection=async(req,res)=>{
    try{
        //fetch data
        const{sectionName,courseId}=req.body;
        //data validation
        if(!sectionName||!courseId){
            return res.status(400).json({
                success:false,
                message:"All fields required"
            }) 
        }
        //create section
        const newSection=await Section.create({sectionName})
        //update course with section ObjectID
        const updatedCourseDetails=await Course.findByIdAndUpdate(
                                                         courseId,
                                                         {
                                                            $push:{
                                                                courseContent:newSection._id
                                                            }
                                                         },
                                                         {new:true}
                                                        )
        //TODO: use populate to replace sections/subsections both in updatedCourseDetails
        //return response
        return res.status(200).json({
            success:true,
            message:"Section created successfully!",
            updatedCourseDetails
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Something went wrong in section creation",
            error:err.message
        })
    }
}

//updateSection

exports.updateSection=async(req,res)=>{
    try{
        //data input
        const{sectionName,sectionId}=req.body;
        //data validation
        if(!sectionName||!sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields required"
            }) 
        }
        //update data
        const section=await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true})
        //return res
        return res.status(200).json({
            success:true,
            message:"section updated successfully!",
            error:err.message
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Something went wrong in section updation",
            error:err.message
        })
    }
}

//deleteSection

exports.deleteSection=async(req,res)=>{
    try{
        //get id--assuming that we are sending id in params
        const {sectionId}=req.params
        //delete it
        await Section.findByIdAndDelete(sectionId);
        //TODO: do we need to delete the entry from course schema???
        //return res
        return res.status(200).json({
            success:true,
            messagge:"Section Deleted Successfully!"
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Something went wrong in section updation",
            error:err.message
        })
    }
}

