// // services/pathwayGeneration/greedyPathwayBuilder.js

// const { deepClone, generateStateHash } = require("./helpers");
// const { GENERATION_LIMITS, GRANULAR_SKILLS } = require("./config");

// /**
//  * Build pathways using greedy approach
//  * Ensures user learns ALL must-have and preferred skills with required experience
//  */
// function buildGreedyPathways(
//   startState,
//   targetRequirements,
//   opportunities,
//   userCategory,
//   eligibilityRules,
// ) {
//   console.log("\n========== GREEDY PATHWAY BUILDER ==========");
//   console.log(
//     "[GreedyBuilder] Start state skills:",
//     Object.keys(startState.skills).length,
//   );
//   console.log(
//     "[GreedyBuilder] Target must-have:",
//     targetRequirements.must_have_skills.length,
//   );
//   console.log(
//     "[GreedyBuilder] Target preferred:",
//     targetRequirements.preferred_skills.length,
//   );
//   console.log("[GreedyBuilder] Available opportunities:", opportunities.length);

//   const pathways = [];
//   const maxPathways = GENERATION_LIMITS.max_pathways_to_generate;

//   // Strategy 1: Must-haves first, then preferred
//   const pathway1 = buildSinglePathway(
//     deepClone(startState),
//     targetRequirements,
//     opportunities,
//     eligibilityRules,
//     "must_have_first",
//   );
//   if (pathway1) {
//     console.log("[GreedyBuilder] Strategy 1 (must-have first): SUCCESS");
//     pathways.push(pathway1);
//   }

//   // Strategy 2: Balanced (mix must-have and preferred)
//   const pathway2 = buildSinglePathway(
//     deepClone(startState),
//     targetRequirements,
//     opportunities,
//     eligibilityRules,
//     "balanced",
//   );
//   if (pathway2 && !isDuplicatePathway(pathway2, pathways)) {
//     console.log("[GreedyBuilder] Strategy 2 (balanced): SUCCESS");
//     pathways.push(pathway2);
//   }

//   // Strategy 3: Shortest (fewest steps)
//   const pathway3 = buildSinglePathway(
//     deepClone(startState),
//     targetRequirements,
//     opportunities,
//     eligibilityRules,
//     "shortest",
//   );
//   if (pathway3 && !isDuplicatePathway(pathway3, pathways)) {
//     console.log("[GreedyBuilder] Strategy 3 (shortest): SUCCESS");
//     pathways.push(pathway3);
//   }

//   // Generate more variations
//   let attempts = 0;
//   while (pathways.length < maxPathways && attempts < 20) {
//     attempts++;
//     const shuffled = [...opportunities].sort(() => Math.random() - 0.5);
//     const pathway = buildSinglePathway(
//       deepClone(startState),
//       targetRequirements,
//       shuffled,
//       eligibilityRules,
//       "random",
//     );

//     if (pathway && !isDuplicatePathway(pathway, pathways)) {
//       console.log(`[GreedyBuilder] Variation ${pathways.length + 1}: SUCCESS`);
//       pathways.push(pathway);
//     }
//   }

//   console.log(
//     `[GreedyBuilder] FINAL: Generated ${pathways.length} unique pathways`,
//   );
//   console.log("============================================\n");

//   return pathways;
// }

// /**
//  * Build a single pathway
//  */
// function buildSinglePathway(
//   startState,
//   targetRequirements,
//   opportunities,
//   eligibilityRules,
//   strategy,
// ) {
//   const { must_have_skills, preferred_skills } = targetRequirements;

//   const currentState = startState;
//   const steps = [];
//   const usedOpportunities = new Set();
//   const maxSteps = GENERATION_LIMITS.max_steps_per_pathway;

//   // Build skill gap map (ALL skills we need to learn)
//   const skillGaps = new Map();

//   must_have_skills.forEach((skill) => {
//     const current = currentState.skills[skill.skill_id] || 0;
//     const gap = Math.max(0, skill.min_experience_months - current);

//     skillGaps.set(skill.skill_id, {
//       skill_id: skill.skill_id,
//       skill_name: skill.skill_name,
//       gap: gap,
//       is_must_have: true,
//       required: skill.min_experience_months,
//       current: current,
//     });
//   });

//   preferred_skills.forEach((skill) => {
//     const current = currentState.skills[skill.skill_id] || 0;
//     const gap = Math.max(0, skill.min_experience_months - current);

//     if (!skillGaps.has(skill.skill_id)) {
//       skillGaps.set(skill.skill_id, {
//         skill_id: skill.skill_id,
//         skill_name: skill.skill_name,
//         gap: gap,
//         is_must_have: false,
//         required: skill.min_experience_months,
//         current: current,
//       });
//     }
//   });

//   const totalGaps = Array.from(skillGaps.values()).filter(
//     (g) => g.gap > 0,
//   ).length;
//   console.log(
//     `\n[PathwayBuilder-${strategy}] Initial gaps: ${totalGaps} skills need learning`,
//   );

//   if (totalGaps === 0) {
//     console.log(
//       `[PathwayBuilder-${strategy}] No gaps - user already meets all requirements!`,
//     );
//     return {
//       steps: [],
//       finalState: currentState,
//       incomplete: false,
//     };
//   }

//   // Greedy loop
//   let iteration = 0;
//   while (skillGaps.size > 0 && steps.length < maxSteps) {
//     iteration++;

//     const bestOpp = selectBestOpportunity(
//       opportunities,
//       skillGaps,
//       currentState,
//       eligibilityRules,
//       usedOpportunities,
//       strategy,
//     );

//     if (!bestOpp) {
//       console.log(
//         `[PathwayBuilder-${strategy}] Iteration ${iteration}: No more eligible opportunities`,
//       );
//       break;
//     }

//     // Calculate duration (with granular support)
//     const { duration, skillsUsed } = calculateDuration(bestOpp, skillGaps);

//     console.log(
//       `[PathwayBuilder-${strategy}] Step ${steps.length + 1}: ${bestOpp.type} "${bestOpp.title}" (${duration}mo) - teaches ${skillsUsed.length} needed skills`,
//     );

//     // Add step
//     steps.push({
//       opportunity: bestOpp,
//       duration_months: duration,
//       skills_used: skillsUsed, // Track which skills from this resource we're using
//     });

//     // Update state
//     let gapsFilled = 0;
//     bestOpp.skills_provided.forEach((skill) => {
//       if (!skillGaps.has(skill.skill_id)) return;

//       const gap = skillGaps.get(skill.skill_id);
//       const current = currentState.skills[skill.skill_id] || 0;
//       const newExp = current + skill.experience_months;

//       currentState.skills[skill.skill_id] = newExp;

//       if (newExp >= gap.required) {
//         console.log(
//           `  - FILLED: ${gap.skill_name} (${current} -> ${newExp} / ${gap.required}mo)`,
//         );
//         skillGaps.delete(skill.skill_id);
//         gapsFilled++;
//       } else {
//         gap.gap = gap.required - newExp;
//         gap.current = newExp;
//         console.log(
//           `  - PROGRESS: ${gap.skill_name} (${current} -> ${newExp} / ${gap.required}mo, gap: ${gap.gap}mo)`,
//         );
//       }
//     });

//     currentState.total_experience += duration;
//     currentState.hash = generateStateHash(currentState.skills);

//     usedOpportunities.add(`${bestOpp.type}-${bestOpp.id}`);

//     console.log(
//       `  Gaps filled: ${gapsFilled}, Remaining gaps: ${skillGaps.size}`,
//     );
//   }

//   const remainingGaps = skillGaps.size;
//   console.log(
//     `[PathwayBuilder-${strategy}] DONE: ${steps.length} steps, ${remainingGaps} gaps remaining\n`,
//   );

//   if (steps.length === 0) {
//     return null;
//   }

//   return {
//     steps: steps.map((s) => ({ opportunity: s.opportunity, toState: null })),
//     finalState: currentState,
//     incomplete: remainingGaps > 0,
//   };
// }

// /**
//  * Select best opportunity
//  */
// function selectBestOpportunity(
//   opportunities,
//   skillGaps,
//   currentState,
//   eligibilityRules,
//   usedOpportunities,
//   strategy,
// ) {
//   const eligible = opportunities.filter((opp) => {
//     // Skip if already used (no repeating resources)
//     if (usedOpportunities.has(`${opp.type}-${opp.id}`)) {
//       return false;
//     }

//     // Check eligibility rules
//     if (eligibilityRules.blocked_opportunity_types.includes(opp.type)) {
//       return false;
//     }

//     if (!eligibilityRules.allowed_opportunity_types.includes(opp.type)) {
//       return false;
//     }

//     // Check prerequisites
//     for (const prereq of opp.prerequisites) {
//       const userExp = currentState.skills[prereq.skill_id] || 0;
//       if (userExp === 0) {
//         return false; // Missing prerequisite
//       }
//     }

//     // Must teach at least one skill we need
//     const teachesNeededSkill = opp.skills_provided.some(
//       (skill) =>
//         skillGaps.has(skill.skill_id) && skillGaps.get(skill.skill_id).gap > 0,
//     );

//     return teachesNeededSkill;
//   });

//   if (eligible.length === 0) {
//     return null;
//   }

//   // Score each opportunity
//   const scored = eligible.map((opp) => {
//     let score = 0;
//     let mustHaveCount = 0;
//     let preferredCount = 0;
//     let totalExpGain = 0;

//     opp.skills_provided.forEach((skill) => {
//       const gap = skillGaps.get(skill.skill_id);
//       if (gap && gap.gap > 0) {
//         if (gap.is_must_have) {
//           mustHaveCount++;
//           score += 10; // Prioritize must-haves
//         } else {
//           preferredCount++;
//           score += 5; // Preferred also important
//         }

//         // Bonus for filling larger gaps
//         const expContribution = Math.min(gap.gap, skill.experience_months);
//         score += expContribution;
//         totalExpGain += expContribution;
//       }
//     });

//     return {
//       opportunity: opp,
//       score,
//       mustHaveCount,
//       preferredCount,
//       totalExpGain,
//     };
//   });

//   // Sort based on strategy
//   if (strategy === "must_have_first") {
//     scored.sort((a, b) => {
//       if (a.mustHaveCount !== b.mustHaveCount)
//         return b.mustHaveCount - a.mustHaveCount;
//       if (a.preferredCount !== b.preferredCount)
//         return b.preferredCount - a.preferredCount;
//       return b.score - a.score;
//     });
//   } else if (strategy === "shortest") {
//     // Prefer resources that teach MORE skills (fewer total steps needed)
//     scored.sort((a, b) => {
//       const aSkillCount = a.mustHaveCount + a.preferredCount;
//       const bSkillCount = b.mustHaveCount + b.preferredCount;
//       if (aSkillCount !== bSkillCount) return bSkillCount - aSkillCount;
//       return a.opportunity.duration_months - b.opportunity.duration_months;
//     });
//   } else {
//     // Balanced or random
//     scored.sort((a, b) => b.score - a.score);
//   }

//   return scored[0].opportunity;
// }

// /**
//  * Calculate duration with granular support
//  */
// function calculateDuration(opportunity, skillGaps) {
//   const neededSkills = opportunity.skills_provided.filter((skill) => {
//     const gap = skillGaps.get(skill.skill_id);
//     return gap && gap.gap > 0;
//   });

//   // For courses with granular support
//   if (
//     GRANULAR_SKILLS.enabled &&
//     GRANULAR_SKILLS.supported_types.includes(opportunity.type) &&
//     opportunity.skill_learning_duration
//   ) {
//     const granularDuration =
//       neededSkills.length * opportunity.skill_learning_duration;
//     const finalDuration = Math.max(
//       granularDuration,
//       GRANULAR_SKILLS.min_duration_per_skill * neededSkills.length,
//     );

//     console.log(
//       `  [Granular] ${neededSkills.length} skills * ${opportunity.skill_learning_duration}mo/skill = ${finalDuration}mo (vs full ${opportunity.duration_months}mo)`,
//     );

//     return {
//       duration: parseFloat(finalDuration.toFixed(2)),
//       skillsUsed: neededSkills.map((s) => s.skill_id),
//     };
//   }

//   // For internships/projects/jobs - use full duration
//   return {
//     duration: opportunity.duration_months,
//     skillsUsed: neededSkills.map((s) => s.skill_id),
//   };
// }

// /**
//  * Check if pathway is duplicate
//  */
// function isDuplicatePathway(pathway, existingPathways) {
//   const sig1 = pathway.steps
//     .map((s) => `${s.opportunity.type}-${s.opportunity.id}`)
//     .join("|");

//   for (const existing of existingPathways) {
//     const sig2 = existing.steps
//       .map((s) => `${s.opportunity.type}-${s.opportunity.id}`)
//       .join("|");
//     if (sig1 === sig2) return true;
//   }

//   return false;
// }

