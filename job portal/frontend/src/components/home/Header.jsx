export default function Header() {
  return (
    <section className="relative w-full  overflow-hidden bg-white pt-24 pb-20 flex items-center">


      {/* BACKGROUND GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-200/60 via-yellow-100/40 to-white pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10 flex flex-col md:flex-row items-center justify-between">

        {/* LEFT CONTENT */}
        <div className="max-w-xl space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#002060] leading-tight">
            Where Talent Meets  
            <span className="italic font-bold text-[#002060]"> Opportunity...</span>
          </h1>



          <p className="text-gray-600 text-lg leading-relaxed">
            Connect With Top Employers, Discover Your Dream Job,  
            And Build Your Career With India’s Fastest-Growing Job Portal.
          </p>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-2">
            <button className="bg-[#002060] text-white px-6 py-2 rounded-md font-medium text-sm hover:bg-[#001644] transition">
              Find Jobs
            </button>

            <button className="border border-[#002060] text-[#002060] px-6 py-2 rounded-md font-medium text-sm hover:bg-[#002060] hover:text-white transition">
              Hire Talent
            </button>

            <button className="text-[#002060] font-medium text-sm flex items-center gap-1">
              Register Now →
            </button>
          </div>
        </div>

        {/* RIGHT IMAGES CLUSTER */}
        <div className="relative mt-16 md:mt-0">
          
          {/* Background blob */}
          <div className="absolute inset-0 bg-yellow-200/60 rounded-full blur-2xl scale-125 -z-10"></div>

          {/* IMAGES GROUP */}
          <div className="relative w-[380px] h-[300px]">

            {/* Big Circle Image */}
            <div className="absolute top-10 left-16 w-32 h-32 rounded-full overflow-hidden border-[6px] border-yellow-300 shadow-xl">
              <img
                src="https://i.pravatar.cc/300?img=11"
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Small 1 */}
            <div className="absolute top-0 right-6 w-16 h-16 rounded-full overflow-hidden border-[4px] border-yellow-300 shadow-lg">
              <img
                src="https://i.pravatar.cc/150?img=22"
                className="w-full h-full object-cover"
                alt=""
              />
            </div>

            {/* Small 2 */}
            <div className="absolute top-40 right-0 w-16 h-16 rounded-full overflow-hidden border-[4px] border-yellow-300 shadow-lg">
              <img
                src="https://i.pravatar.cc/150?img=33"
                className="w-full h-full object-cover"
                alt=""
              />
            </div>

            {/* Small 3 */}
            <div className="absolute bottom-2 left-6 w-16 h-16 rounded-full overflow-hidden border-[4px] border-yellow-300 shadow-lg">
              <img
                src="https://i.pravatar.cc/150?img=44"
                className="w-full h-full object-cover"
                alt=""
              />
            </div>

            {/* Small 4 */}
            <div className="absolute bottom-4 right-24 w-14 h-14 rounded-full overflow-hidden border-[4px] border-yellow-300 shadow-lg">
              <img
                src="https://i.pravatar.cc/150?img=55"
                className="w-full h-full object-cover"
                alt=""
              />
            </div>

            {/* Dotted Shapes */}
            <div className="absolute top-6 left-8 w-40 h-40 border-2 border-yellow-400 border-dashed rounded-full opacity-70"></div>
            <div className="absolute bottom-6 right-6 w-32 h-32 border-2 border-yellow-400 border-dashed rounded-full opacity-70"></div>

          </div>

        </div>

      </div>
    </section>
  );
}
