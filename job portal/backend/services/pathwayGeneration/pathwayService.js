// services/pathwayGeneration/pathwayService.js

const db = require('../../models');
const { Op } = require('sequelize');
const { analyzeSkillGap } = require('./skillAnalyzer');
const { fetchAllOpportunities } = require('./opportunityFetcher');
// const { buildGraph } = require('./graphBuilder');
const { findPathways, formatPathways } = require('./pathwayFinder');
const { scoreAndRankPathways, selectTopPathways } = require('./pathwayRanker');
const { 
  calculateUserTotalExperience, 
  aggregateUserSkills, 
  generateStateHash 
} = require('./helpers');
const { 
  ELIGIBILITY_RULES, 
  GENERATION_LIMITS, 
  CACHE_SETTINGS,
  ROLE_AGGREGATION 
} = require('./config');


const { buildGreedyPathways } = require('./greedyPathwayBuilder');
const { filterRelevantOpportunities } = require('./opportunityFetcher');

/**
 * Main pathway generation function
 */
async function generatePathways(userId, targetType, targetId = null, targetRole = null, userPreferences = null) {
  try {
    // 1. Load user data
    const user = await db.User.findByPk(userId, {
      include: [
        {
          model: db.UserDetail,
          as: "UserDetail",
        },
        {
          model: db.UserSkill,
          as: "UserSkills",
          include: [
            {
              model: db.Skill,
              as: "Skill",
              attributes: ["skill_id", "skill_name"],
            },
          ],
        },
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    const userCategory = user.UserDetail?.user_category || "currently_studying";
    const userSkills = user.UserSkills || [];

    // 2. Load or create user preferences
    let prefs = userPreferences;
    if (!prefs) {
      const prefRecord = await db.UserPathwayPreference.findOne({
        where: { user_id: userId },
      });
      prefs = prefRecord
        ? prefRecord.toJSON()
        : {
            include_courses: true,
            include_projects: true,
            include_internships: true,
            include_jobs: true,
          };
    }

    // 3. Check cache
    // const cached = await checkCache(userId, targetType, targetId, targetRole);
    // if (cached) {
    //   return {
    //     success: true,
    //     data: {
    //       pathways: cached,
    //       cached: true,
    //     },
    //   };
    // }

    // 4. Define target requirements
    const targetRequirements = await defineTargetRequirements(
      targetType,
      targetId,
      targetRole,
    );

    // 5. Analyze skill gap
    const skillGapReport = await analyzeSkillGap(
      userSkills,
      targetRequirements,
    );

    // 6. Build user's current state
    const aggregatedSkills = aggregateUserSkills(userSkills);
    const userSkillMap = {};
    aggregatedSkills.forEach((skill) => {
      userSkillMap[skill.skill_id] = skill.total_experience_months;
    });

    const totalUserExp = calculateUserTotalExperience(userSkills);

    const startState = {
      skills: userSkillMap,
      total_experience: totalUserExp,
      hash: generateStateHash(userSkillMap),
    };

    console.log("the user start state is ", startState);

    // // 7. Fetch all opportunities
    // const opportunities = await fetchAllOpportunities(prefs);

    // if (opportunities.length === 0) {
    //   return {
    //     success: false,
    //     message: 'No learning resources available. Please add courses, internships, or projects.',
    //   };
    // }

    // // 8. Get eligibility rules
    // const eligibilityRules = ELIGIBILITY_RULES[userCategory];
    // console.log("the eligibilty rules",eligibilityRules);

    // // 9. Build graph
    // const graph = buildGraph(
    //   startState,
    //   targetRequirements,
    //   opportunities,
    //   userCategory,
    //   eligibilityRules
    // );

    // // console.log("the graph build", graph);

    // // 10. Find pathways
    // const rawPathways = findPathways(graph, startState, targetRequirements);

    // if (rawPathways.length === 0) {
    //   return {
    //     success: false,
    //     message: 'Unable to generate pathways with current resources. Try adjusting preferences or add more learning resources.',
    //   };
    // }

    // // 11. Format pathways
    // const formattedPathways = formatPathways(rawPathways, targetRequirements);

    // console.log("THe formatted pathways", formattedPathways);
    // 5
    // // 12. Score and rank
    // const rankedPathways = scoreAndRankPathways(formattedPathways, targetRequirements);

    // // 13. Select top N
    // const topPathways = selectTopPathways(rankedPathways, GENERATION_LIMITS.top_pathways_to_return);

    // Find this section and replace:

    // 7. Fetch all opportunities
    console.log("\n[PathwayService] Step 7: Fetching opportunities...");
    const allOpportunities = await fetchAllOpportunities(prefs);
    console.log(
      `[PathwayService] Fetched ${allOpportunities.length} total opportunities`,
    );

    if (allOpportunities.length === 0) {
      return {
        success: false,
        message:
          "No learning resources available. Please add courses, internships, or projects.",
      };
    }

    // 8. Filter to relevant opportunities
    console.log("\n[PathwayService] Step 8: Filtering by relevance...");
    const relevantOpportunities = filterRelevantOpportunities(
      allOpportunities,
      targetRequirements,
    );

    if (relevantOpportunities.length === 0) {
      const targetSkillNames = [
        ...targetRequirements.must_have_skills.map((s) => s.skill_name),
        ...targetRequirements.preferred_skills.map((s) => s.skill_name),
      ];

      return {
        success: false,
        message: `No learning resources found that teach the required skills: ${targetSkillNames.join(", ")}`,
        debug: {
          target_skills: targetSkillNames,
          total_resources: allOpportunities.length,
        },
      };
    }

    // 9. Get eligibility rules
    const eligibilityRules = ELIGIBILITY_RULES[userCategory];
    console.log(
      "\n[PathwayService] Step 9: Eligibility rules loaded for",
      userCategory,
    );

    // 10. Build pathways using greedy approach
    console.log("\n[PathwayService] Step 10: Building pathways...");

    // ADD THIS LINE:
    const {
      buildGreedyPathways,
      setGlobalTargetRequirements,
    } = require("./greedyPathwayBuilder");
    setGlobalTargetRequirements(targetRequirements);

    // 10. Build pathways using greedy approach
    console.log("\n[PathwayService] Step 10: Building pathways...");
    const rawPathways = buildGreedyPathways(
      startState,
      targetRequirements,
      relevantOpportunities,
      userCategory,
      eligibilityRules,
    );

    if (rawPathways.length === 0) {
      return {
        success: false,
        message:
          "Unable to generate pathways. User may already meet all requirements, or prerequisites are not met.",
        debug: {
          user_skill_ids: Object.keys(startState.skills),
          target_skill_ids: [
            ...targetRequirements.must_have_skills.map((s) => s.skill_id),
            ...targetRequirements.preferred_skills.map((s) => s.skill_id),
          ],
          relevant_opportunities: relevantOpportunities.length,
        },
      };
    }

    // 11. Format pathways
    console.log("\n[PathwayService] Step 11: Formatting pathways...");
    const formattedPathways = formatPathways(rawPathways, targetRequirements);

    // 12. Score and rank
    console.log("\n[PathwayService] Step 12: Scoring and ranking...");
    const rankedPathways = scoreAndRankPathways(
      formattedPathways,
      targetRequirements,
    );

    // 13. Select top N
    console.log("\n[PathwayService] Step 13: Selecting top pathways...");
    const topPathways = selectTopPathways(
      rankedPathways,
      GENERATION_LIMITS.top_pathways_to_return,
    );

    console.log(
      `\n[PathwayService] FINAL: Returning ${topPathways.length} pathways`,
    );

    // 14. Save to database
    await savePathways(
      userId,
      targetType,
      targetId,
      targetRole,
      topPathways,
      prefs,
    );

    // 15. Return results
    return {
      success: true,
      data: {
        pathways: topPathways,
        skill_gap_summary: skillGapReport,
        user_current_state: {
          total_experience_months: totalUserExp,
          skills: aggregatedSkills,
        },
        target_requirements: targetRequirements,
      },
    };
  } catch (error) {
    console.error('Error generating pathways:', error);
    throw error;
  }
}

/**
 * Check if valid cached pathways exist
 */
async function checkCache(userId, targetType, targetId, targetRole) {
  const where = {
    user_id: userId,
    target_type: targetType,
    status: 'active',
    expires_at: { [Op.gt]: new Date() },
  };
  
  if (targetId) where.target_job_id = targetId;
  if (targetRole) where.target_role_name = targetRole;
  
  const cached = await db.UserPathway.findAll({
    where,
    include: [
      {
        model: db.PathwayStep,
        as: 'steps',
        order: [['step_order', 'ASC']],
      },
    ],
    order: [['pathway_rank', 'ASC']],
  });
  
  if (cached.length > 0) {
    return cached.map(p => p.toJSON());
  }
  
  return null;
}

/**
 * Define target requirements based on type
 */
async function defineTargetRequirements(targetType, targetId, targetRole) {
  if (targetType === 'job_specific') {
    return await getJobSpecificRequirements(targetId);
  } else if (targetType === 'role_specific') {
    return await getRoleSpecificRequirements(targetRole);
  } else {
    throw new Error('Invalid target type');
  }
}

/**
 * Get requirements for a specific job
 */
async function getJobSpecificRequirements(jobId) {
  const job = await db.JobPost.findByPk(jobId, {
    include: [
      {
        model: db.Skill,
        as: 'mustHaveSkills',
        through: {
          attributes: ['min_experience_months'],
        },
      },
      {
        model: db.Skill,
        as: 'preferredSkills',
        through: {
          attributes: ['min_experience_months'],
        },
      },
    ],
  });
  
  if (!job) {
    throw new Error('Job not found');
  }
  
  const mustHaveSkills = (job.mustHaveSkills || []).map(skill => ({
    skill_id: skill.skill_id,
    skill_name: skill.skill_name,
    min_experience_months: skill.JobPostSkill?.min_experience_months || 0,
  }));
  
  const preferredSkills = (job.preferredSkills || []).map(skill => ({
    skill_id: skill.skill_id,
    skill_name: skill.skill_name,
    min_experience_months: skill.JobPostSkill?.min_experience_months || 0,
  }));


  
  return {
    must_have_skills: mustHaveSkills,
    preferred_skills: preferredSkills,
  };
}


/**
 * Get aggregated requirements for a role (from multiple job posts)
 */
// async function getRoleSpecificRequirements(roleName) {
//   // Find all job posts for this role
//   const jobs = await db.JobPost.findAll({
//     include: [
//       {
//         model: db.JobRole,
//         as: 'JobRole',
//         where: {
//           title: { [Op.like]: `%${roleName}%` },
//         },
//       },
//       // {
//       //   model: db.JobPostSkill,
//       //   as: 'skills',
//       //   include: [
//       //     {
//       //       model: db.Skill,
//       //       as: 'Skill',
//       //     },
//       //   ],
//       // },



//       {
//                 model: db.Skill,
//                 as: "skills", // ← This is your existing belongsToMany alias
//                 through: {
//                   attributes: ["type", "min_experience_months"], // ← Pull JobPostSkill fields here
//                 },
//                 attributes: ["skill_id", "skill_name"],
//               },
//     ],
//     where: {
//       active_status: { [Op.in]: [1, 2] }, // Active or closed
//     },
//   });
  
//   if (jobs.length === 0) {
//     throw new Error(`No jobs found for role: ${roleName}`);
//   }
  
//   // Aggregate skills across all jobs
//   const skillAggregation = {};
  
//   jobs.forEach(job => {
//     const weight = getJobWeight(job.post_type);
    
//     (job.skills || []).forEach(jps => {
//       const skillId = jps.skill_id;
//       const skillName = jps.Skill?.skill_name || 'Unknown';
//       const isMustHave = jps.type === 'must_have';
//       const expMonths = jps.min_experience_months || 0;
      
//       if (!skillAggregation[skillId]) {
//         skillAggregation[skillId] = {
//           skill_id: skillId,
//           skill_name: skillName,
//           must_have_count: 0,
//           preferred_count: 0,
//           total_count: 0,
//           weighted_exp_sum: 0,
//           total_weight: 0,
//         };
//       }
      
//       const agg = skillAggregation[skillId];
//       agg.total_count++;
      
//       if (isMustHave) {
//         agg.must_have_count++;
//       } else {
//         agg.preferred_count++;
//       }
      
//       agg.weighted_exp_sum += expMonths * weight;
//       agg.total_weight += weight;
//     });
//   });
  
//   // Determine must-have vs preferred based on frequency
//   const mustHaveSkills = [];
//   const preferredSkills = [];
  
//   Object.values(skillAggregation).forEach(agg => {
//     const mustHaveFreq = agg.must_have_count / jobs.length;
//     const avgExp = Math.round(agg.weighted_exp_sum / agg.total_weight);
    
//     const skillObj = {
//       skill_id: agg.skill_id,
//       skill_name: agg.skill_name,
//       min_experience_months: avgExp,
//     };
    
//     if (mustHaveFreq >= ROLE_AGGREGATION.must_have_threshold) {
//       mustHaveSkills.push(skillObj);
//     } else if (mustHaveFreq >= ROLE_AGGREGATION.preferred_threshold) {
//       preferredSkills.push(skillObj);
//     } else {
//       preferredSkills.push(skillObj); // Add all for completeness
//     }
//   });
  
//   return {
//     must_have_skills: mustHaveSkills,
//     preferred_skills: preferredSkills,
//   };
// }







async function getRoleSpecificRequirements(roleName) {
  // Find all job posts for this role
  const jobs = await db.JobPost.findAll({
    include: [
      {
        model: db.JobRole,
        as: 'JobRole',
        where: {
          title: { [Op.like]: `%${roleName}%` },
        },
      },
      {
                model: db.Skill,
                as: "skills", // ← This is your existing belongsToMany alias
                through: {
                  attributes: ["type", "min_experience_months"], // ← Pull JobPostSkill fields here
                },
                attributes: ["skill_id", "skill_name"],
              },
    ],
    where: {
      active_status: { [Op.in]: [1, 2] }, // Active or closed
    },
  });
  
  if (jobs.length === 0) {
    throw new Error(`No jobs found for role: ${roleName}`);
  }
  
  // Aggregate skills across all jobs
  const skillAggregation = {};
  
  jobs.forEach(job => {
    const weight = getJobWeight(job.post_type);
    
    (job.skills || []).forEach(jps => {
      const skillId = jps.skill_id;
      const skillName = jps.skill_name || 'Unknown';
      const isMustHave = jps.type === 'must_have';
      const expMonths = jps.min_experience_months || 0;
      
      if (!skillAggregation[skillId]) {
        skillAggregation[skillId] = {
          skill_id: skillId,
          skill_name: skillName,
          must_have_count: 0,
          preferred_count: 0,
          total_count: 0,
          weighted_exp_sum: 0,
          total_weight: 0,
        };
      }
      
      const agg = skillAggregation[skillId];
      agg.total_count++;
      
      if (isMustHave) {
        agg.must_have_count++;
      } else {
        agg.preferred_count++;
      }
      
      agg.weighted_exp_sum += expMonths * weight;
      agg.total_weight += weight;
    });
  });
  
  // Determine must-have vs preferred based on frequency
  const mustHaveSkills = [];
  const preferredSkills = [];
  
  Object.values(skillAggregation).forEach(agg => {
    const mustHaveFreq = agg.must_have_count / jobs.length;
    const avgExp = Math.round(agg.weighted_exp_sum / agg.total_weight);
    
    const skillObj = {
      skill_id: agg.skill_id,
      skill_name: agg.skill_name,
      min_experience_months: avgExp,
    };
    
    if (mustHaveFreq >= ROLE_AGGREGATION.must_have_threshold) {
      mustHaveSkills.push(skillObj);
    } else if (mustHaveFreq >= ROLE_AGGREGATION.preferred_threshold) {
      preferredSkills.push(skillObj);
    } else {
      preferredSkills.push(skillObj); // Add all for completeness
    }
  });
  
  return {
    must_have_skills: mustHaveSkills,
    preferred_skills: preferredSkills,
  };
}



/**
 * Get weight for job based on post_type
 */
function getJobWeight(postType) {
  if (postType === 'future') return ROLE_AGGREGATION.weights.future;
  if (postType === 'active') return ROLE_AGGREGATION.weights.active;
  return ROLE_AGGREGATION.weights.closed;
}

/**
 * Save pathways to database
 */
async function savePathways(
  userId,
  targetType,
  targetId,
  targetRole,
  pathways,
  userPreferences
) {
  const transaction = await db.sequelize.transaction();

  try {
    // Mark old pathways as outdated
    await db.UserPathway.update(
      { status: "outdated" },
      {
        where: {
          user_id: userId,
          target_type: targetType,
          ...(targetId && { target_job_id: targetId }),
          ...(targetRole && { target_role_name: targetRole }),
          status: "active",
        },
        transaction,
      }
    );

    // Insert new pathways
    for (const pathway of pathways) {
      const expiresAt = new Date();
      expiresAt.setDate(
        expiresAt.getDate() + CACHE_SETTINGS.pathway_expiry_days
      );

      const pathwayRecord = await db.UserPathway.create(
        {
          user_id: userId,
          target_type: targetType,
          target_job_id: targetId,
          target_role_name: targetRole,
          pathway_rank: pathway.pathway_rank,
          total_duration_months: pathway.total_duration_months,
          must_have_coverage_percent: pathway.must_have_coverage_percent,
          preferred_coverage_percent: pathway.preferred_coverage_percent,
          overall_skill_coverage_percent:
            pathway.overall_skill_coverage_percent,
          total_experience_gained: pathway.total_experience_gained,
          total_courses: pathway.total_courses,
          total_projects: pathway.total_projects,
          total_internships: pathway.total_internships,
          total_jobs: pathway.total_jobs,
          pathway_score: pathway.pathway_score,
          user_preferences: userPreferences,
          status: "active",
          expires_at: expiresAt,
          generated_at: new Date(),
        },
        { transaction }
      );

      // Insert steps
      for (const step of pathway.steps) {
        await db.PathwayStep.create(
          {
            pathway_id: pathwayRecord.pathway_id,
            step_order: step.step_order,
            resource_type: step.opportunity_type,
            resource_title: step.opportunity_title,
            resource_missing: false, // TODO: Handle missing resources
            duration_months: step.duration_months,
            skills_gained: step.skills_gained,
            prerequisites_met: true,
            step_reasoning: step.step_reasoning,
            status: "pending",
          },
          { transaction }
        );
      }
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}



/**
 * Lightweight skill gap analysis (no pathway generation)
 */
async function getSkillGapPreview(userId, targetType, targetId, targetRole) {
  const user = await db.User.findByPk(userId, {
    include: [{ model: db.UserSkill, as: 'UserSkills' }],
  });
  if (!user) throw new Error('User not found');

  const targetRequirements = await defineTargetRequirements(targetType, targetId, targetRole);
  const skillGapReport = await analyzeSkillGap(user.UserSkills || [], targetRequirements);

  return {
    success: true,
    data: {
      user_skills: skillGapReport.user_skill_map,
      missing_skills: [...skillGapReport.must_have.missing, ...skillGapReport.preferred.missing],
      insufficient_experience: [...skillGapReport.must_have.insufficient_experience, ...skillGapReport.preferred.insufficient_experience],
      coverage: skillGapReport.coverage,
    },
  };
}

module.exports = {
  generatePathways,
  getSkillGapPreview, 
};