// module.exports = {
//   buildGreedyPathways,
// };














































































// services/pathwayGeneration/greedyPathwayBuilder.js

const { deepClone, generateStateHash } = require('./helpers');
const { GENERATION_LIMITS, GRANULAR_SKILLS, SKILL_GAP_PRIORITIES } = require('./config');

function buildGreedyPathways(startState, targetRequirements, opportunities, userCategory, eligibilityRules) {
  console.log('\n========== GREEDY PATHWAY BUILDER ==========');
  console.log('[GreedyBuilder] Available opportunities:', opportunities.length);
  
  const pathways = [];
  const maxPathways = GENERATION_LIMITS.max_pathways_to_generate;
  
  // Generate multiple pathway variations
  for (let i = 0; i < maxPathways; i++) {
    const pathway = buildSinglePathway(
      deepClone(startState),
      targetRequirements,
      opportunities,
      eligibilityRules,
      i
    );
    
    if (pathway && !isDuplicatePathway(pathway, pathways)) {
      console.log(`[GreedyBuilder] Pathway ${pathways.length + 1}: ${pathway.steps.length} steps, coverage ${pathway.coverage.toFixed(1)}%`);
      pathways.push(pathway);
    }
  }
  
  console.log(`[GreedyBuilder] Generated ${pathways.length} unique pathways`);
  console.log('============================================\n');
  
  return pathways;
}

function buildSinglePathway(startState, targetRequirements, opportunities, eligibilityRules, variationIndex) {
  const { must_have_skills, preferred_skills } = targetRequirements;
  
  const currentState = startState;
  const steps = [];
  const usedOpportunities = new Set();
  const maxSteps = GENERATION_LIMITS.max_steps_per_pathway;
  
  // Shuffle opportunities for variation (except first pathway)
  const shuffledOpps = variationIndex === 0 
    ? opportunities 
    : [...opportunities].sort(() => Math.random() - 0.5);
  
  // Build TWO separate gap maps
  const missingSkills = new Map(); // Skills user doesn't have at all
  const insufficientExp = new Map(); // Skills user has but needs more experience
  
  [...must_have_skills, ...preferred_skills].forEach(skill => {
    const current = currentState.skills[skill.skill_id] || 0;
    const required = skill.min_experience_months;
    const isMustHave = must_have_skills.some(s => s.skill_id === skill.skill_id);
    
    if (current === 0) {
      // User doesn't have this skill at all
      missingSkills.set(skill.skill_id, {
        skill_id: skill.skill_id,
        skill_name: skill.skill_name,
        required_exp: required,
        is_must_have: isMustHave,
      });
    } else if (current < required) {
      // User has skill but insufficient experience
      insufficientExp.set(skill.skill_id, {
        skill_id: skill.skill_id,
        skill_name: skill.skill_name,
        current_exp: current,
        required_exp: required,
        gap: required - current,
        is_must_have: isMustHave,
      });
    }
  });
  
  console.log(`\n[Pathway ${variationIndex + 1}] Missing skills: ${missingSkills.size}, Insufficient exp: ${insufficientExp.size}`);
  
  // PHASE 1: Fill missing skills (use courses/projects/internships)
  console.log(`[Pathway ${variationIndex + 1}] PHASE 1: Learning missing skills...`);
  
  while (missingSkills.size > 0 && steps.length < maxSteps) {
    const best = selectBestForSkillGap(
      shuffledOpps,
      missingSkills,
      currentState,
      eligibilityRules,
      usedOpportunities
    );
    
    if (!best) {
      console.log(`[Pathway ${variationIndex + 1}] No more resources for missing skills`);
      break;
    }
    
    const { duration, skillsLearned } = applyOpportunity(best, missingSkills, insufficientExp, currentState);
    
    steps.push({
      opportunity: best,
      duration_months: duration,
    });
    
    console.log(`[Pathway ${variationIndex + 1}] Step ${steps.length}: ${best.type} "${best.title}" (${duration}mo) - learned ${skillsLearned.length} skills`);
    
    usedOpportunities.add(`${best.type}-${best.id}`);
  }
  
  // PHASE 2: Fill experience gaps (use internships/projects/jobs)
  console.log(`[Pathway ${variationIndex + 1}] PHASE 2: Gaining experience...`);
  
  while (insufficientExp.size > 0 && steps.length < maxSteps) {
    const best = selectBestForExpGap(
      shuffledOpps,
      insufficientExp,
      currentState,
      eligibilityRules,
      usedOpportunities
    );
    
    if (!best) {
      console.log(`[Pathway ${variationIndex + 1}] No more resources for experience`);
      break;
    }
    
    const { duration, expGained } = applyOpportunityForExp(best, insufficientExp, currentState);
    
    steps.push({
      opportunity: best,
      duration_months: duration,
    });
    
    console.log(`[Pathway ${variationIndex + 1}] Step ${steps.length}: ${best.type} "${best.title}" (${duration}mo) - gained exp in ${expGained.length} skills`);
    
    usedOpportunities.add(`${best.type}-${best.id}`);
  }
  
  const totalGapsRemaining = missingSkills.size + insufficientExp.size;
  console.log(`[Pathway ${variationIndex + 1}] Done: ${steps.length} steps, ${totalGapsRemaining} gaps remaining\n`);
  
  if (steps.length === 0) {
    return null;
  }
  
  // Calculate coverage
  const totalTarget = must_have_skills.length + preferred_skills.length;
  const satisfied = totalTarget - totalGapsRemaining;
  const coverage = totalTarget > 0 ? (satisfied / totalTarget) * 100 : 100;
  
  return {
    steps: steps.map(s => ({ opportunity: s.opportunity, toState: null })),
    finalState: currentState,
    incomplete: totalGapsRemaining > 0,
    coverage: coverage,
  };
}

