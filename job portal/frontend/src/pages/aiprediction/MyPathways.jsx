
// src/pages/AiLearningPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaPalette, FaFont, FaRegImage } from "react-icons/fa";
import MainLayout from "../../components/layout/MainLayout";
import { useSelector } from "react-redux";

const BASE_URL=import.meta.env.VITE_BASE_URL;

// 🔹 Helpers (same as before)
const getSkillIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes("typo") || lower.includes("font")) return <FaFont />;
  if (lower.includes("color") || lower.includes("palette")) return <FaPalette />;
  if (lower.includes("photo") || lower.includes("image") || lower.includes("figma") || lower.includes("psd")) return <FaRegImage />;
  if (lower.includes("html") || lower.includes("css") || lower.includes("js") || lower.includes("react") || lower.includes("bootstrap")) return <span className="text-xs">Aa</span>;
  return <FaEye className="text-xs" />;
};

const getDomainInitial = (domainName) => domainName ? domainName.charAt(0).toUpperCase() : "?";

// 🔹 Domain Sidebar
const DomainSidebar = ({ domains, selectedDomainId, onSelect }) => {
  const learners = "122,263 learners";
  const colors = [
    { bg: "bg-[#6EB5DD]", tag: "bg-[#4599C8]" },
    { bg: "bg-[#E8AC6E]", tag: "bg-[#C57829]" },
    { bg: "bg-[#888CE4]", tag: "bg-[#5B60CD]" },
  ];

  return (
    <div className="bg-white shadow-md flex flex-col w-[347px] h-[543px] top-[99px] ml-40 rounded-[10px] p-[20px_10px] gap-[30px] opacity-1">
      <h2 className="text-2xl font-bold text-black">Courses</h2>
      <p className="text-sm text-gray-500">Your learning path</p>
      <div className="flex flex-col gap-6 mt-4 overflow-y-auto max-h-[400px]">
        {domains.map((domain, idx) => {
          const color = colors[idx % colors.length];
          return (
            <div
              key={domain.domain_id}
              className={`${color.bg} text-white rounded-lg p-4 flex flex-col gap-3 cursor-pointer hover:opacity-90 ${selectedDomainId === domain.domain_id ? 'ring-2 ring-white' : ''}`}
              onClick={() => onSelect(domain.domain_id)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 text-xl font-bold text-white rounded-md bg-white/20">
                  {getDomainInitial(domain.domain_name)}
                </div>
                <div>
                  <h3 className="text-base font-semibold">{domain.domain_name}</h3>
                  <p className="text-xs text-gray-100">{learners}</p>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 ml-auto bg-gray-100 rounded-full">
                  <FaEye className="text-xs text-gray-600" />
                  <span className="text-[10px] text-gray-700">Skills</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`${color.tag} px-3 py-1 rounded-md text-xs`}>Lesson</span>
                <span className="px-3 py-1 text-xs text-gray-800 bg-white rounded-md">8 weeks</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 🔹 Domain Details
const DomainDetails = ({ domain, skills, masteredIds }) => {
  const [showSkills, setShowSkills] = useState(false);
  const domainSkills = skills.filter(s => s.domain_id === domain.domain_id);
  const mastered = domainSkills.filter(s => masteredIds.has(s.skill_id));
  const missing = domainSkills.filter(s => !masteredIds.has(s.skill_id));

  const colors = ["bg-[#6EB5DD]", "bg-[#E8AC6E]", "bg-[#888CE4]"];
  const color = colors[domain.domain_id % colors.length];

  return (
    <div className="flex flex-col bg-white shadow-md" style={{ width: "759px", minHeight: "903px", borderRadius: "10px", padding: "20px 24px", gap: "20px" }}>
      <div className={`${color}`} style={{ width: "681px", borderRadius: "10px", padding: "16px 20px" }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white rounded-md bg-white/20">
            {getDomainInitial(domain.domain_name)}
          </div>
          <div className="flex flex-col text-white">
            <h2 className="text-lg font-semibold">{domain.domain_name}</h2>
            <p className="text-sm">122,263 learners</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 ml-auto bg-white rounded-full cursor-pointer" onClick={() => setShowSkills(!showSkills)}>
            <FaEye className="text-sm text-gray-600" />
            <span className="text-xs text-gray-700">Skills</span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="px-3 py-1 text-xs text-gray-700 rounded-full bg-white/70">Lesson</span>
          <span className="px-3 py-1 text-xs text-gray-700 rounded-full bg-white/70">8 weeks</span>
        </div>
        {showSkills && (
          <div className="mt-3 overflow-hidden rounded-b-md">
            {mastered.map((s) => (
              <div key={s.skill_id} className="flex items-center justify-between px-4 py-2 border-b bg-white/20 border-white/30">
                <div className="flex items-center">
                  <span className="mr-2 font-medium text-white">✓</span>
                  <span>{s.name}</span>
                </div>
                <span className="text-white/80">{getSkillIcon(s.name)}</span>
              </div>
            ))}
            {missing.map((s) => (
              <div key={s.skill_id} className="flex items-center justify-between px-4 py-2 border-b bg-white/10 border-white/20">
                <span>{s.name}</span>
                <span className="text-gray-400">{getSkillIcon(s.name)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-2 font-semibold text-gray-900">Skills</h3>
        <ul className="ml-6 space-y-1 text-sm text-gray-700 list-disc">
          {mastered.map((s) => (
            <li key={s.skill_id} className="font-medium text-green-700">✓ {s.name} (Mastered)</li>
          ))}
          {missing.map((s) => (
            <li key={s.skill_id} className="text-red-700">○ {s.name} (To Learn)</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 font-semibold text-gray-900">About the course</h3>
        <p className="text-sm leading-relaxed text-gray-700">
          Our {domain.domain_name} courses teach you how to visualise an idea from a concept to impactful communications...
        </p>
        <p className="mt-2 text-sm text-gray-700">
          Get a unique classroom-like learning experience with interactive
          online sessions.
        </p>
        <p className="mt-1 text-sm text-gray-700">
          Lectures by leading faculties and dedicated mentorship by industry
          professionals from around the world.
        </p>
        <p className="mt-1 text-sm text-gray-700">
          Our programmes come with best-in-class placement support/Job
          Guarantee.
        </p>
        <p className="mt-1 text-sm text-gray-700">
          Build a network of design professionals and make lifelong
          connections.
        </p>
      </div>

      <div className="flex justify-center mt-4">
        <button className="px-8 py-2 text-white transition bg-red-500 rounded-full shadow-md hover:bg-red-600">Apply</button>
      </div>
    </div>
  );
};

// MAIN COMPONENT
const MyPathways = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {token}=useSelector((state)=> state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [selectedDomainId, setSelectedDomainId] = useState(null);



  useEffect(() => {
  const fetchData = async () => {
    try {
      const { strategy, jobId, companyIds, roleIds } = location.state || {};

      //  Redirect if no strategy
      if (!strategy || !["job", "company_role", "upskilling"].includes(strategy)) {
        console.warn("Invalid or missing strategy:", strategy);
        navigate("/ai-prediction", { replace: true });
        return;
      }

      // 🔹 Validate inputs early
      if (strategy === "job" && (!jobId || isNaN(Number(jobId)))) {
        throw new Error("Invalid job selection. Please go back and select a job.");
      }
      if (strategy === "company_role") {
        if (!Array.isArray(companyIds) || companyIds.length === 0) {
          throw new Error("No companies selected. Please select at least one company.");
        }
        if (!Array.isArray(roleIds) || roleIds.length === 0) {
          throw new Error("No job roles selected. Please select at least one role.");
        }
      }

    //  setLoading(true);
      setError(null);

      const payload = { strategy };
      if (strategy === "job") payload.jobId = Number(jobId);
      if (strategy === "company_role") {
        payload.companyIds = companyIds.map(id => Number(id));
        payload.roleIds = roleIds.map(id => Number(id));
      }

      const res = await fetch(`${BASE_URL}/recommendations/ai-prediction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Handle non-2xx
      if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
          const errData = await res.json();
          msg = errData.message || errData.error || msg;
        } catch (e) { /* use fallback msg */ }
        throw new Error(msg);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Unable to generate recommendations");
      }

      // Safe data extraction
      const result = data.data || {};
      setAiResult(result);

      // Auto-select first domain (if any)
      const domains = result.recommended?.domains || [];
      setSelectedDomainId(domains.length > 0 ? domains[0].domain_id : null);

    } catch (err) {
      console.error("[AI Learning] Fetch failed:", err);
      setError(err.message || "We couldn't generate recommendations right now. This can happen if no matching jobs or skills were found.");
      setAiResult({
        strategy: location.state?.strategy || "unknown",
        input: {},
        gap_analysis: { mastered_count: 0, missing_count: 0, mastered: [], missing: [] },
        recommended: { domains: [], skills_to_learn: [] }
      });
    }
    //  finally {
    //   setLoading(false);
    // }
  };

  fetchData();
}, [location.state, navigate, token]);

//  useEffect(() => {
//     // Set a timeout of ~7.5 seconds
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 7500); // 7500ms = 7.5 seconds

//     // Clear timeout if component unmounts
//     return () => clearTimeout(timer);
//   }, []);

  //  Loading
  // if (loading) {
  //   return (
  //     <MainLayout>
  //       <div className="flex items-center justify-center min-h-screen bg-gray-100">
  //         <div className="text-center">
  //           <div className="inline-block w-12 h-12 mb-4 border-4 border-red-500 rounded-full animate-spin border-t-transparent"></div>
  //           <p className="font-medium text-gray-700">Generating your AI skill recommendation...</p>
  //           <p className="mt-1 text-sm text-gray-500">This may take a few seconds</p>
  //         </div>
  //       </div>
  //     </MainLayout>
  //   );
  // }
 if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <div className="inline-block w-12 h-12 mb-4 border-4 border-red-500 rounded-full animate-spin border-t-transparent"></div>
            <p className="font-medium text-gray-700">Generating your AI skill recommendation...</p>
            <p className="mt-1 text-sm text-gray-500">This may take a few seconds</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  //  Render content
  const domains = Array.isArray(aiResult?.recommended?.domains)
    ? aiResult.recommended.domains
    : [];

  const skills = Array.isArray(aiResult?.recommended?.skills_to_learn)
    ? aiResult.recommended.skills_to_learn
    : [];

  const mastered = Array.isArray(aiResult?.gap_analysis?.mastered)
    ? aiResult.gap_analysis.mastered
    : [];

  const masteredIds = new Set(mastered.map(s => s.skill_id));

  const selectedDomain = selectedDomainId
    ? domains.find(d => d.domain_id === selectedDomainId)
    : domains[0] || null;

  return (
    <MainLayout>
      <div className="flex justify-center min-h-screen px-0 py-4 bg-gray-100 lg:px-4">
        {/* Sidebar */}
        <DomainSidebar
          domains={domains}
          selectedDomainId={selectedDomainId}
          onSelect={setSelectedDomainId}
        />

        {/* Main Content Area */}
        {skills.length > 0 && selectedDomain ? (
          <DomainDetails
            domain={selectedDomain}
            skills={skills}
            masteredIds={masteredIds}
          />
        ) : (
          //  Empty State (no skills, or no domain)
          <div className="bg-white shadow-md flex flex-col w-[759px] h-[903px] rounded-[10px] p-8 justify-center items-center text-center">
            <div className="mb-4 text-gray-400">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.308.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.081-.451c.071-.293.179-.351.47-.288l3.468.738c.897.194 1.319-.105 1.319-.808 0-.533-.246-.824-.533-.824-.287 0-.533.291-.533.824 0 .291.07.533.246.708l-.416.088c-.176-.195-.352-.291-.686-.291z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800">
              No Skills Recommended Yet
            </h3>
            <p className="max-w-md mb-4 text-gray-600">
              {error
                ? error
                : skills.length === 0
                  ? "We couldn’t find any skills to recommend for your selection. Try choosing a different job, company, or role."
                  : "No domain selected."}
            </p>
            <button
              onClick={() => navigate("/ai-prediction")}
              className="flex items-center gap-2 px-6 py-2 text-white bg-red-500 rounded-full hover:bg-red-600"
            >
              ← Go Back & Try Again
            </button>
            {aiResult?.strategy && (
              <p className="mt-4 text-xs text-gray-500">
                Strategy: <code className="px-1 bg-gray-100 rounded">{aiResult.strategy}</code>
              </p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyPathways;