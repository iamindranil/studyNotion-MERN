const Category = require("../models/Category");



//create Tag Handler fun^n
exports.createCategory=async(req,res)=>{
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
        const categoryDetails=await Category.create({
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

exports.showAllCategory=async(req,res)=>{
     try{
        const allCatagory=await Category.find({},{name:true,description:true})
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

//categoryPageDetails
exports.categoryPageDetails=async(req,res)=>{
    try{
        //get category id
        const{categoryId}=req.body;
        //get courses for specific category id
        const selectedCategory=await Category.findById(categoryId)
                                             .populate("courses")
                                             .exec();
        //validation
        if(!selectedCategory){
            return res.status(400).json({
                success:false,
                message:"Data not found!"
            })
        }
        //get courses for different categories
        const differentCategories=await Category.find({
                                                         _id:{$ne:categoryId},
                                                     })
                                                     .populate("courses")
                                                     .exec();
        //get top selling courses

        //return res
        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories
            }
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}
