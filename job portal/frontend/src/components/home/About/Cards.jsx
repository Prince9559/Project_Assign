import React from "react";
import smartIcon from "../../../assets/about1.png";
import insightsIcon from "../../../assets/about2.png";
import matchingIcon from "../../../assets/about3.png";
import gamifiedIcon from "../../../assets/about3.png";
import communityIcon from "../../../assets/about4.png";
import companyIcon from "../../../assets/about5.png";

export default function Cards() {
  const features = [
    {
      title: "Smart Profiles",
      img: smartIcon,
      color: "#0090F3", // Blue
      desc: "Build A Dynamic Student Profile That Goes Beyond A Resume, Add Certificates, Tag Skills, And Show Proof Of Real Achievements. Get Discovered For Who You Are And What You Bring.",
    },
    {
      title: "AI Career Insights",
      img: insightsIcon,
      color: "#FF4D79", // Pink
      desc: "Set Your Career Preferences — Roles, Skills, Salary Expectations — And Let Our AI Guide You With Step-by-Step Growth Pathways. Like Having A Personal Career Coach In Your Pocket.",
    },
    {
      title: "Precision Job Matching",
      img: matchingIcon,
      color: "#F7A400", // Yellow/Orange
      desc: "Apply To Opportunities That Truly Fit You. From Dream Companies To Niche Projects, Our Smart Matching Filters Ensure Your Effort Is Focused Where It Matters.",
    },
    {
      title: "Gamified Career Progression",
      img: gamifiedIcon,
      color: "#FFC300", // Gold
      desc: "Level Up Your Future Like A Game. Our AI Shows You Which Sub-Skills To Learn, What Jobs Will Grow Your Profile, And How To Hit Each Career Milestone — Step By Step.",
    },
    {
      title: "Engaged Community",
      img: communityIcon,
      color: "#37C978", // Green
      desc: "Post Achievements, Share Milestones, Or Ask For Advice. Connect With Peers, Companies, And Universities In An Interactive Career Network Built For Collaboration.",
    },
    {
      title: "For Companies & Campuses",
      img: companyIcon,
      color: "#8E44AD", // Purple
      desc: "Employers Can Post, Filter, Hire, And Even Gamify Learning For Candidates. Universities Get Complete Control, Verification Tools, And A Social Ecosystem To Engage Students.",
    },
  ];

  return (
    <div className="w-full py-16 px-6 bg-white flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl w-full">

        {features.map((item, index) => (
          <div
            key={index}
            className="rounded-3xl p-6 shadow-md bg-white flex flex-col items-center text-center 
            transition-all duration-300 hover:scale-105"
          >
            <img
              src={item.img}
              className="w-40 h-40 object-contain mb-4"
              alt={item.title}
            />

            {/* Dynamic Title Color */}
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: item.color }}
            >
              {item.title}
            </h3>

            <p className="text-gray-500 leading-relaxed text-sm">
              {item.desc}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
}
