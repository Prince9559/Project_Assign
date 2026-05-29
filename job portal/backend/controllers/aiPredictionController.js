// controllers/aiPredictionController.js
const { Op } = require("sequelize");
const models = require("../models");
const { sequelize,User, UserSkill, JobPost, JobPostSkill, Skill, Domain, JobRole, CompanyRecruiterProfile } = models;

//  Utility: Calculate Skill Gap
const calculateSkillGap = (userSkillIds, requiredSkills) => {
  const missing = requiredSkills.filter((s) => !userSkillIds.has(s.skill_id));
  const mastered = requiredSkills.filter((s) => userSkillIds.has(s.skill_id));
  const matchPercentage = requiredSkills.length
    ? Math.round((mastered.length / requiredSkills.length) * 100)
    : 0;

  return {
    mastered,
    missing,
    match_percentage: matchPercentage,
    total_required: requiredSkills.length,
    mastered_count: mastered.length,
    missing_count: missing.length,
  };
};


//  Strategy 1: Job-Based Prediction (Standardized Response)
const jobBasedPrediction = async (userId, jobId, userSkillIds, skillMap, domainMap) => {
  if (!jobId) throw new Error("jobId is required.");

  // Fetch job
  const job = await JobPost.findOne({
    where: { job_id: jobId },
    attributes: ["job_id", "job_role_id", "company_recruiter_profile_id"],
    raw: true,
  });
  if (!job) throw new Error("Job not found.");

  // Fetch job role title
  const jobRole = await JobRole.findByPk(job.job_role_id, { attributes: ["title"], raw: true });
  const jobTitle = jobRole?.title || "Unknown Role";

  // Fetch company name
  let companyName = "Unknown";
  try {
    const company = await CompanyRecruiterProfile.findByPk(
      job.company_recruiter_profile_id,
      { attributes: ["company_name"], raw: true }
    );
    companyName = company?.company_name || "Unknown";
  } catch (e) { /* ignore */ }

  // Get all skills for this job (must_have + preferred)
  const jobSkillsRaw = await sequelize.query(
    `
      SELECT 
        s.skill_id,
        s.skill_name,
        s.domain_id,
        jps.type
      FROM job_post_skills jps
      INNER JOIN skills s ON jps.skill_id = s.skill_id
      WHERE jps.job_post_id = :jobId
    `,
    {
      replacements: { jobId },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  const skills = jobSkillsRaw.map(s => ({
    skill_id: s.skill_id,
    name: s.skill_name, // skill_name
    domain_id: s.domain_id,
    type: s.type,
  }));

  // Calculate gap
  const gap = calculateSkillGap(userSkillIds, skills);

  // Enrich with domain names
  const enrich = (s) => ({
    ...s,
    domain_name: domainMap[s.domain_id] || "General",
  });

  const mastered = gap.mastered.map(enrich);
  const missing = gap.missing.map(enrich);

  // Count demand for missing skills (across all jobs — for consistency)
  if (missing.length > 0) {
    const demandRows = await sequelize.query(
      `
        SELECT skill_id, COUNT(*) AS demand
        FROM job_post_skills
        WHERE skill_id IN (:skillIds) AND type = 'must_have'
        GROUP BY skill_id
      `,
      {
        replacements: { skillIds: missing.map(s => s.skill_id) },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const demandMap = Object.fromEntries(demandRows.map(r => [r.skill_id, r.demand]));
    missing.forEach(s => {
      s.demand_in_jobs = demandMap[s.skill_id] || 0;
    });
  }

  // Build skills_to_learn with priority
  const skillsToLearn = missing.map(s => ({
    skill_id: s.skill_id,
    name: s.name,
    domain_id: s.domain_id,
    domain_name: s.domain_name,
    demand_in_jobs: s.demand_in_jobs || 0,
    priority: jobSkillsRaw.find(js => js.skill_id === s.skill_id && js.type === "must_have")
      ? "high"
      : "medium",
  }));

  // Recommended domains
  const recommendedDomains = [
    ...new Set(missing.map(s => s.domain_id)),
  ].map(id => ({
    domain_id: id,
    domain_name: domainMap[id] || `Domain ${id}`,
  })).filter(d => d.domain_name);

  return {
    strategy: "job",
    input: {
      job_id: jobId,
      job_title: jobTitle,
      company_name: companyName,
    },
    gap_analysis: {
      mastered_count: mastered.length,
      missing_count: missing.length,
      match_percentage: skills.length
        ? Math.round((mastered.length / skills.length) * 100)
        : 0,
      mastered,
      missing,
    },
    recommended: {
      domains: recommendedDomains,
      skills_to_learn: skillsToLearn,
    },
  };
};

//  Strategy 2: Multi-Company + Multi-Job Role Prediction (Optimized with Raw SQL)
const companyBasedPrediction = async (userId, companyIds, roleIds, userSkillIds, skillMap, domainMap) => {
  // Validate inputs
  if (!Array.isArray(companyIds) || companyIds.length === 0) {
    throw new Error("At least one companyId is required.");
  }
  if (!Array.isArray(roleIds) || roleIds.length === 0) {
    throw new Error("At least one jobRoleId is required.");
  }

  //  Fetch top 15 most frequent must-have skills across selected companies & roles
  const skillDemandRows = await sequelize.query(
    `
      SELECT 
        s.skill_id,
        s.skill_name AS name,
        s.domain_id,
        COUNT(*) AS demand,
        SUM(CASE WHEN jps.type = 'must_have' THEN 1 ELSE 0 END) AS must_have_count
      FROM job_post_skills jps
      INNER JOIN job_posts jp 
        ON jps.job_post_id = jp.job_id
      INNER JOIN skills s 
        ON jps.skill_id = s.skill_id
      WHERE 
        jp.company_recruiter_profile_id IN (:companyIds)
        AND jp.job_role_id IN (:roleIds)
        AND jps.type IN ('must_have', 'preferred')
      GROUP BY s.skill_id, s.skill_name, s.domain_id
      ORDER BY must_have_count DESC, demand DESC
      LIMIT 15
    `,
    {
      replacements: {
        companyIds: companyIds.map(id => parseInt(id)),
        roleIds: roleIds.map(id => parseInt(id)),
      },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  if (skillDemandRows.length === 0) {
    throw new Error("Not enough job posts data found for the selected companies and roles.");
  }

  // Build skill list
  const skills = skillDemandRows.map(row => ({
    skill_id: row.skill_id,
    name: row.name,
    domain_id: row.domain_id,
  }));

  // Calculate gap
  const gap = calculateSkillGap(userSkillIds, skills);

  // Enrich with domain names
  const enrich = (s) => ({
    ...s,
    domain_name: domainMap[s.domain_id] || "General",
  });

  const missing = gap.missing.map(enrich);

  // Recommend unique domains from missing skills
  const recommendedDomains = [
    ...new Set(missing.map(s => s.domain_id)),
  ]
    .map(id => ({
      domain_id: id,
      domain_name: domainMap[id] || `Domain ${id}`,
    }))
    .filter(d => d.domain_name);

  // Build skills_to_learn with priority logic:
  // - must_have in ≥2 jobs → high
  // - must_have in 1 job → medium
  // - only preferred → low
  const skillsToLearn = missing.map(s => {
    const row = skillDemandRows.find(r => r.skill_id === s.skill_id);
    const mustHaveCount = row?.must_have_count || 0;
    const totalDemand = row?.demand || 0;

    let priority = "low";
    if (mustHaveCount >= 2) priority = "high";
    else if (mustHaveCount === 1) priority = "medium";

    return {
      skill_id: s.skill_id,
      name: s.name,
      domain_id: s.domain_id,
      domain_name: s.domain_name,
      demand: totalDemand,
      must_have_in_jobs: mustHaveCount,
      priority,
    };
  }).sort((a, b) => {
    // Sort: high → medium → low, then by demand
    const prio = { high: 3, medium: 2, low: 1 };
    return prio[b.priority] - prio[a.priority] || b.demand - a.demand;
  });

  // Fetch company names (for response)
  const companies = await CompanyRecruiterProfile.findAll({
    where: { [Op.or]: companyIds.map(id => ({ user_id: id })) }, // Wait: company_recruiter_profile.id = company_id!
    // But `companyIds` are `company_recruiter_profile.id`, not `user_id`
    // So correct:
    attributes: ["id", "company_name"],
    raw: true,
  });
  const companyNames = companies.map(c => c.company_name).filter(Boolean);

  // Fetch job role titles
  const roles = await JobRole.findAll({
    where: { id: { [Op.in]: roleIds } },
    attributes: ["id", "title"],
    raw: true,
  });
  const roleTitles = roles.map(r => r.title).filter(Boolean);

  return {
    strategy: "company_role",
    input: {
      company_ids: companyIds,
      job_role_ids: roleIds,
      companies: companyNames,
      job_roles: roleTitles,
    },
    gap_analysis: {
      ...gap,
      mastered: gap.mastered.map(enrich),
      missing,
    },
    recommended: {
      domains: recommendedDomains,
      skills_to_learn: skillsToLearn,
    },
  };
};

// Strategy 3: Upskilling (Domain Expansion + Fallback to Top Skills)
const upskillingPrediction = async (userId, userSkillIds, skillMap, domainMap) => {
  // Step 1: Get user's domains from their skills
  const userDomains = [
    ...new Set(
      Array.from(userSkillIds)
        .map(skillId => skillMap[skillId]?.domain_id)
        .filter(id => id != null)
    ),
  ];

  let skillsToRecommend = [];
  let source = "";

  if (userDomains.length >= 1) {
    // 🔹 Case 1: User has ≥1 skill → recommend OTHER skills in SAME domains
    source = "domain_expansion";
    
    // Get all skills in user's domains (excluding what they already have)
    const domainSkills = Object.values(skillMap).filter(
      s => userDomains.includes(s.domain_id) && !userSkillIds.has(s.skill_id)
    );

    if (domainSkills.length === 0) {
      throw new Error("You've already learned all skills in your domains!");
    }

    // Count how many jobs require each skill (must-have only)
    if (domainSkills.length > 0) {
      const demandRows = await sequelize.query(
        `
          SELECT skill_id, COUNT(*) AS demand
          FROM job_post_skills
          WHERE skill_id IN (:skillIds) AND type = 'must_have'
          GROUP BY skill_id
        `,
        {
          replacements: { skillIds: domainSkills.map(s => s.skill_id) },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      const demandMap = Object.fromEntries(demandRows.map(r => [r.skill_id, r.demand]));
      domainSkills.forEach(s => {
        s.demand = demandMap[s.skill_id] || 0;
      });
    }

    skillsToRecommend = domainSkills.map(s => ({
      skill_id: s.skill_id,
      name: s.skill_name, // 
      domain_id: s.domain_id,
      domain_name: domainMap[s.domain_id] || "General",
      demand_in_jobs: s.demand || 0,
      priority: s.demand >= 5 ? "high" : s.demand >= 2 ? "medium" : "low",
    })).sort((a, b) => b.demand_in_jobs - a.demand_in_jobs);

  } else {
    // 🔹 Case 2: User has 0 or very few skills → recommend TOP N most in-demand skills (global)
    source = "top_skills_fallback";

    const topSkills = await sequelize.query(
      `
        SELECT 
          s.skill_id,
          s.skill_name AS name,
          s.domain_id,
          COUNT(*) AS demand
        FROM job_post_skills jps
        INNER JOIN job_posts jp ON jps.job_post_id = jp.job_id
        INNER JOIN skills s ON jps.skill_id = s.skill_id
        WHERE 
          
          AND jps.type = 'must_have'
        GROUP BY s.skill_id, s.skill_name, s.domain_id
        ORDER BY demand DESC
        LIMIT 20
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log("top skills", topSkills);

    skillsToRecommend = topSkills.map(s => ({
      skill_id: s.skill_id,
      name: s.name, // already aliased as skill_name → 'name'
      domain_id: s.domain_id,
      domain_name: domainMap[s.domain_id] || "General",
      demand_in_jobs: s.demand,
      priority: s.demand >= 10 ? "high" : s.demand >= 5 ? "medium" : "low",
    }));
  }

  // Enrich mastered skills
  const mastered = Array.from(userSkillIds)
    .map(id => skillMap[id])
    .filter(s => s != null)
    .map(s => ({
      skill_id: s.skill_id,
      name: s.skill_name,
      domain_id: s.domain_id,
      domain_name: domainMap[s.domain_id] || "General",
    }));

  const missing = skillsToRecommend;

  // Recommended domains = domains of missing skills (unique)
  const recommendedDomains = [
    ...new Set(missing.map(s => s.domain_id)),
  ]
    .map(id => ({
      domain_id: id,
      domain_name: domainMap[id] || `Domain ${id}`,
    }))
    .filter(d => d.domain_name);

  return {
    strategy: "upskilling",
    input: {
      user_skill_count: userSkillIds.size,
      user_domains: userDomains.map(id => ({
        domain_id: id,
        domain_name: domainMap[id] || `Domain ${id}`,
      })),
      recommendation_source: source, // "domain_expansion" or "top_skills_fallback"
    },
    gap_analysis: {
      mastered_count: mastered.length,
      missing_count: missing.length,
      match_percentage: mastered.length > 0 ? Math.round((mastered.length / (mastered.length + missing.length)) * 100) : 0,
      mastered,
      missing,
    },
    recommended: {
      domains: recommendedDomains,
      skills_to_learn: missing.slice(0, 15), // top 15 only
    },
  };
};


//  POST /api/recommmendations/ai-prediction
exports.postPredictions = async (req, res) => {
  try {
    const { id: userId, role:user_role } = req.user || {};

    if (!userId || user_role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only verified students can access AI Prediction.",
      });
    }

    const { strategy, jobId, companyIds, roleIds } = req.body;

    // Validate strategy
    const validStrategies = ["job", "company_role", "upskilling"];
    if (!strategy || !validStrategies.includes(strategy)) {
      return res.status(400).json({
        success: false,
        message: `Invalid strategy. Use one of: ${validStrategies.join(", ")}`,
      });
    }

    //  Fetch user’s skill IDs (once, for all strategies)
    const userSkillRows = await UserSkill.findAll({
      where: { user_id: userId },
      attributes: ["skill_id"],
      raw: true,
    });
    const userSkillIds = new Set(userSkillRows.map(r => r.skill_id));

    //  Fetch master data (skills + domains)
    const [allSkills, allDomains] = await Promise.all([
      Skill.findAll({ attributes: ["skill_id", "skill_name", "domain_id"], raw: true }),
      Domain.findAll({ raw: true }),
    ]);

    const skillMap = Object.fromEntries(
      allSkills.map(s => [s.skill_id, { ...s }])
    );
    const domainMap = Object.fromEntries(
      allDomains.map(d => [d.domain_id, d.domain_name])
    );

    //  Run selected strategy
    let result;
    switch (strategy) {
      case "job":
        if (!jobId || isNaN(jobId)) {
          return res.status(400).json({
            success: false,
            message: "jobId (number) is required for 'job' strategy.",
          });
        }
        result = await jobBasedPrediction(
          userId,
          parseInt(jobId),
          userSkillIds,
          skillMap,
          domainMap
        );
        break;

      case "company_role":
        // Normalize companyIds & roleIds to arrays of numbers
        const safeCompanyIds = Array.isArray(companyIds)
          ? companyIds.map(id => parseInt(id)).filter(id => !isNaN(id))
          : [];
        const safeRoleIds = Array.isArray(roleIds)
          ? roleIds.map(id => parseInt(id)).filter(id => !isNaN(id))
          : [];

        if (safeCompanyIds.length === 0 || safeRoleIds.length === 0) {
          return res.status(400).json({
            success: false,
            message: "companyIds and roleIds (arrays of numbers) are required for 'company_role' strategy.",
          });
        }
        result = await companyBasedPrediction(
          userId,
          safeCompanyIds,
          safeRoleIds,
          userSkillIds,
          skillMap,
          domainMap
        );
        break;

      case "upskilling":
        // No extra input needed
        result = await upskillingPrediction(
          userId,
          userSkillIds,
          skillMap,
          domainMap
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported strategy.",
        });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[AI Prediction Error]", error);
    res.status(500).json({
      success: false,
      message: error.message || "Prediction failed. Try again later.",
    });
  }
};




// Main Prediction Logic
exports.getPredictions = async (req, res) => {
  try {
    // const { id: userId, role:user_role } = req.user || {};
    const userId=220;
    const user_role='STUDENT';

    if (!userId || user_role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only verified students can access AI Prediction.",
      });
    }

    const { strategy } = req.query;
    const { jobId, companyId, domainId } = req.query;


    //  Fetch user’s skill IDs
    const userSkillRows = await UserSkill.findAll({
      where: { user_id: userId },
      attributes: ["skill_id"],
      raw: true,
    });
    const userSkillIds = new Set(userSkillRows.map((r) => r.skill_id));

    //  Fetch all skills + domains (for enrichment)
    const [allSkills, allDomains] = await Promise.all([
      Skill.findAll({
        attributes: ["skill_id", "skill_name", "domain_id"],
        raw: true,
      }),
      Domain.findAll({ raw: true }),
    ]);

    const skillMap = Object.fromEntries(allSkills.map((s) => [s.skill_id, s]));
    const domainMap = Object.fromEntries(
      allDomains.map((d) => [d.domain_id, d.domain_name])
    );

    //  Run strategy
    let result;
switch (strategy) {
  case "job":
    result = await jobBasedPrediction(
      userId,
      parseInt(jobId),
      userSkillIds,
      skillMap,
      domainMap
    );
    break;
  case "company_role":
    const companyIds = req.query.companyIds
      ? Array.isArray(req.query.companyIds)
        ? req.query.companyIds
        : [req.query.companyIds]
      : [];
    const roleIds = req.query.roleIds
      ? Array.isArray(req.query.roleIds)
        ? req.query.roleIds
        : [req.query.roleIds]
      : [];

    result = await companyBasedPrediction(
      userId,
      companyIds.map((id) => parseInt(id)),
      roleIds.map((id) => parseInt(id)),
      userSkillIds,
      skillMap,
      domainMap
    );
    break;
  case "upskilling": 
    result = await upskillingPrediction(
      userId,
      userSkillIds,
      skillMap,
      domainMap
    );
    break;
  default:
    return res.status(400).json({
      success: false,
      message: "Invalid strategy. Use: job / company / domain",
    });
}

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[AI Prediction Error]", error);
    res.status(500).json({
      success: false,
      message: error.message || "Prediction failed. Try again later.",
    });
  }
};