// Select best opportunity for missing skills (Phase 1)
function selectBestForSkillGap(opportunities, missingSkills, currentState, eligibilityRules, usedOpportunities) {
  const priorities = SKILL_GAP_PRIORITIES.skill_missing;
  
  const eligible = opportunities.filter(opp => {
    if (usedOpportunities.has(`${opp.type}-${opp.id}`)) return false;
    if (eligibilityRules.blocked_opportunity_types.includes(opp.type)) return false;
    if (!eligibilityRules.allowed_opportunity_types.includes(opp.type)) return false;
    if (!priorities.includes(opp.type)) return false; // Must be in priority list for skill gaps
    
    // Check prerequisites
    for (const prereq of opp.prerequisites) {
      if ((currentState.skills[prereq.skill_id] || 0) === 0) return false;
    }
    
    // Must teach at least one missing skill
    return opp.skills_provided.some(s => missingSkills.has(s.skill_id));
  });
  
  if (eligible.length === 0) return null;
  
  // Score by: number of missing skills taught, then by priority order
  const scored = eligible.map(opp => {
    const skillsItTeaches = opp.skills_provided.filter(s => missingSkills.has(s.skill_id));
    const mustHaveCount = skillsItTeaches.filter(s => missingSkills.get(s.skill_id).is_must_have).length;
    const priorityIndex = priorities.indexOf(opp.type);
    
    return {
      opp,
      score: (mustHaveCount * 100) + (skillsItTeaches.length * 10) - priorityIndex,
    };
  });
  
  scored.sort((a, b) => b.score - a.score);
  return scored[0].opp;
}

// Select best opportunity for experience gaps (Phase 2)
function selectBestForExpGap(opportunities, insufficientExp, currentState, eligibilityRules, usedOpportunities) {
  const priorities = SKILL_GAP_PRIORITIES.experience_insufficient;
  
  const eligible = opportunities.filter(opp => {
    if (usedOpportunities.has(`${opp.type}-${opp.id}`)) return false;
    if (eligibilityRules.blocked_opportunity_types.includes(opp.type)) return false;
    if (!eligibilityRules.allowed_opportunity_types.includes(opp.type)) return false;
    if (!priorities.includes(opp.type)) return false; // Must be in priority list for exp gaps
    
    // Check prerequisites
    for (const prereq of opp.prerequisites) {
      if ((currentState.skills[prereq.skill_id] || 0) === 0) return false;
    }
    
    // Must provide experience for at least one skill we need
    return opp.skills_provided.some(s => {
      return insufficientExp.has(s.skill_id) && s.experience_months > 0;
    });
  });
  
  if (eligible.length === 0) return null;
  
  // Score by: total experience contribution, must-haves first
  const scored = eligible.map(opp => {
    let totalExp = 0;
    let mustHaveExp = 0;
    
    opp.skills_provided.forEach(s => {
      const gap = insufficientExp.get(s.skill_id);
      if (gap) {
        const contribution = Math.min(gap.gap, s.experience_months);
        totalExp += contribution;
        if (gap.is_must_have) mustHaveExp += contribution;
      }
    });
    
    const priorityIndex = priorities.indexOf(opp.type);
    
    return {
      opp,
      score: (mustHaveExp * 100) + (totalExp * 10) - priorityIndex,
    };
  });
  
  scored.sort((a, b) => b.score - a.score);
  return scored[0].opp;
}

