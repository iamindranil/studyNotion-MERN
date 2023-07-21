const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const bcrypt=require("bcrypt");
//resetPasswordToken

exports.resetPasswordtoken=async(req,res)=>{
    try{
        //get email from body
        const email=req.body.email;
        //check user for this email,email validation
        const user=await User.findOne({email:email})
        if(!user){
            return res.json({
                success:false,
                message:"your email is not registered with us"
            })
        }
        //token gen
        const token=crypto.randomUUID();
        //update user by adding token and expiration time
        const updatedDetails=await User.findOneAndUpdate(
                                            {email:email},
                                            {
                                                token:token,
                                                resetPasswordExpires:Date.now()+5*60*100,
                                            },
                                            {new:true});
        //create url
        const url=`http://localhost:3000/update-password/${token}`
        //send mail containing url
        await mailSender(email,"Password Reset Link",`Password reset Link: ${url}`);
        //return res
        return res.status(200).json({
            success:true,
            message:"Email sent successfully!...Please check your email and change password"
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Password reset failed!...please try again"
        })
    }
}  

//resetPassword
exports.resetPassword=async(req,res)=>{
    try{
        //data fetch
        const{password,confirmedPassword,token}=req.body;
        //validation
        if(password!==confirmedPassword){
            return res.status(400).json({
                success:false,
                message:"password mismatched!"
            })
        }
        //get user details from db uing token
        const userDetails=await User.findOne({token:token});
        //if no entry-- invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:"invalid token"
            })
        }
        //token time check
        if(userDetails.resetPasswordExpires<Date.now()){
            return res.json({
                success:false,
                message:"session expired...please regenerate your token"
            })
        }
        //hash pwd
        const hashedPassword= await bcrypt.hash(password,10);
        //pasword update
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true}
        )
        //return res
        return res.json({
            success:true,
            message:"Reset password done"
        })
    }catch(err){
        return res.json({
            success:false,
            message:"Something went wrong while resetting pasword...please try again!"
        })
    }
}

