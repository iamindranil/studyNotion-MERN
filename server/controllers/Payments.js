const{instance}=require("../config/razorpay");
const Course=require("../models/Course");
const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const{courseEnrollmentEmail}=require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");


//capture the payment
exports.capturePayment=async(req,res)=>{
    try{
        //get courseId and UserID
        const {course_id}=req.body;
        const userId=req.user.id;
        //validation
        //valid courseID
        if(!course_id){
            return res.status(400).json({
                success:false,
                message:"Please provide valid course ID"
            })
        }
        //valid courseDetails
        let course;
        course=await Course.findById(course_id);
        if(!course){
            return res.status(400).json({
                success:false,
                message:"Course not found"
            })
        }
        //user already paid for that course
        const uid=new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(400).json({
                success:false,
                message:"Student already enrolled"
            })
        }
        //create order
        const amount=course.price;
        const currency="INR";
        const options={
            amount:amount*100,
            currency,
            recipt:Math.random(Date.now()).toString(),
            notes:{
                courseId:course_id,
                userId
            }
        }
        //initiate payment
        const paymentResponse=await instance.orders.create(options);
        if(!paymentResponse){
            return res.status(400).json({
                success:false,
                message:"Couldn't initiate orders"
            })
        }
        console.log(paymentResponse);
        //return res
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orederId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"something went wrong while making payments"
        })
    }
}

//verify signature
exports.verifySignature=async(req,res)=>{
    const webhookSecret="12345678";
    const signature=req.headers("x-razorpay-signature");
    //steps
    const shasum=crypto.createHmac("sha256",webhookSecret);//1
    shasum.update(JSON.stringify(req.body));//2
    const digest=shasum.digest("hex");//3

    if(signature===digest){
        console.log("payment is authorized");
        const{courseId,userId}=req.body.payload.payment.entity.notes;
        try{
            //fulfil the action


            //find the course and enroll students in it
            const enrolledCourse=await Course.findOneAndUpdate(
                                                    {_id:courseId},
                                                    {$push:{studentsEnrolled:userId}},
                                                    {new:true}
            );
            if(!enrolledCourse){
               return res.status(500).json({
                success:false,
                message:"Course not found"
               })
            }
            console.log(enrolledCourse);
            //find student and add course in the list of enrolled course
            const enrolledStudent=await User.findOneAndUpdate(
                                                    {_id:userId},
                                                    {$push:{courses:courseId}},
                                                    {new:true}
                                                    );
                                                  
            //send confirmation mail
            const emailResponse=await mailSender(enrolledStudent.email,
                                                "Congratulation your course added",
                                                "Greetings! from studynotion,you are onboarded into new course");
            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:"Signature verified and course added"
            })
        }catch(err){
            console.log(err);
            return res.status(500).json({
                success:false,
                message:err.message
            })
        }
    }else{
        return res.status(400).json({
            success:false,
            message:"Invalid request"
        })
    }
     
}
