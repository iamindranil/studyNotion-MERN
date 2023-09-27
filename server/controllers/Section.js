const Section=require("../models/Section");
const Course=require("../models/Course");
const SubSection = require("../models/SubSection");


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
        console.log(newSection);
        //update course with section ObjectID
        const updatedCourse=await Course.findByIdAndUpdate(
                                                         courseId,
                                                         {
                                                            $push:{
                                                                courseContent:newSection._id
                                                            }
                                                         },
                                                         {new:true}
                                                        )
                                                        .populate({
                                                                path:"courseContent",
                                                                populate:{
                                                                        path:"subSection"
                                                                }
                                                        }).exec();
        //TODO: use populate to replace sections/subsections both in updatedCourseDetails
        //return response 
        return res.status(200).json({
            success:true,
            message:"Section created successfully!",
            updatedCourse
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
        const { sectionName, sectionId, courseId } = req.body
        const section = await Section.findByIdAndUpdate(
          sectionId,
          { sectionName },
          { new: true }
        )
        const course = await Course.findById(courseId)
          .populate({
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          })
          .exec()
        console.log(course)
        res.status(200).json({
          success: true,
          message: section,
          data: course,
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

exports.deleteSection = async (req, res) => {
    try {
      console.log(90)
      const { sectionId, courseId } = req.body
      await Course.findByIdAndUpdate(courseId, {
        $pull: {
          courseContent: sectionId,
        },
      })
      const section = await Section.findById(sectionId)
      console.log(sectionId, courseId)
      if (!section) {
        return res.status(404).json({
          success: false,
          message: "Section not found",
        })
      }
      // Delete the associated subsections
      await SubSection.deleteMany({ _id: { $in: section.subSection } })
  
      await Section.findByIdAndDelete(sectionId)
  
      // find the updated course and return it
      const course = await Course.findById(courseId)
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      res.status(200).json({
        success: true,
        message: "Section deleted",
        data: course,
      })
    } catch (error) {
      console.error("Error deleting section:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }