import React from "react";
import img1 from "../../../assets/about1.png";
import img2 from "../../../assets/about1.png";
import img3 from "../../../assets/about1.png";
import img4 from "../../../assets/about1.png";
import img5 from "../../../assets/about1.png";
import img6 from "../../../assets/about1.png";
import img7 from "../../../assets/about1.png";

export default function Hero() {
  const people = [img1, img2, img3, img4, img5, img6, img7];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#EEF5FF] to-[#FFF5E8] py-16 px-6 flex flex-col items-center text-center">

      {/* Section Heading */}
      <h2 className="text-4xl font-bold text-[#032466] mb-4">About Us</h2>
      <p className="text-[#0324668F] max-w-3xl text-lg mb-12">
        Bridging the gap between talented individuals and forward-thinking
        organizations through innovative technology and personalized matching.
      </p>

      {/* MISSION + VISION CARD */}
      <div className="relative w-full max-w-6xl mt-6 flex flex-col lg:flex-row items-center justify-between">

        {/* Dark Blue Card */}
        <div className="bg-[#032466] rounded-[40px] text-left text-white p-10 w-full lg:w-[70%] shadow-xl rounded-tr-[240px] rounded-br-[240px]">

          {/* Mission */}
          <h3 className="text-3xl font-semibold mb-3">
            Our <span className="text-yellow-400 font-bold">Mission</span>
          </h3>
          <p className="text-gray-200 leading-relaxed mb-6 max-w-md">
            I love this platform, it helped me get my dream job as a product
            manager in Google. AI prediction is such a game changer for a
            student's career.
          </p>
          <div className="w-40 h-[2px] bg-white mb-10"></div>

          {/* Vision */}
          <h3 className="text-3xl font-semibold mb-3">
            Our <span className="text-yellow-400 font-bold">Vision</span>
          </h3>
          <p className="text-gray-200 leading-relaxed max-w-md">
            To create the largest community of students and help them reach their
            career goals.
          </p>
          <div className="w-40 h-[2px] bg-white mt-6"></div>
        </div>

        {/* Right Images Cluster */}
        <div className="lg:absolute right-[-60px] top-1/2 -translate-y-1/2 mt-10 lg:mt-0 grid grid-cols-3 gap-4">
          {people.map((img, index) => (
            <div
              key={index}
              className="w-20 h-20 rounded-full bg-white p-1 shadow-md border-2 border-dashed border-[#7FB3FF] flex items-center justify-center"
            >
              <img
                src={img}
                alt="profile"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          ))}
        </div>

      </div>

      {/* Description Section */}
      <div className="mt-16 max-w-5xl text-center px-4">
        <h3 className="text-xl font-bold text-[#032466] mb-6">
          Job Portal Is A Platform Where Talent Meets Opportunities To Unlock Their Potential.
        </h3>

        <p className="text-[#0324669D] leading-relaxed mb-4">
          A Place To Learn, Upskill, Showcase Their Talents, Gain CV Points & Get Hired While
          Unlocking Their True Potential. This Enables Students To Eventually Get Hired By Their
          Dream Employers.
        </p>

        <p className="text-[#0324669D] leading-relaxed">
          We Connect STUDENTS Across Domains In INDIA To A World Of Opportunities Across The GLOBE.
          We Are A Growing Community Of ~5.3 Mn Students, Freshers, And Early Working Professionals.
          We Provide All That Students Need In Their Academic And Initial Career Journey Like Learn,
          Practice, Mentorship, Compete, & Jobs.
        </p>
      </div>
    </div>
  );
}
