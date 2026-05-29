// services/pathwayGeneration/pathwayFinder.js

const { stateSatisfiesTarget, calculateSkillCoverage, deepClone } = require('./helpers');
const { GENERATION_LIMITS } = require('./config');

/**
 * Find multiple pathway variations using DFS
 */
function findPathways(graph, startState, targetRequirements) {
  const { states, edges, goalStates } = graph;
  const pathways = [];
  const maxPathways = GENERATION_LIMITS.max_pathways_to_generate;
  const maxSteps = GENERATION_LIMITS.max_steps_per_pathway;
  
  // Build adjacency list for easier traversal
  const adjacency = new Map();
  edges.forEach(edge => {
    if (!adjacency.has(edge.from)) {
      adjacency.set(edge.from, []);
    }
    adjacency.get(edge.from).push(edge);
  });
  
  /**
   * DFS to find paths
   */
  // function dfs(currentHash, path, visitedInPath) {
  //   // Stop conditions
  //   if (pathways.length >= maxPathways) return;
  //   if (path.length >= maxSteps) return;
    
  //   const currentState = states.get(currentHash);
    
  //   // Check if goal reached
  //   if (stateSatisfiesTarget(currentState, targetRequirements)) {
  //     // Found a valid pathway
  //     const pathwayCopy = deepClone(path);
  //     pathways.push({
  //       steps: pathwayCopy,
  //       finalState: deepClone(currentState),
  //     });
  //     return;
  //   }
    
  //   // Explore neighbors
  //   const neighbors = adjacency.get(currentHash) || [];
    
  //   for (const edge of neighbors) {
  //     // Prevent immediate loops (but allow same opportunity later in different context)
  //     const oppKey = `${edge.opportunity.type}-${edge.opportunity.id}`;
      
  //     // Allow revisiting states but not in immediate succession
  //     if (path.length > 0) {
  //       const lastStep = path[path.length - 1];
  //       const lastOppKey = `${lastStep.opportunity.type}-${lastStep.opportunity.id}`;
  //       if (oppKey === lastOppKey) {
  //         continue; // Skip immediate repeat
  //       }
  //     }
      
  //     // Add to path
  //     path.push({
  //       opportunity: edge.opportunity,
  //       toState: edge.to,
  //     });
      
  //     visitedInPath.add(edge.to);
      
  //     // Recurse
  //     dfs(edge.to, path, visitedInPath);
      
  //     // Backtrack
  //     path.pop();
  //     visitedInPath.delete(edge.to);
  //   }
  // }

  function dfs(currentHash, path, visitedInPath) {
    if (pathways.length >= maxPathways) return;
    if (path.length >= maxSteps) {
      // Save incomplete pathway
      const currentState = states.get(currentHash);
      pathways.push({
        steps: deepClone(path),
        finalState: deepClone(currentState),
        incomplete: true,
      });
      return;
    }

    const currentState = states.get(currentHash);

    if (stateSatisfiesTarget(currentState, targetRequirements)) {
      const pathwayCopy = deepClone(path);
      pathways.push({
        steps: pathwayCopy,
        finalState: deepClone(currentState),
      });
      return;
    }

    const neighbors = adjacency.get(currentHash) || [];

    for (const edge of neighbors) {
      // 🔴 CRITICAL FIX: Prevent cycles in the current path
      if (visitedInPath.has(edge.to)) {
        continue; // Skip if we've already visited this state in current path
      }

      // Optional: still skip immediate opportunity repeats (good heuristic)
      if (path.length > 0) {
        const lastStep = path[path.length - 1];
        const lastOppKey = `${lastStep.opportunity.type}-${lastStep.opportunity.id}`;
        const currOppKey = `${edge.opportunity.type}-${edge.opportunity.id}`;
        if (lastOppKey === currOppKey) {
          continue;
        }
      }

      // Push and recurse
      path.push({
        opportunity: edge.opportunity,
        toState: edge.to,
      });

      visitedInPath.add(edge.to); // ← now this check matters!

      dfs(edge.to, path, visitedInPath);

      // Backtrack
      path.pop();
      visitedInPath.delete(edge.to);
    }
  }
  
  // Start DFS from start state
  dfs(startState.hash, [], new Set([startState.hash]));
  
  // If no pathways found to goal states, find best-effort pathways
  if (pathways.length === 0) {
    // Find pathways that get closest to target
    findBestEffortPathways(adjacency, startState, targetRequirements, states, pathways, maxPathways, maxSteps);
  }

  console.log("the pathways",pathways);
  
  return pathways;
}

