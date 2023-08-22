const SubSection=require("../models/SubSection");
const Section=require("../models/Section");
const{uploadImageToCloudinary}=require("../utils/imageUploader");
require("dotenv").config();
//create Subsection
exports.createSubSection=async(req,res)=>{
    try{
        //fetch data from req body
        const{sectionId,title,timeDuration,description}=req.body;
        //extract file/video
        const video=req.files.video;
        //validation
        if(!sectionId
            ||!title
            ||!timeDuration
            ||!description
            ||!video
            ){
                return res.status(400).json({
                    success:false,
                    message:"All fields are required"
                })
            }
        //upload video to cloudinary
        const uploadDetails=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        //create a subsection 
        const SubSectionDetails=await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url
        })
        //update section with this subsection id
        const updatedSection=await Section.findByIdAndUpdate(
                                                {_id:sectionId},
                                                {
                                                    $push:{subSection:SubSectionDetails._id}
                                                },
                                                {new:true}).populate("subSection");
    
        //TODO: log updated section here,after adding populate query                                            )
        return res.status(200).json({
            success:true,
            message:"Sub section created",
            updatedSection
        })
        //return res  
        
    }catch(err){
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: err.message,
		});
    }
}


