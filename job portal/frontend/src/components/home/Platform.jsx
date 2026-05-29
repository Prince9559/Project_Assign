import React from "react";

export default function Platform() {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-white">

      {/* Why Choose Section */}
      <div className="w-full px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-2">
          Why Choose our Platform?
        </h2>
        <p className="text-center text-gray-600 mb-10">
          Everything you need to accelerate your career or find the perfect talent.
        </p>

        {/* Full-Width Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-blue-300 rounded-xl p-6 shadow-sm hover:shadow-md transition bg-white w-full"
            >
              <div className="text-xl text-[#032466] mb-2">Icon</div>
              <h3 className="text-2xl text-[#032466] ">Smart Job Matching</h3>
              <p className="text-[#032466] mt-2 text-m">
                AI-powered recommendations that connect you with the most
                relevant opportunities based on your skills and preferences.
              </p>
              <button className="mt-4 text-[#032466] text-lg font-medium flex items-center gap-1">
                Learn more →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trusted Section */}
      <div className="w-full bg-gradient-to-b from-white to-orange-50 py-16 px-6 flex flex-col items-center">
        <h2 className="text-3xl text-[#032466] font-bold text-center mb-2">
          Trusted by Leading Companies and Universities
        </h2>
        <p className="text-center text-[#03246673] mb-12">
          Join the network of top employers and educational institutions.
        </p>

        {/* Full-Width Stats Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 text-center">
          
          <div>
            <h3 className="text-3xl font-extrabold text-red-600">500K+</h3>
            <p className="font-semibold">Active Job Seekers</p>
            <p className="text-gray-600 text-sm mt-1">
              Job seekers actively using our platform.
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-extrabold text-red-600">10K+</h3>
            <p className="font-semibold">Partner Companies</p>
            <p className="text-gray-600 text-sm mt-1">
              Companies partnering with us.
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-extrabold text-red-600">50K+</h3>
            <p className="font-semibold">Jobs Posted Monthly</p>
            <p className="text-gray-600 text-sm mt-1">
              Fresh job listings every month.
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-extrabold text-red-600">95%</h3>
            <p className="font-semibold">Success Rate</p>
            <p className="text-gray-600 text-sm mt-1">
              High success in job matching.
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-extrabold text-red-600">24/7</h3>
            <p className="font-semibold">Support</p>
            <p className="text-gray-600 text-sm mt-1">
              Dedicated team to assist you anytime.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
