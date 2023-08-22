const jwt=require("jsonwebtoken");
require("dotenv").config();


//auth
exports.auth=async(req,res,next)=>{
    try{
        //extract token
        const token=req.cookies.token
                    ||req.body.token
                    ||req.header("Authorisation").replace("Bearer ", ""); 
        //if missing toke return res
        if(!token){ 
            return res.status(401).json({
                success:false,
                message:"token missing"

            })
        }
        
        //verify the token
        try{
            const decode=jwt.verify(token,process.env.JWT_SECRET)
            req.user=decode; 
        }catch(err){
            return res.status(401).json({
                success:false,
                message:"decoding failed"

            })
        }
        next();
    }catch(err){
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validating the token',
            message:err.message
        })
    }
}
//isStudent
exports.isStudent=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Student"){
            return res.status(401).json({
                success:false,
                message:"It's protected route for students only"
            })
        }
        next();
    }catch(err){
        return res.status(401).json({
            success:false,
            message:"User role cannot be verified,please try again"

        })
    }
}


//instructor

exports.isInstructor=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Instructor"){
            return res.status(401).json({
                success:false,
                message:"It's protected route for Instructors only"
            })
        }
        next();
    }catch(err){
        return res.status(401).json({
            success:false,
            message:"User role cannot be verified,please try again",
        })
    }
}

//isAdmin
exports.isAdmin=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Admin"){
            return res.status(401).json({
                success:false,
                message:"It's protected route for Admin only"
            })
        }
        next();
    }catch(err){
        return res.status(401).json({
            success:false,
            message:"User role cannot be verified,please try again"

        })
    }
}