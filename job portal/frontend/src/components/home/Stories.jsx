import React from "react";
import story from "../../assets/story.png";

export default function Stories() {
  return (
    <div className="w-full py-16 bg-gradient-to-r from-orange-50 to-blue-50">

      {/* Heading */}
      <div className="text-center px-4">
        <h2 className="text-4xl font-semibold">Success Stories</h2>
        <p className="text-[#03246673] mt-1 mb-12">
          Hear what students say about us
        </p>
      </div>

      {/* Slider Wrapper Full Width */}
      <div className="relative w-full flex items-center justify-center px-0">

        {/* Left Arrow (Touching Left Edge) */}
      <button
  className="
    absolute top-1/2 -translate-y-1/2
    left-0
    w-40 h-60               
    bg-blue-600
    flex items-center justify-center
    rounded-r-full         
    text-5xl font-bold text-white   
    hover:bg-blue-700
    transition
    z-20
  "
>
  ‹
</button>


        {/* Card */}
        <div className="bg-blue-900 text-white p-8 rounded-2xl w-[90%] sm:w-[70%] lg:w-[55%] relative shadow-lg mx-auto">

          {/* Quotes */}
          <div className="absolute -left-10 -top-6 text-blue-300 text-8xl select-none">“</div>
          <div className="absolute -right-10 -bottom-6 text-blue-300 text-8xl select-none">”</div>

          {/* User Info */}
          <div className="flex items-center gap-4 mb-4">
            <img
              src={story}
              className="w-14 h-14 object-cover border-2 border-white rounded-full"
              alt="User"
            />
            <div>
              <h3 className="font-semibold text-xl">Chris Hughes</h3>
              <p className="text-blue-200 text-m">Designation</p>
            </div>
          </div>

          {/* Review Text */}
          <p className="text-blue-100 text-xl leading-relaxed py-8 px-5">
            I love this platform, it helped me get my dream job as a product
            manager in Google. AI prediction is such a game changer for a
            student's career.
          </p>
        </div>

        {/* Right Arrow (Touching Right Edge) */}
        <button
          className="
            absolute top-1/2 -translate-y-1/2
            right-0
            w-40 h-60
            bg-yellow-400
            flex items-center justify-center
            rounded-l-full
            text-3xl font-bold
            hover:bg-yellow-500
            transition
            z-20
          "
        >
          ›
        </button>

      </div>
    </div>
  );
}