/**
 * Find best-effort pathways when no complete path exists
 */
function findBestEffortPathways(adjacency, startState, targetRequirements, states, pathways, maxPathways, maxSteps) {
  function dfs(currentHash, path, visitedInPath) {
    if (pathways.length >= maxPathways) return;
    if (path.length >= maxSteps) {
      // Save this pathway even if incomplete
      const currentState = states.get(currentHash);
      pathways.push({
        steps: deepClone(path),
        finalState: deepClone(currentState),
        incomplete: true,
      });
      return;
    }
    
    const neighbors = adjacency.get(currentHash) || [];
    
    // If no more neighbors, save current path
    if (neighbors.length === 0 && path.length > 0) {
      const currentState = states.get(currentHash);
      pathways.push({
        steps: deepClone(path),
        finalState: deepClone(currentState),
        incomplete: true,
      });
      return;
    }
    
    for (const edge of neighbors) {
      if (visitedInPath.has(edge.to)) continue;
      const oppKey = `${edge.opportunity.type}-${edge.opportunity.id}`;
      
      if (path.length > 0) {
        const lastStep = path[path.length - 1];
        const lastOppKey = `${lastStep.opportunity.type}-${lastStep.opportunity.id}`;
        if (oppKey === lastOppKey) continue;
      }
      
      path.push({
        opportunity: edge.opportunity,
        toState: edge.to,
      });
      
      visitedInPath.add(edge.to);
      dfs(edge.to, path, visitedInPath);
      
      path.pop();
      visitedInPath.delete(edge.to);
    }
  }
  
  dfs(startState.hash, [], new Set([startState.hash]));
}

/**
 * Convert raw pathways to structured format {OLD VERSION}
 */
// function formatPathways(rawPathways, targetRequirements) {

//   console.log("raw pathways",rawPathways);
//   console.log("target requirements",targetRequirements)

//   return rawPathways.map(raw => {
//     const steps = raw.steps.map((step, index) => {
//       const opp = step.opportunity;
//       return {
//         step_order: index + 1,
//         opportunity_type: opp.type,
//         opportunity_id: opp.id,
//         opportunity_title: opp.title,
//         duration_months: opp.duration_months,
//         skills_gained: opp.skills_provided.map(s => ({
//           skill_id: s.skill_id,
//           skill_name: s.skill_name,
//           experience_months: s.experience_months,
//         })),
//         step_reasoning: generateStepReasoning(opp, targetRequirements),
//       };
//     });
    
//     // Calculate total duration
//     const totalDuration = steps.reduce((sum, step) => sum + step.duration_months, 0);
    
//     // Calculate skill coverage
//     const coverage = calculateSkillCoverage(raw.finalState, targetRequirements);
    
//     // Count experience gained per skill
//     const experienceGained = {};
//     steps.forEach(step => {
//       step.skills_gained.forEach(skill => {
//         experienceGained[skill.skill_id] = (experienceGained[skill.skill_id] || 0) + skill.experience_months;
//       });
//     });
    
//     // Count resource types
//     const counts = {
//       courses: 0,
//       projects: 0,
//       internships: 0,
//       jobs: 0,
//     };
    
//     steps.forEach(step => {
//       if (step.opportunity_type === 'course') counts.courses++;
//       if (step.opportunity_type === 'project') counts.projects++;
//       if (step.opportunity_type === 'internship') counts.internships++;
//       if (step.opportunity_type === 'job') counts.jobs++;
//     });
    
//     return {
//       steps,
//       total_duration_months: totalDuration,
//       must_have_coverage_percent: coverage.must_have_coverage,
//       preferred_coverage_percent: coverage.preferred_coverage,
//       overall_skill_coverage_percent: coverage.overall_coverage,
//       total_experience_gained: experienceGained,
//       total_courses: counts.courses,
//       total_projects: counts.projects,
//       total_internships: counts.internships,
//       total_jobs: counts.jobs,
//       incomplete: raw.incomplete || false,
//     };
//   });
// }





// services/pathwayGeneration/pathwayFinder.js





/**
 * Convert raw pathways to structured format new with granular
 */
function formatPathways(rawPathways, targetRequirements) {
  console.log('[PathwayFormatter] Formatting pathways...');
  
  return rawPathways.map((raw, idx) => {
    const steps = raw.steps.map((step, index) => {
      const opp = step.opportunity;
      
      // Filter skills to only those relevant to target
      const targetSkillIds = new Set([
        ...targetRequirements.must_have_skills.map(s => s.skill_id),
        ...targetRequirements.preferred_skills.map(s => s.skill_id),
      ]);
      
      const relevantSkills = opp.skills_provided
        .filter(s => targetSkillIds.has(s.skill_id))
        .map(s => ({
          skill_id: s.skill_id,
          skill_name: s.skill_name,
          experience_months: s.experience_months,
        }));
      
      return {
        step_order: index + 1,
        opportunity_type: opp.type,
        opportunity_id: opp.id,
        opportunity_title: opp.title,
        duration_months: step.duration_months || opp.duration_months, // Use calculated duration
        skills_gained: relevantSkills,
        step_reasoning: generateStepReasoning(opp, targetRequirements),
      };
    });
    
    // Calculate totals
    const totalDuration = steps.reduce((sum, step) => sum + step.duration_months, 0);
    
    const coverage = calculateSkillCoverage(raw.finalState, targetRequirements);
    
    // Experience gained per skill
    const experienceGained = {};
    steps.forEach(step => {
      step.skills_gained.forEach(skill => {
        experienceGained[skill.skill_id] = (experienceGained[skill.skill_id] || 0) + skill.experience_months;
      });
    });
    
    // Count resource types
    const counts = { courses: 0, projects: 0, internships: 0, jobs: 0 };
    steps.forEach(step => {
      if (step.opportunity_type === 'course') counts.courses++;
      else if (step.opportunity_type === 'project') counts.projects++;
      else if (step.opportunity_type === 'internship') counts.internships++;
      else if (step.opportunity_type === 'job') counts.jobs++;
    });
    
    console.log(`[PathwayFormatter] Pathway ${idx + 1}: ${steps.length} steps, ${totalDuration}mo, ${coverage.overall_coverage.toFixed(1)}% coverage`);
    
    return {
      steps,
      total_duration_months: parseFloat(totalDuration.toFixed(2)),
      must_have_coverage_percent: coverage.must_have_coverage,
      preferred_coverage_percent: coverage.preferred_coverage,
      overall_skill_coverage_percent: coverage.overall_coverage,
      total_experience_gained: experienceGained,
      total_courses: counts.courses,
      total_projects: counts.projects,
      total_internships: counts.internships,
      total_jobs: counts.jobs,
      incomplete: raw.incomplete || false,
    };
  });
}



/**
 * Generate reasoning for why a step is included
 */
function generateStepReasoning(opportunity, targetRequirements) {
  const { must_have_skills, preferred_skills } = targetRequirements;
  const allTargetSkills = [...must_have_skills, ...preferred_skills];
  
  const relevantSkills = opportunity.skills_provided.filter(provided => {
    return allTargetSkills.some(target => target.skill_id === provided.skill_id);
  });
  
  if (relevantSkills.length === 0) {
    return `Provides general skills: ${opportunity.skills_provided.map(s => s.skill_name).join(', ')}`;
  }
  
  const skillNames = relevantSkills.map(s => 
    `${s.skill_name} (+${s.experience_months} months exp)`
  ).join(', ');
  
  return `Adds required skills: ${skillNames}`;
}

module.exports = {
  findPathways,
  formatPathways,
};