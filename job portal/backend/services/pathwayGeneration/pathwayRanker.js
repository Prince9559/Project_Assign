// services/pathwayGeneration/pathwayRanker.js

const { RANKING_WEIGHTS, SCORING_CONFIG } = require('./config');

/**
 * Score and rank pathways
 * Priority: Max skill coverage > Shorter duration > More experience > Quality
 */
function scoreAndRankPathways(pathways, targetRequirements) {
  // Score each pathway
  const scoredPathways = pathways.map((pathway) => {
    const scores = calculatePathwayScores(pathway, targetRequirements);

    // Weighted total score
    const totalScore =
      scores.skill_coverage_score * RANKING_WEIGHTS.skill_coverage +
      scores.duration_score * RANKING_WEIGHTS.duration +
      scores.experience_gain_score * RANKING_WEIGHTS.experience_gain +
      scores.resource_quality_score * RANKING_WEIGHTS.resource_quality;

    return {
      ...pathway,
      scoring_details: scores,
      pathway_score: parseFloat(totalScore.toFixed(2)),
    };
  });

  // // Sort by total score (descending), then by duration (ascending), then by skill coverage (descending)
  // scoredPathways.sort((a, b) => {
  //   // First: Higher total score
  //   if (Math.abs(a.pathway_score - b.pathway_score) > 0.01) {
  //     return b.pathway_score - a.pathway_score;
  //   }

  //   // Second: Shorter duration
  //   if (Math.abs(a.total_duration_months - b.total_duration_months) > 0.1) {
  //     return a.total_duration_months - b.total_duration_months;
  //   }

  //   // Third: Higher skill coverage
  //   return b.overall_skill_coverage_percent - a.overall_skill_coverage_percent;
  // });

  // Sort by: Coverage DESC (higher better), Duration ASC (faster better), Score DESC
  scoredPathways.sort((a, b) => {
    // First: Higher overall coverage
    if (
      Math.abs(
        a.overall_skill_coverage_percent - b.overall_skill_coverage_percent,
      ) > 0.5
    ) {
      return (
        b.overall_skill_coverage_percent - a.overall_skill_coverage_percent
      );
    }

    // Second: Shorter duration
    if (Math.abs(a.total_duration_months - b.total_duration_months) > 0.1) {
      return a.total_duration_months - b.total_duration_months;
    }

    // Third: Higher total score
    return b.pathway_score - a.pathway_score;
  });

  // Assign ranks
  scoredPathways.forEach((pathway, index) => {
    pathway.pathway_rank = index + 1;
  });

  return scoredPathways;
}

/**
 * Calculate individual scores for a pathway
 */
