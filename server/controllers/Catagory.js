const Catagory=require("../models/Catagory");


//create Tag Handler fun^n
exports.createCatagory=async(req,res)=>{
    try{
        //fetch data
        const{name,description}=req.body;
        //validation
        if(!name||!description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        //create entry in DB
        const tagDetails=await Catagory.create({
            name:name,
            description:description
        })
        //return res
        return res.status(200).json({
            success:true,
            message:"Catagory created Successfully!"
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}

//getAllCatagory

exports.showAllCatagory=async(req,res)=>{
     try{
        const allCatagory=await Catagory.find({},{name:true,description:true})
        return res.status(200).json({
            success:true,
            message:"All tags returned Successfully!",
            allCatagory
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
     }
}