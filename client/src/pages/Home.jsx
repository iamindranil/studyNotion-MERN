import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import HighlightText from "../components/core/HomePage/HighlightText";
import CTAButton from "../components/core/HomePage/Button";
import Banner from "../assets/Images/banner.mp4";
import CodeBlocks from "../components/core/HomePage/CodeBlocks";
import LearningLanguageSection from "../components/core/HomePage/LearningLanguageSection";
import TimeLineSection from "../components/core/HomePage/TimeLineSection";
import InstructorSection from "../components/core/HomePage/InstructorSection";
import Footer from "../components/common/Footer";
import ExploreMore from "../components/core/HomePage/ExploreMore";


const Home = () => {
  return (
    <div>
      {/*section 1*/}
      <div className="relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between">
        <Link to={"/signup"}>
          <div
            className="group mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200 
            transition-all duration-200 hover:scale-95 w-fit"
          >
            <div
              className="flex flex-row items-center gap-2 rounded-full px-10 py-[5px]
                transition-all duration-200 group-hover:bg-richblack-900 "
            >
              <p>Become an Instructor</p>
              <FaArrowRight />
            </div>
          </div>
        </Link>

        <div className="text-center text-4xl font-semibold mt-7">
          Empower your future with
          <HighlightText text={"coding skill"} />
        </div>

        <div className="mt-4 w-[90%] text-center text-lg font-bold text-richblack-300">
          with our online coding courses,you can learn at your own pace,from
          anywhere in the world
        </div>

        <div className="flex flex-row gap-7 mt-8">
          <CTAButton active={true} linkto={"/signup"}>
            Learn More
          </CTAButton>
          <CTAButton active={false} linkto={"/login"}>
            Book a Demo
          </CTAButton>
        </div>

        <div className="mx-3 my-12 shadow-blue-200">
          <video muted loop autoPlay>
            <source src={Banner} type="video/mp4" />
          </video>
        </div>

        <div>
          <CodeBlocks
            position={"lg:flex-row"}
            heading={
              <div className="text-4xl font-semibold">
                Unlock Your
                <HighlightText text={"coding potential"} /> with our online
                courses
              </div>
            }
            subheading={
              "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
            }
            ctabtn1={{
              btnText: "try it yourself",
              linkto: "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "learn more",
              linkto: "/login",
              active: false,
            }}
            codeblock={`<<!DOCTYPE html>\n<html>\nhead><title>Example</title><linkrel="stylesheet"href="styles.css">\n/head>\n`}
            codeColor={"text-yellow-25"}
          />
        </div>

        <div>
          <CodeBlocks
            position={"lg:flex-row-reverse"}
            heading={
              <div className="text-4xl font-semibold">
                Start
                <HighlightText text={"coding in seconds"} /> with our online
                courses
              </div>
            }
            subheading={
              "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
            }
            ctabtn1={{
              btnText: "try it yourself",
              linkto: "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "learn more",
              linkto: "/login",
              active: false,
            }}
            codeblock={`<<!DOCTYPE html>\n<html>\nhead><title>Example</title><linkrel="stylesheet"href="styles.css">\n/head>\n`}
            codeColor={"text-yellow-25"}
          />
        </div>
        <ExploreMore />
      </div>

      {/*section 2*/}

      <div className="bg-pure-greys-5 text-richblack-700">
        <div className="homepage_bg h-[315px]">
            <div className="w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-5 mx-auto">
                <div className="h-[150px]"/>
                <div className="flex flex-row gap-7 text-white justify-between">
                    <CTAButton active={true} linkto={"/signup"}>
                        <div className="flex items-center gap-2">
                            Explore Full Catalog
                            <FaArrowRight/>
                        </div>
                    </CTAButton>

                    <CTAButton active={false} linkto={"/signup"}>
                    <div className="flex items-center gap-2">
                           Learn more
                            <FaArrowRight/>
                        </div>
                    </CTAButton>

                </div>
            </div>
        </div>

        <div className="mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7">
            <div className="flex flex-row gap-5 mb-10 mt-[95px]">
                <div className="text-4xl font-semibold w-[45%]">
                    get the skills you need for a 
                    <HighlightText text={"job that are in demand"}/>
                </div>

                <div className="flex flex-col gap-10 w-[40%] items-start">
                <div className="text-[16px]">
                    The modern studynotion is the dictates it's own terms. Today,to be a 
                    competitive specialist requires more than professional skills.
                </div>
                <CTAButton active={true} linkto={"/signup"}>
                    <p>Learn More</p>
                </CTAButton>
            </div>
            </div>
            <TimeLineSection />

            <LearningLanguageSection />

        </div>

      </div>

      {/*section 3*/}
      <div className="w-11/12 mx-auto max-w-maxContent flex flex-col items-center justify-between 
      gap-8 bg-richblack-900 text-white">
        <InstructorSection/> 
        <h2 className="text-center text-4xl font-semibold mt-10">Rewiew from other learners</h2>
        {/*review Slider here*/}
    </div>
      {/*Footer*/}
      <Footer/>
    </div>
  );
};

export default Home;
