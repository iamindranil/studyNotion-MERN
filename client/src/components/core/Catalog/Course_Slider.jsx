import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import 'swiper/css/navigation';
import 'swiper/css/pagination';


import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import "react-loading-skeleton/dist/skeleton.css";


import Course_Card from "./Course_Card"
function Course_Slider({ Courses }) {
  return (
    <>
      {Courses?.length ? (
        <Swiper
          slidesPerView={1}
          spaceBetween={200}
          loop={true}
          pagination={{ clickable: true }} // Use pagination as an option
          autoplay={{ delay: 1000,disableOnInteraction:false }} // Use autoplay as an option
          navigation={true} // Use navigation as an option
          breakpoints={{
            1024: {
              slidesPerView: 3,
            },
          }}
          // className="max-h-[30rem] "
        >
          {Courses?.map((course, i) => (
            <SwiperSlide key={i}>
              <Course_Card course={course} Height={"h-[250px]"} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        // <p className="text-xl text-richblack-5">No Course Found</p>
        <div className='flex gap-4 overflow-hidden'>
                {/*  */}
                </div>
      )}
    </>
  );
}

export default Course_Slider;






















