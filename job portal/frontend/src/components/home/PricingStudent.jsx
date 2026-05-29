import React from "react";
import { Check } from "lucide-react";

const PricingStudent = () => {
  return (
    <div className="w-full bg-[#D1E7FF] py-16 flex flex-col items-center">
      {/* Heading */}
      <h2 className="text-4xl font-bold text-[#003366] mb-2">
        Pricing Plans for Students
      </h2>
      <h4 className="text-lg text-gray-600 mb-10">
        Here are some custom made plans for students...
      </h4>

      {/* Cards container */}
      <div className="flex flex-col md:flex-row gap-10">
        
        {/* Free Plan */}
        <div className="bg-white w-[320px] rounded-2xl shadow-md overflow-hidden">
          <div className="bg-[#FFD8DA] py-3 px-6">
            <h5 className="text-[#FF5756] font-bold text-xl">Free Plan</h5>
          </div>

          <div className="px-6 py-6 space-y-3">
            <p className="flex items-center gap-2 text-gray-700">
              <Check className="text-green-600" size={20} />
              Profile Creation
            </p>

            <p className="flex items-center gap-2 text-gray-700">
              <Check className="text-green-600" size={20} />
              Job/Internship Access
            </p>

            <p className="flex items-center gap-2 text-gray-700">
              <Check className="text-green-600" size={20} />
              Resume Builder
            </p>

            <h1 className="text-[#FF5756] font-bold text-4xl mt-4">₹0</h1>

            <button className="bg-[#FF5756] w-full py-3 rounded-lg text-white font-semibold mt-3">
              Explore now
            </button>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-white w-[320px] rounded-2xl shadow-md overflow-hidden border-2 border-[#DFDAF8]">
          <div className="bg-[#DFDAF8] py-3 px-6">
            <h5 className="text-[#863390] font-bold text-xl">Pro Plan</h5>
          </div>

          <div className="px-6 py-6 space-y-3">
            <p className="flex items-center gap-2 text-gray-700">
              <Check className="text-green-600" size={20} />
              AI Career Report
            </p>

            <p className="flex items-center gap-2 text-gray-700">
              <Check className="text-green-600" size={20} />
              Profile Boost To Employers
            </p>

            <p className="flex items-center gap-2 text-gray-700">
              <Check className="text-green-600" size={20} />
              Mock Interviews + Career Coaching
            </p>

            <h1 className="text-[#863390] font-bold text-4xl mt-4">
              ₹499/Year
            </h1>

            <button className="bg-[#863390] w-full py-3 rounded-lg text-white font-semibold mt-3">
              Explore now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingStudent;
