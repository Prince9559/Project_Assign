import React from "react";

const StudentHeader = () => {
  return (
    <div className="w-full min-h-60 bg-white flex flex-col items-center justify-center px-10 text-center bg-gradient-to-b from-[#D1E7FF]/70 via-transparent to-[#FFE29F]  blur-s pointer-events-none">

      {/* Headings */}
      <h3 className="text-4xl md:text-5xl font-bold text-[#032466] mb-3">
        Unlock Your True Potential
      </h3>

      <h5 className="text-lg md:text-xl text-gray-700">
        From Resume to Recruitment — Your Career Journey Starts Here.
      </h5>

      <h5 className="text-lg md:text-xl text-gray-700 mb-8">
        📚 Learn • 🧠 Upskill • 👨‍💻 Get Hired
      </h5>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-3">
        <button className="bg-[#032466] text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#021a47] transition">
          Register As Student
        </button>

        <button className="border-2 border-[#032466] text-[#032466] font-semibold px-6 py-3 rounded-lg hover:bg-[#032466] hover:text-white transition">
          Explore Opportunities
        </button>
      </div>
    </div>
  );
};

export default StudentHeader;
