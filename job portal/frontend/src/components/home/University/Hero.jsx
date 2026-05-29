import React from "react";

const Hero = () => {
  return (
    <div className="relative w-full min-h-60 bg-white flex flex-col items-center justify-center px-15 text-center overflow-hidden bg-gradient-to-b from-[#D1E7FF]/70 via-[#F9F9FA]/10 to-transparent blur-s pointer-events-none">

     

      {/* Headings */}
      <h3 className="text-4xl md:text-5xl font-bold text-[#032466] mb-3 relative z-10 ">
        Empower Your Students with Career-Ready Tools.
      </h3>

      <h5 className="text-lg md:text-xl text-gray-700 relative z-10">
        Track, Train & Transform Outcomes with Real-Time Insights.
      </h5>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-3 relative z-10">
        <button className="bg-[#032466] text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#021a47] transition">
          Register As Recruiter
        </button>

        <button className="border-2 border-[#032466] text-[#032466] font-semibold px-6 py-3 rounded-lg hover:bg-[#032466] hover:text-white transition">
          Post A Job
        </button>
      </div>
    </div>
  );
};

export default Hero;
