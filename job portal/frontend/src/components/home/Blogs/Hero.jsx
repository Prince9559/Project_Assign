export default function Hero() {
  return (
    <section className="w-full bg-white py-10 flex justify-center">
      <div className="w-full max-w-[1750px] border border-blue-400 p-6 rounded-md">

        {/* Heading */}
        <h2 className="text-center text-3xl font-bold text-[#002060]">Blogs</h2>
        <p className="text-center text-gray-600 mt-1">
          Our expert advisors can help you find the right solution for you.
        </p>

        {/* Search Bar */}
        <div className="w-full mt-6 border border-gray-300 rounded-lg px-3 py-2 flex justify-between">
          <input
            type="text"
            placeholder="Search"
            className="w-full outline-none text-gray-600"
          />
          <span className="text-gray-500 text-sm">🔍</span>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">

          {/* CARD 1 */}
          <div className="border border-gray-300 rounded-md p-4 shadow-sm">
            <div className="rounded-md h-32 w-full bg-purple-300"></div>

            <h3 className="text-lg font-semibold text-[#002060] mt-4">
              Smart Job Matching
            </h3>

            <p className="text-gray-600 text-sm mt-2">
              AI-powered recommendations that connect you with the most relevant opportunities based on your skills and preferences.
            </p>

            <button className="text-[#002060] text-sm font-semibold mt-4 flex items-center">
              Know more →
            </button>
          </div>

          {/* CARD 2 */}
          <div className="border border-gray-300 rounded-md p-4 shadow-sm">
            <div className="rounded-md h-32 w-full bg-yellow-400"></div>

            <h3 className="text-lg font-semibold text-[#002060] mt-4">
              Smart Job Matching
            </h3>

            <p className="text-gray-600 text-sm mt-2">
              AI-powered recommendations that connect you with the most relevant opportunities based on your skills and preferences.
            </p>

            <button className="text-[#002060] text-sm font-semibold mt-4 flex items-center">
              Know more →
            </button>
          </div>

          {/* CARD 3 */}
          <div className="border border-gray-300 rounded-md p-4 shadow-sm">
            <div className="rounded-md h-32 w-full bg-sky-300"></div>

            <h3 className="text-lg font-semibold text-[#002060] mt-4">
              Smart Job Matching
            </h3>

            <p className="text-gray-600 text-sm mt-2">
              AI-powered recommendations that connect you with the most relevant opportunities based on your skills and preferences.
            </p>

            <button className="text-[#002060] text-sm font-semibold mt-4 flex items-center">
              Know more →
            </button>
          </div>

          {/* CARD 4 */}
          <div className="border border-gray-300 rounded-md p-4 shadow-sm">
            <div className="rounded-md h-32 w-full bg-yellow-400"></div>

            <h3 className="text-lg font-semibold text-[#002060] mt-4">
              Smart Job Matching
            </h3>

            <p className="text-gray-600 text-sm mt-2">
              AI-powered recommendations that connect you with the most relevant opportunities based on your skills and preferences.
            </p>

            <button className="text-[#002060] text-sm font-semibold mt-4 flex items-center">
              Know more →
            </button>
          </div>

          {/* CARD 5 */}
          <div className="border border-gray-300 rounded-md p-4 shadow-sm">
            <div className="rounded-md h-32 w-full bg-sky-300"></div>

            <h3 className="text-lg font-semibold text-[#002060] mt-4">
              Smart Job Matching
            </h3>

            <p className="text-gray-600 text-sm mt-2">
              AI-powered recommendations that connect you with the most relevant opportunities based on your skills and preferences.
            </p>

            <button className="text-[#002060] text-sm font-semibold mt-4 flex items-center">
              Know more →
            </button>
          </div>

          {/* CARD 6 */}
          <div className="border border-gray-300 rounded-md p-4 shadow-sm">
            <div className="rounded-md h-32 w-full bg-purple-300"></div>

            <h3 className="text-lg font-semibold text-[#002060] mt-4">
              Smart Job Matching
            </h3>

            <p className="text-gray-600 text-sm mt-2">
              AI-powered recommendations that connect you with the most relevant opportunities based on your skills and preferences.
            </p>

            <button className="text-[#002060] text-sm font-semibold mt-4 flex items-center">
              Know more →
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
