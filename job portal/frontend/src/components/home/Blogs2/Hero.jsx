export default function Hero() {
  return (
    <section className="w-full bg-white py-10 flex justify-center">
      <div className="w-full max-w-[1500px] px-6">

        {/* Title */}
        <h2 className="text-center text-3xl font-bold text-[#002060]">Blogs</h2>
        <p className="text-center text-gray-600 mt-1">
          Our expert advisors can help you find the right solution for you.
        </p>

        {/* Search Bar */}
        <div className="w-full mt-6 border border-gray-300 rounded-full px-4 py-2 flex justify-between">
          <input
            type="text"
            placeholder="Search"
            className="w-full outline-none text-gray-600"
          />
          <span className="text-gray-500 text-sm">🔍</span>
        </div>

        {/* GRID: LEFT LARGE + RIGHT 2 SMALL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">

          {/* LEFT — LARGE FEATURED BLOG CARD */}
          <div className="border border-blue-300 rounded-lg p-4 shadow-sm col-span-2">
            
            {/* Large Image */}
            <div className="rounded-md bg-yellow-400 h-64 w-full"></div>

            {/* Blog Text */}
            <h3 className="text-2xl font-bold text-[#002060] mt-4">Blogs</h3>

            <p className="text-gray-600 text-sm mt-2">
              content for the blog
            </p>

            <button className="text-[#002060] text-sm font-semibold mt-4 flex items-center">
              Know more →
            </button>
          </div>

          {/* RIGHT SIDE — TWO SMALL CARDS */}
          <div className="flex flex-col gap-6">

            {/* CARD 1 */}
            <div className="border border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="rounded-md bg-purple-300 h-28 w-full"></div>

              <h3 className="text-lg font-semibold text-[#002060] mt-4">
                Smart Job Matching
              </h3>

              <p className="text-gray-600 text-sm mt-2">
                AI-powered recommendations that connect you with the most relevant opportunities based
                on your skills and preferences.
              </p>

              <button className="text-[#002060] text-sm font-semibold mt-4 flex items-center">
                Know more →
              </button>
            </div>

            {/* CARD 2 */}
            <div className="border border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="rounded-md bg-sky-300 h-28 w-full"></div>

              <h3 className="text-lg font-semibold text-[#002060] mt-4">
                Smart Job Matching
              </h3>

              <p className="text-gray-600 text-sm mt-2">
                AI-powered recommendations that connect you with the most relevant opportunities based
                on your skills and preferences.
              </p>

              <button className="text-[#002060] text-sm font-semibold mt-4 flex items-center">
                Know more →
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
