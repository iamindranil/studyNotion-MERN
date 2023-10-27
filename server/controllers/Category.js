const Category = require("../models/Category");
function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}


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
        const allCatagory=await Category.find()
        return res.status(200).json({
            success:true,
            message:"All tags returned Successfully!",
            data:allCatagory
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
    try {
      // console.log(57)
        const { categoryId } = req.body
    
        // Get courses for the specified category
        const selectedCategory = await Category.findById(categoryId)
          .populate({
            path: "courses",
            match: { status: "Published" },
            populate: "ratingAndReviews",
          })
          .exec()
          console.log(69)
          console.log(selectedCategory)
        // console.log("SELECTED COURSE", selectedCategory)
        // Handle the case when the category is not found
        if (!selectedCategory) {
          console.log("Category not found.")
          return res
            .status(404)
            .json({ success: false, message: "Category not found" })
        }
        // Handle the case when there are no courses
        if (selectedCategory.courses.length === 0) {
          console.log("No courses found for the selected category.")
          return res.status(404).json({
            success: false,
            message: "No courses found for the selected category.",
          })
        }
    
        // Get courses for other categories
        const categoriesExceptSelected = await Category.find({
          _id: { $ne: categoryId },
        })
        let differentCategory = await Category.findOne(
          categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
            ._id
        )
          .populate({
            path: "courses",
            match: { status: "Published" },
          })
          .exec()
        console.log()
        // Get top-selling courses across all categories
        const allCategories = await Category.find()
          .populate({
            path: "courses",
            match: { status: "Published" },
            populate:{
              path: "instructor"
            },
          })
          .exec()
        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 10)
    
        res.status(200).json({
          success: true,
          data: {
            selectedCategory,
            differentCategory,
            mostSellingCourses,
          },
        })
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message,
        })
      }
}
