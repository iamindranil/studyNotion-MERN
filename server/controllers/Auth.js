const User=require("../models/User");
const OTP=require("../models/OTP");
const Profile=require("../models/Profile");
const otpGenerator=require("otp-generator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config();

//send otp
exports.sendotp=async(req,res)=>{
    try{
        //fetch email
        const{email}=req.body;
        //check if user already exists
        const checkUserPresent=await User.findOne({email});
        // //if user already exists,then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message: "User already registered"
            })
        }
        //generate OTP
        var otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        });
        // check unique otp
        let result=await OTP.findOne({otp:otp});

        while(result){
            otp=otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            })
            result=await OTP.findOne({otp:otp});//multiple time DB entry checking....needs to improve futher
        }
        //DB entry of otp
        const otpPayload={email,otp};
        const otpBody=await OTP.create(otpPayload);
        //return successful response
        res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            otp
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            message:err.message
        })
    }
};



//signup
exports.signup=async(req,res)=>{
    try{
        //data fetch
        const{
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        }=req.body;
        //validate
        if(!firstName||!lastName||!email||!password||
            !confirmPassword||!accountType||!otp){
                return res.status(403).json({
                    success:false,
                    message:"All fields required"
                })
        }
        //check 2 passwords match
        if(password!==confirmPassword){
            return res.status(403).json({
                success:false,
                message:"Write proper passwords"
            })
        }
        //check user already present or not
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User Already registered"
            })
        }
        //find most recent OTP for the user*****
        const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);
        //validate OTP
        if(recentOtp.length===0){
            //OTP not found
            return res.status(400).json({
                success:false,
                message:"OTP not found"
            })
        }else if(otp!==recentOtp[0].otp){
            return res.status(400).json({
                success:false,
                message:"OTP mismatched"   
            })
        }
        //hash password
        const hashedPassword=await bcrypt.hash(password,10);
        //create entry in DB
        const profileDetails=await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });
        const user=await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })
    //return successful response
    return res.status(200).json({
        success:true,
        message:"User is registered successfully!",
        user
    })
    }catch(err){
        return res.status(400).json({
            success:false,
            message:"User can not be registered.please try again"
        })
    }
}



//login
exports.login=async(req,res)=>{
    try{
        //get data from req body
        const{email,password}=req.body;
        //vallidate data
        if(!email||!password){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }
        //user check exists or not
        const user=await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(403).json({
                success:false,
                message:"Please SignUp First"
            })
        }
        //password matching
        //generate JWT
        if(await bcrypt.compare(password,user.password)){
            const payload={
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token=jwt.sign(payload,process.env.JWT_SECRET,{
                 expiresIn:"2h"
            })
            user.token=token;
            user.password=undefined;
            //create cookie
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }
            //send res
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully!"
            })
        }else{
            return res.status(401).json({
                success:false,
                message:"password is incorrect"
            })
        }
    }catch(err){
        console.log(err);
        return req.status(500).json({
            success:false,
            message:"Login Failure,Please try again"
        })
    }
}
//changepassword

exports.changePassword=async(req,res)=>{
    try{
        //get data from req.body
        const{oldPassword,newPassword}=req.body;
        const userDetails=await User.findById(req.user.id)
        
        //validate password
        const isPasswordMatch=await bcrypt.compare(
            oldPassword,
            userDetails.password
        )
        if(!isPasswordMatch){
            return res.status(400).json({
                success:false,
                message:"The password is incorrect"
            })
        }
        //update password
        const encryptedPassword=await bcrypt.hash(newPassword,10);
        const updatedUserDetails=await User.findByIdAndUpdate(
            req.user.id,
            {password:encryptedPassword},
            {new:true}
        )
        //send notification mail
        try{
            const emailResponse=await mailSender(
                updatedUserDetails.email,
                "Password for your account has been updated",
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} 
                    ${updatedUserDetails.lastName}`
                )
            )
            console.log("Email sent successfully!",emailResponse.response)
        }catch(error){
            console.error("Error occurred while sending email:", error)
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            })
        }
        return res.status(200).json({success:true,message:"Password Updated successfully"})
    }catch(error){
        console.error("Error occurred while updating password:", error)
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        })
    }
}