const{instance}=require("../config/razorpay");
const Course=require("../models/Course");
const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const{courseEnrollmentEmail}=require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const crypto=require('crypto');


//enrolledstudent function
const enrollStudents=async(courses,userId,res)=>{
    if(!courses||!userId){
        return res.status(200).json({success:false,message:"Please provide required courses or user_id"});
    }
    //update courseId->course
    //       course->courseId

    for(const courseId of courses){
        try{
            //find courses and enroll students in it
            const enrolledCourse=await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{studentsEnrolled:userId}},
                {new:true}
            )
            if(!enrolledCourse){
                return res.status(500).json({success:false,message:"Course not found"});
            }
            //find the students and add corresponding enrolled courses

            const enrolledStudent=await User.findByIdAndUpdate(userId,
                    {$push:{
                        courses:courseId
                    }},{new:true}
            );
            //send mail
            const emailResponse=await mailSender(
                enrolledStudent.email,
                `Successfullly Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName,`${enrolledStudent.firstName} ${enrolledStudent.lastName}`)
            )
            console.log('Email sent successfully',emailResponse.response);
        }catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message
            })
        }
    }
}





//initiate the razorpay order
exports.capturePayment=async(req,res)=>{
    const {courses}=req.body;
    const userId=req.user.id;
    if(courses.length===0){
        return res.json({success:false,message:"Please provide courseID"})
    }
    let totalAmount=0;
    for(const course_id of courses){
        let course;
        try{
            course=await Course.findById(course_id);
            if(!course){
                return res.status(200).json({success:false,message:"Could not find the course"});
            }
            //check whether user already enrolled or not 
            const uid=new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)){
                return res.status(200).json({success:false,message:"student is already enrolled"});
            }
            totalAmount+=course.price;
        }catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message
            })
        }
    }

    const options={
        amount:totalAmount*100,
        currency:"INR",
        receipt:Math.random(Date.now().toString())
    }
    //create order
    try{
        const paymentResponse=await instance.orders.create(options);
        res.json({
            success:true,
            message:paymentResponse
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Could not initiate order"
        })
    }
}

//verify the payment signature
exports.verifySignature=async(req,res)=>{
    const razorpay_order_id=req.body?.razorpay_order_id;
    const razorpay_payment_id=req.body?.razorpay_payment_id;
    const razorpay_signature=req.body?.razorpay_signature;
    const courses=req.body?.courses;
    const userId=req.user.id;
    //validation
    if(
       !razorpay_order_id||
       !razorpay_payment_id||
       !razorpay_signature||
       !userId||
       !courses
      ){
        res.status(200).json({
            success:false,
            message:"your payment has been failed"
        })
      }

      let body=razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature=crypto
                              .createHmac("sha256",process.env.RAZORPAY_SECRET)
                              .update(body.toString())
                              .digest("hex");
      if(expectedSignature===razorpay_signature){
        //enroll that student
        await enrollStudents(courses,userId,res);

        //reeturn response
        return res.status(200).json({
            success:true,
            message:"Payment Verified"
        })
      }
      return res.status(200).json({
        success:false,
        message:"Payment Failed!"
    })
}

exports.sendPaymentSuccessEmail=async(req,res)=>{
    const{orderId,paymentId,amount}=req.body;
    const userId=req.user.id;
    if(!orderId||!paymentId||!amount||!userId){
        return res.status(400).json({
            success:false,
            message:"Please provide all the fields"
        })
    }
    try{
        const enrolledStudent=await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            'Payment Received',
            paymentSuccessEmail(`${enrolledStudent.firstName}`,
                amount/100,orderId,paymentId
            )
        )
    }catch(error){
        console.log("error in sending mail",error);
        res.status(500).json({
            success:false,
            message:"Could not send email"
        })
    }
}














// //capture the payment
// exports.capturePayment=async(req,res)=>{
//     try{
//         //get courseId and UserID
//         const {course_id}=req.body;
//         const userId=req.user.id;
//         //validation
//         //valid courseID
//         if(!course_id){
//             return res.status(400).json({
//                 success:false,
//                 message:"Please provide valid course ID"
//             })
//         }
//         //valid courseDetails
//         let course;
//         course=await Course.findById(course_id);
//         if(!course){
//             return res.status(400).json({
//                 success:false,
//                 message:"Course not found"
//             })
//         }
//         //user already paid for that course
//         const uid=new mongoose.Types.ObjectId(userId);
//         if(course.studentsEnrolled.includes(uid)){
//             return res.status(200).json({
//                 success:false,
//                 message:"Student already enrolled"
//             })
//         }
//         //create order
//         const amount=course.price;
//         const currency="INR";
//         const options={
//             amount:amount*100,
//             currency,
//             recipt:Math.random(Date.now()).toString(),
//             notes:{
//                 courseId:course_id,
//                 userId
//             }
//         }
//         //initiate payment
//         const paymentResponse=await instance.orders.create(options);
//         if(!paymentResponse){
//             return res.status(400).json({
//                 success:false,
//                 message:"Couldn't initiate orders"
//             })
//         }
//         console.log(paymentResponse);
//         //return res
//         return res.status(200).json({
//             success:true,
//             courseName:course.courseName,
//             courseDescription:course.courseDescription,
//             thumbnail:course.thumbnail,
//             orederId:paymentResponse.id,
//             currency:paymentResponse.currency,
//             amount:paymentResponse.amount
//         })
//     }catch(err){
//         return res.status(500).json({
//             success:false,
//             message:"something went wrong while making payments"
//         })
//     }
// }

// //verify signature
// exports.verifySignature=async(req,res)=>{
//     const webhookSecret="12345678";
//     const signature=req.headers["x-razorpay-signature"];
//     //steps
//     const shasum=crypto.createHmac("sha256",webhookSecret);//1(hmac- hashed based msg auth-N code)
//     shasum.update(JSON.stringify(req.body));//2
//     const digest=shasum.digest("hex");//3

//     if(signature===digest){
//         console.log("payment is authorized");
//         const{courseId,userId}=req.body.payload.payment.entity.notes;
//         try{
//             //fulfil the action


//             //find the course and enroll students in it
//             const enrolledCourse=await Course.findOneAndUpdate(
//                                                     {_id:courseId},
//                                                     {$push:{studentsEnrolled:userId}},
//                                                     {new:true}
//             );
//             if(!enrolledCourse){
//                return res.status(500).json({
//                 success:false,
//                 message:"Course not found"
//                })
//             }
//             console.log(enrolledCourse);
//             //find student and add course in the list of enrolled course
//             const enrolledStudent=await User.findOneAndUpdate(
//                                                     {_id:userId},
//                                                     {$push:{courses:courseId}},
//                                                     {new:true}
//                                                     );
                                                  
//             //send confirmation mail
//             const emailResponse=await mailSender(enrolledStudent.email,
//                                                 "Congratulation your course added",
//                                                 "Greetings! from studynotion,you are onboarded into new course");
//             console.log(emailResponse);
//             return res.status(200).json({
//                 success:true,
//                 message:"Signature verified and course added"
//             })
//         }catch(err){
//             console.log(err);
//             return res.status(500).json({
//                 success:false,
//                 message:err.message
//             })
//         }
//     }else{
//         return res.status(400).json({
//             success:false,
//             message:"Invalid request"
//         })
//     }
     
// }
