import React from "react";
import Uber from "../../assets/uber.png";
import Total from "../../assets/ux.png";
import GitLab from "../../assets/web.png";
import PayPal from "../../assets/graphic.png";
import HiringStatusBadge from "../../components/jobs/HiringStatusBadge";
const LOGOS = {
  Uber: Uber,
  Total: Total,
  GitLab: GitLab,
  PayPal: PayPal,
};


const DATA = [
  {
    category: "Jobs",
    items: [
      {
        title: "Digital Marketing Executive",
        company: "Uber",
        location: "Mumbai",
        exp: "1-2 years",
        salary: "INR 3,00,000",
        posted: "2 weeks ago",
        hiring: true,
        match: "92%",
        color: "bg-gradient-to-tr from-pink-400 to-rose-300",
        skillsMissing: false,
      },
      {
        title: "UX Designer",
        company: "Total",
        location: "Delhi",
        exp: "1-2 years",
        salary: "INR 6,00,000",
        posted: "2 weeks ago",
        hiring: true,
        match: "88%",
        color: "bg-gradient-to-tr from-sky-500 to-indigo-300",
        skillsMissing: false,
      },
      {
        title: "Web Development",
        company: "GitLab",
        location: "Hybrid",
        exp: "3 years",
        salary: "INR 9,00,000",
        posted: "2 weeks ago",
        hiring: true,
        match: "63%",
        color: "bg-yellow-400",
        skillsMissing: true,
      },
    ],
  },

  {
    category: "Internships",
    items: [
      {
        title: "UX Designer",
        company: "Total",
        location: "Delhi",
        exp: "1-2 years",
        salary: "INR 6,00,000",
        posted: "2 weeks ago",
        hiring: true,
        match: "88%",
        color: "bg-sky-500",
        skillsMissing: false,
      },
      {
        title: "Digital Marketing Executive",
        company: "Uber",
        location: "Mumbai",
        exp: "1-2 years",
        salary: "INR 3,00,000",
        posted: "2 weeks ago",
        hiring: true,
        match: "92%",
        color: "bg-pink-400",
        skillsMissing: false,
      },
      {
        title: "Graphic Designer",
        company: "PayPal",
        location: "Mumbai",
        exp: "1-2 years",
        salary: "INR 4,50,000",
        posted: "2 weeks ago",
        hiring: true,
        match: "58%",
        color: "bg-indigo-400",
        skillsMissing: true,
      },
    ],
  },

  {
    category: "Projects",
    items: [
      {
        title: "Web Development",
        company: "GitLab",
        location: "Hybrid",
        exp: "3 years",
        salary: "INR 9,00,000",
        posted: "2 weeks ago",
        hiring: true,
        match: "63%",
        color: "bg-yellow-400",
        skillsMissing: true,
      },
      {
        title: "UX Designer",
        company: "Total",
        location: "Delhi",
        exp: "1-2 years",
        salary: "INR 6,00,000",
        posted: "2 weeks ago",
        hiring: true,
        match: "88%",
        color: "bg-sky-500",
        skillsMissing: false,
      },
      {
        title: "Graphic Designer",
        company: "PayPal",
        location: "Mumbai",
        exp: "1-2 years",
        salary: "INR 4,50,000",
        posted: "2 weeks ago",
        hiring: true,
        match: "58%",
        color: "bg-indigo-400",
        skillsMissing: true,
      },
    ],
  },
];

export default function Opportunities() {
  return (
    <section className="w-full bg-gray-50 py-12">
      {/* Outer yellow rounded frame */}
      <div className="mx-6 md:mx-10 lg:mx-16 border-4 border-yellow-400 rounded-[28px] p-8 md:p-12 bg-white">
        
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-[#072b60]">
            Explore Opportunities
          </h2>
          <p className="text-[#6b7a99] mt-3 max-w-3xl mx-auto">
            Discover jobs, internships, and projects tailored to your skills and career goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DATA.map((col) => (
            <div key={col.category} className="space-y-6">

              {/* Column Header */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-2xl font-bold text-[#072b60]">{col.category}</h3>
                <p className="text-gray-500 text-m mt-2">
                  Start applying to the latest job vacancies at the leading companies in India below.
                </p>
              </div>

              {/* Each job card */}
              <div className="space-y-4">
                {col.items.map((job, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">

                    {/* TOP ROW */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">

                        {/* --- LOGO instead of initials --- */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white border">
                          <img
                            src={LOGOS[job.company]}
                            alt={job.company}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        {/* -------------------------------- */}

                        {/* Title + Company */}
                        <div>
                          <p className="font-bold text-[#072b60] text-lg">{job.title}</p>
                          <p className="text-gray-500 mt-2 text-lg">{job.company}</p>
                        </div>
                      </div>

                      {/* Right badges */}
                      <div className="flex flex-col items-end gap-2">
                        {job.hiring && (
                          <span className="text-[11px] bg-[#F03729] text-white px-5 py-1 rounded-full">
                            Actively hiring
                          </span>
                          
//                           <span className="text-[11px] bg-[#1DB32F] text-white px-5 py-1 rounded-full">
//   Actively hiring
// </span>
                        )}
                        <span className="text-[11px] bg-gray-50 text-gray-600 px-5 py-1 rounded-full border">
                          {job.posted}
                        </span>
                        <span
                          className={`text-[11px] px-5 py-1 rounded-full ${
                            parseInt(job.match) > 80
                              ? "bg-[#1DB32F] text-white"
                              : "bg-[#FFA322] text-white"
                          }`}
                        >
                          {job.match} match
                        </span>
                      </div>
                    </div>

                    {job.skillsMissing && (
                      <div className="mt-3">
                        <span className="text-[12px] inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                          Skills missing?
                        </span>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                      <span className="text-s bg-gray-100 px-5 py-3 rounded-full text-gray-700">
                        {job.location}
                      </span>
                      <span className="text-s bg-gray-100 px-5 py-3 rounded-full text-gray-700">
                        {job.exp}
                      </span>
                      <span className="text-s bg-gray-100 px-5 py-3 rounded-full text-gray-700">
                        {job.salary}
                      </span>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