function calculatePathwayScores(pathway, targetRequirements) {
  const { must_have_skills, preferred_skills } = targetRequirements;
  
  // 1. Skill Coverage Score (most important - you want max skills covered)
  const mustHaveCoverage = pathway.must_have_coverage_percent / 100;
  const preferredCoverage = pathway.preferred_coverage_percent / 100;
  
  // Apply experience penalties for skills that are present but have insufficient experience
  let experiencePenalty = 0;
  
  // Check must-have skills
  must_have_skills.forEach(req => {
    const gained = pathway.total_experience_gained[req.skill_id] || 0;
    if (gained > 0 && gained < req.min_experience_months) {
      const gap = req.min_experience_months - gained;
      experiencePenalty += gap * SCORING_CONFIG.skill_coverage.experience_penalty_per_month_short;
    }
  });
  
  // Check preferred skills
  preferred_skills.forEach(req => {
    const gained = pathway.total_experience_gained[req.skill_id] || 0;
    if (gained > 0 && gained < req.min_experience_months) {
      const gap = req.min_experience_months - gained;
      experiencePenalty += gap * SCORING_CONFIG.skill_coverage.experience_penalty_per_month_short * 0.5; // Lower penalty for preferred
    }
  });
  
  const skillCoverageScore = Math.max(0, 
    (mustHaveCoverage * SCORING_CONFIG.skill_coverage.must_have_weight) +
    (preferredCoverage * SCORING_CONFIG.skill_coverage.preferred_weight) -
    experiencePenalty
  );
  
  // 2. Duration Score (shorter is better)
  const idealDuration = SCORING_CONFIG.duration.ideal_months;
  const actualDuration = pathway.total_duration_months;
  
  let durationScore = 1.0;
  if (actualDuration > idealDuration) {
    const extraMonths = actualDuration - idealDuration;
    durationScore = Math.max(0, 1 - (extraMonths * SCORING_CONFIG.duration.penalty_per_extra_month));
  }
  
  // 3. Experience Gain Score (more experience is better)
  const totalExpRequired = 
    must_have_skills.reduce((sum, s) => sum + s.min_experience_months, 0) +
    preferred_skills.reduce((sum, s) => sum + s.min_experience_months, 0);
  
  const totalExpGained = Object.values(pathway.total_experience_gained).reduce((sum, exp) => sum + exp, 0);
  
  const experienceGainScore = totalExpRequired > 0 
    ? Math.min(1, totalExpGained / totalExpRequired) 
    : 1;
  
  // 4. Resource Quality Score (based on ratings, if available)
  // For now, use a simple heuristic: prioritize internships/jobs over courses
  let qualityScore = 0;
  const totalSteps = pathway.steps.length;
  
  if (totalSteps > 0) {
    const internshipJobWeight = (pathway.total_internships + pathway.total_jobs) / totalSteps;
    const projectWeight = pathway.total_projects / totalSteps;
    const courseWeight = pathway.total_courses / totalSteps;
    
    qualityScore = (internshipJobWeight * 1.0) + (projectWeight * 0.7) + (courseWeight * 0.5);
  }
  
  return {
    skill_coverage_score: parseFloat(skillCoverageScore.toFixed(4)),
    duration_score: parseFloat(durationScore.toFixed(4)),
    experience_gain_score: parseFloat(experienceGainScore.toFixed(4)),
    resource_quality_score: parseFloat(qualityScore.toFixed(4)),
  };
}

/**
 * Select top N pathways based on criteria:
 * - Maximum skill coverage
 * - Shortest duration among high coverage
 * - Variety/uniqueness
 */
function selectTopPathways(rankedPathways, topN = 3) {
  if (rankedPathways.length <= topN) {
    return rankedPathways;
  }
  
  const selected = [];
  const usedCombinations = new Set();
  
  // First pass: Get pathways with highest coverage
  const highCoveragePathways = rankedPathways.filter(p => 
    p.overall_skill_coverage_percent >= 80
  );
  
  // If less than topN high-coverage pathways, lower threshold
  let candidatePathways = highCoveragePathways;
  if (candidatePathways.length < topN) {
    candidatePathways = rankedPathways.filter(p => 
      p.overall_skill_coverage_percent >= 70
    );
  }
  if (candidatePathways.length < topN) {
    candidatePathways = rankedPathways; // Take all
  }
  
  // Sort by: coverage DESC, duration ASC, score DESC
  candidatePathways.sort((a, b) => {
    if (Math.abs(a.overall_skill_coverage_percent - b.overall_skill_coverage_percent) > 1) {
      return b.overall_skill_coverage_percent - a.overall_skill_coverage_percent;
    }
    if (Math.abs(a.total_duration_months - b.total_duration_months) > 0.5) {
      return a.total_duration_months - b.total_duration_months;
    }
    return b.pathway_score - a.pathway_score;
  });
  
  // Select diverse pathways
  for (const pathway of candidatePathways) {
    if (selected.length >= topN) break;
    
    // Generate signature for uniqueness check
    const signature = generatePathwaySignature(pathway);
    
    // Skip if too similar to already selected
    if (usedCombinations.has(signature)) {
      continue;
    }
    
    selected.push(pathway);
    usedCombinations.add(signature);
  }
  
  // If still not enough, fill with next best
  if (selected.length < topN) {
    for (const pathway of rankedPathways) {
      if (selected.length >= topN) break;
      if (!selected.includes(pathway)) {
        selected.push(pathway);
      }
    }
  }
  
  // Re-assign ranks for top N
  selected.forEach((pathway, index) => {
    pathway.pathway_rank = index + 1;
  });
  
  return selected;
}

/**
 * Generate a signature for pathway uniqueness
 */
function generatePathwaySignature(pathway) {
  // Create signature based on opportunity types and order
  const sig = pathway.steps.map(step => 
    `${step.opportunity_type}:${step.opportunity_id}`
  ).join('|');
  return sig;
}

module.exports = {
  scoreAndRankPathways,
  selectTopPathways,
};