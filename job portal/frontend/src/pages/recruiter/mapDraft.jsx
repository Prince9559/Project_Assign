export const mapDraftToFormValues = (draftData = {}) => {
  //  Optional: add console.log to debug mismatches
  console.log("[mapDraft] Raw draftData:", draftData);

  // Helper: ensure string (for text inputs — null/undefined → "")
  const safeStr = (val) => (val == null ? "" : String(val).trim());

  // Helper: ensure number (for number inputs — NaN/null/undefined → null)
  const safeNum = (val) => {
    const n = Number(val);
    return isNaN(n) ? null : n;
  };

  // Helper: ensure boolean
  const safeBool = (val) => Boolean(val);

  // Helper: parse & normalize YYYY-MM-DD (from Date, string, ISO)
  const parseDate = (val) => {
    if (!val) return "";
    const d = new Date(val);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0]; // "2025-11-14"
  };

  // Helper: normalize ID arrays — numbers only
  const toIdArray = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((id) => safeNum(id))
      .filter((id) => id !== null);

  // Helper: normalize string arrays (for perks, custom names)
  const toStrArray = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((s) => safeStr(s))
      .filter((s) => s !== "");

  // Helper: for "Other" fallbacks (e.g., if job_role_id is null, use other_job_role)
  const getOther = (mainId, fallbackStr) =>
    mainId == null ? safeStr(fallbackStr) : "";

  // --- Now map --- //
  const values = {
    // Opportunity type — normalize case
    opportunity_type: (() => {
      const t = safeStr(draftData.opportunity_type).toLowerCase();
      if (t === "job") return "Job";
      if (t === "project") return "Project";
      return "Internship"; // default
    })(),

    //  job_status: only include if your form actually uses it.
    // If not, REMOVE it — stale keys can interfere with form lib (e.g., react-hook-form).
    // job_status: true,

    //  Job Role
    job_role_id: draftData.job_role_id,
    other_job_role: getOther(draftData.job_role_id, draftData.other_job_role),

    //  Skills
    skill_ids: toIdArray(draftData.skill_ids),
    other_skills: (Array.isArray(draftData.other_skills)
      ? draftData.other_skills
      : []
    )
      .map((s) => ({
        domain: safeStr(s?.domain),
        skill: safeStr(s?.skill),
      }))
      .filter((s) => s.domain && s.skill),

    //  Locations
    eligiblecity_ids: toIdArray(draftData.eligiblecity_ids),
    other_eligible_city_names: toStrArray(draftData.other_eligible_city_names),

    //  Colleges
    eligiblecollege_ids: toIdArray(draftData.eligiblecollege_ids),
    other_eligible_college_names: toStrArray(draftData.other_eligible_college_names),

    //  Courses
    eligiblecourse_ids: toIdArray(draftData.eligiblecourse_ids),
    other_eligible_course_names: toStrArray(draftData.other_eligible_course_names),

    //  Duration
    duration_id: safeNum(draftData.duration_id),
    other_duration: getOther(draftData.duration_id, draftData.other_duration),

    //  Work Setup
    job_type: ["In office", "Hybrid", "Remote"].includes(draftData.job_type)
      ? draftData.job_type
      : "In office",
    job_time: ["Day Shift", "Night Shift", "Part-time"].includes(draftData.job_time)
      ? draftData.job_time
      : "Day Shift",
    days_in_office: safeNum(draftData.days_in_office),

    //  Numbers & Strings (ensure strings for inputs!)
    number_of_openings: draftData.number_of_openings,
    job_description: draftData.job_description,
    candidate_preferences: safeStr(draftData.candidate_preferences),
    women_preferred: safeBool(draftData.women_preferred),

    //  Stipend
    stipend_type: safeStr(draftData.stipend_type) || (
      values.opportunity_type === "Internship" ? "Paid" : "Fixed"
    ),
    stipend_min: safeNum(draftData.stipend_min),
    stipend_max: safeNum(draftData.stipend_max),
    incentive_per_year: safeStr(draftData.incentive_per_year),

    //  Perks (string[])
    perks: toStrArray(draftData.perks),

    //  Screening questions → single string with \n (for <textarea>)
    screening_questions: (() => {
      const q = draftData.screening_questions;
      if (Array.isArray(q)) return q.map(safeStr).join("\n");
      return safeStr(q);
    })(),

    //  Contact
    phone_contact: safeStr(draftData.phone_contact),
    alternate_phone_number: safeStr(draftData.alternate_phone_number),

    //  Dates — MUST be "YYYY-MM-DD"
    is_custom_internship_date: safeBool(draftData.is_custom_internship_date),
    internship_start_date: parseDate(draftData.internship_start_date),
    internship_from_date: parseDate(draftData.internship_from_date),
    internship_to_date: parseDate(draftData.internship_to_date),

    //  Matching
    minSkillMatchRequired: safeNum(draftData.minSkillMatchRequired),
  };

  // Optional: log final mapped values
  console.log("final [mapDraft] Mapped form values:", values);

  return values;
};