// Apply opportunity for skill learning
function applyOpportunity(opp, missingSkills, insufficientExp, currentState) {
  const skillsLearned = [];
  
  opp.skills_provided.forEach(skill => {
    if (missingSkills.has(skill.skill_id)) {
      // Learn this skill
      currentState.skills[skill.skill_id] = skill.experience_months;
      skillsLearned.push(skill.skill_name);
      missingSkills.delete(skill.skill_id);
      
      // If we learned it but still need more experience, add to insufficientExp
      const targetSkill = findTargetSkill(skill.skill_id);
      if (targetSkill && skill.experience_months < targetSkill.required_exp) {
        insufficientExp.set(skill.skill_id, {
          skill_id: skill.skill_id,
          skill_name: skill.skill_name,
          current_exp: skill.experience_months,
          required_exp: targetSkill.required_exp,
          gap: targetSkill.required_exp - skill.experience_months,
          is_must_have: targetSkill.is_must_have,
        });
      }
    }
  });
  
  // Calculate granular duration
  const duration = calculateGranularDuration(opp, skillsLearned.length);
  
  currentState.total_experience += duration;
  currentState.hash = generateStateHash(currentState.skills);
  
  return { duration, skillsLearned };
}

// Helper to find target skill requirement (global scope issue - fix needed)
let globalTargetRequirements = null;

function setGlobalTargetRequirements(requirements) {
  globalTargetRequirements = requirements;
}

function findTargetSkill(skillId) {
  if (!globalTargetRequirements) return null;
  
  const found = [...globalTargetRequirements.must_have_skills, ...globalTargetRequirements.preferred_skills]
    .find(s => s.skill_id === skillId);
  
  if (!found) return null;
  
  return {
    required_exp: found.min_experience_months,
    is_must_have: globalTargetRequirements.must_have_skills.some(s => s.skill_id === skillId),
  };
}

// Apply opportunity for experience gain
function applyOpportunityForExp(opp, insufficientExp, currentState) {
  const expGained = [];
  
  opp.skills_provided.forEach(skill => {
    const gap = insufficientExp.get(skill.skill_id);
    if (gap && skill.experience_months > 0) {
      const current = currentState.skills[skill.skill_id] || 0;
      const newExp = current + skill.experience_months;
      currentState.skills[skill.skill_id] = newExp;
      
      expGained.push(skill.skill_name);
      
      if (newExp >= gap.required_exp) {
        insufficientExp.delete(skill.skill_id);
      } else {
        gap.current_exp = newExp;
        gap.gap = gap.required_exp - newExp;
      }
    }
  });
  
  const duration = opp.duration_months; // No granular for experience phase
  
  currentState.total_experience += duration;
  currentState.hash = generateStateHash(currentState.skills);
  
  return { duration, expGained };
}

// Calculate granular duration
function calculateGranularDuration(opp, skillsLearned) {
  if (!GRANULAR_SKILLS.enabled || !GRANULAR_SKILLS.supported_types.includes(opp.type)) {
    return opp.duration_months;
  }
  
  if (!opp.skill_learning_duration || skillsLearned === 0) {
    return opp.duration_months;
  }
  
  const granularDuration = skillsLearned * opp.skill_learning_duration;
  const minDuration = GRANULAR_SKILLS.min_duration_per_skill * skillsLearned;
  
  return Math.max(granularDuration, minDuration, 0.5);
}

// Check if pathway is duplicate
function isDuplicatePathway(pathway, existingPathways) {
  const sig1 = pathway.steps.map(s => `${s.opportunity.type}-${s.opportunity.id}`).sort().join('|');
  
  for (const existing of existingPathways) {
    const sig2 = existing.steps.map(s => `${s.opportunity.type}-${s.opportunity.id}`).sort().join('|');
    if (sig1 === sig2) return true;
  }
  
  return false;
}

module.exports = {
  buildGreedyPathways,
  setGlobalTargetRequirements,
};