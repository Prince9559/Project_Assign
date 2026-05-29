// /**
//  * Pathway Builder Service
//  * Contains different strategies to build pathways
//  */

// const {
//   getSkillsCoveredByResource,
//   calculatePersonalizedDuration,
// } = require("../utils/pathwayUtils");
// const {
//   sortResourcesByPreference,
//   groupResourcesByType,
// } = require("../utils/resourceUtils");

// /**
//  * Build pathway using preference-heavy strategy
//  * Prioritizes user's preferred resource types
//  * @param {Array} resources - Scored resources
//  * @param {Object} gapSkills - Skill gap object
//  * @param {Object} userPreferences - User preferences
//  * @returns {Array} - Pathway steps
//  */
// function buildPreferenceHeavyPathway(resources, gapSkills, userPreferences) {
//   console.log("[PathwayBuilder] Starting preference-heavy pathway");
//   console.log(
//     `[PathwayBuilder] Total resources available: ${resources.length}`
//   );
//   console.log(
//     `[PathwayBuilder] User preference order: ${userPreferences.resource_priority.join(
//       " > "
//     )}`
//   );

//   const pathway = [];
//   let remainingSkills = [...gapSkills.allGapSkillIds];

//   console.log(
//     `[PathwayBuilder] Initial skills to cover: ${remainingSkills.length}`
//   );

//   // Sort by preference first, then by score
//   const sortedByPreference = sortResourcesByPreference(
//     resources,
//     userPreferences.resource_priority
//   );

//   const sortedResources = sortedByPreference.sort((a, b) => {
//     const aIndex = userPreferences.resource_priority.indexOf(a.resource_type);
//     const bIndex = userPreferences.resource_priority.indexOf(b.resource_type);

//     if (aIndex !== bIndex) return aIndex - bIndex;
//     return (b.calculatedScore || 0) - (a.calculatedScore || 0);
//   });

//   console.log(
//     `[PathwayBuilder] Sorted ${sortedResources.length} resources by preference`
//   );

//   // Greedy selection
//   for (
//     let i = 0;
//     i < sortedResources.length && remainingSkills.length > 0;
//     i++
//   ) {
//     const resource = sortedResources[i];
//     const skillsCovered = getSkillsCoveredByResource(resource, remainingSkills);

//     if (skillsCovered.length > 0) {
//       const personalizedDuration = calculatePersonalizedDuration(
//         resource,
//         skillsCovered
//       );

//       console.log(`[PathwayBuilder] Adding resource: ${resource.title}`);
//       console.log(`[PathwayBuilder]   - Type: ${resource.resource_type}`);
//       console.log(
//         `[PathwayBuilder]   - Skills covered: ${skillsCovered.length}`
//       );
//       console.log(
//         `[PathwayBuilder]   - Duration: ${personalizedDuration} days`
//       );

//       pathway.push({
//         resource,
//         skillsCovered,
//         personalizedDuration,
//       });

//       remainingSkills = remainingSkills.filter(
//         (skillId) => !skillsCovered.includes(skillId)
//       );

//       console.log(
//         `[PathwayBuilder]   - Remaining skills: ${remainingSkills.length}`
//       );
//     }

//     // Stop if pathway getting too long
//     if (pathway.length >= 8) {
//       console.log(
//         "[PathwayBuilder] Pathway reached maximum length (8 resources)"
//       );
//       break;
//     }
//   }

//   console.log(
//     `[PathwayBuilder] Preference-heavy pathway complete with ${pathway.length} steps`
//   );
//   console.log(
//     `[PathwayBuilder] Uncovered skills remaining: ${remainingSkills.length}`
//   );

//   return pathway;
// }

// /**
//  * Build pathway using fastest timeline strategy
//  * Prioritizes resources with best skills/duration ratio
//  * @param {Array} resources
//  * @param {Object} gapSkills
//  * @param {Object} userPreferences
//  * @returns {Array}
//  */
// function buildFastestPathway(resources, gapSkills, userPreferences) {
//   console.log("[PathwayBuilder] Starting fastest timeline pathway");
//   console.log(
//     `[PathwayBuilder] Total resources available: ${resources.length}`
//   );

//   const pathway = [];
//   let remainingSkills = [...gapSkills.allGapSkillIds];

//   console.log(
//     `[PathwayBuilder] Initial skills to cover: ${remainingSkills.length}`
//   );

//   // Sort by efficiency: skills covered per day
//   const sortedByEfficiency = [...resources].sort((a, b) => {
//     const aSkillsCovered = getSkillsCoveredByResource(a, remainingSkills);
//     const bSkillsCovered = getSkillsCoveredByResource(b, remainingSkills);

//     const aEff = aSkillsCovered.length / parseFloat(a.total_duration);
//     const bEff = bSkillsCovered.length / parseFloat(b.total_duration);

//     return bEff - aEff;
//   });

//   console.log("[PathwayBuilder] Resources sorted by efficiency");

//   // Greedy selection
//   for (const resource of sortedByEfficiency) {
//     if (remainingSkills.length === 0) break;

//     const skillsCovered = getSkillsCoveredByResource(resource, remainingSkills);

//     if (skillsCovered.length > 0) {
//       const personalizedDuration = calculatePersonalizedDuration(
//         resource,
//         skillsCovered
//       );

//       console.log(`[PathwayBuilder] Adding resource: ${resource.title}`);
//       console.log(`[PathwayBuilder]   - Type: ${resource.resource_type}`);
//       console.log(
//         `[PathwayBuilder]   - Skills covered: ${skillsCovered.length}`
//       );
//       console.log(
//         `[PathwayBuilder]   - Duration: ${personalizedDuration} days`
//       );
//       console.log(
//         `[PathwayBuilder]   - Efficiency: ${(
//           skillsCovered.length / personalizedDuration
//         ).toFixed(3)} skills/day`
//       );

//       pathway.push({
//         resource,
//         skillsCovered,
//         personalizedDuration,
//       });

//       remainingSkills = remainingSkills.filter(
//         (skillId) => !skillsCovered.includes(skillId)
//       );

//       console.log(
//         `[PathwayBuilder]   - Remaining skills: ${remainingSkills.length}`
//       );
//     }

//     // Stop if pathway getting too long
//     if (pathway.length >= 7) {
//       console.log(
//         "[PathwayBuilder] Pathway reached maximum length (7 resources)"
//       );
//       break;
//     }
//   }

//   console.log(
//     `[PathwayBuilder] Fastest pathway complete with ${pathway.length} steps`
//   );
//   console.log(
//     `[PathwayBuilder] Uncovered skills remaining: ${remainingSkills.length}`
//   );

//   return pathway;
// }

// /**
//  * Build pathway using balanced strategy
//  * Tries to include mix of all resource types
//  * @param {Array} resources
//  * @param {Object} gapSkills
//  * @param {Object} userPreferences
//  * @returns {Array}
//  */
// function buildBalancedPathway(resources, gapSkills, userPreferences) {
//   console.log("[PathwayBuilder] Starting balanced pathway");
//   console.log(
//     `[PathwayBuilder] Total resources available: ${resources.length}`
//   );

//   const pathway = [];
//   let remainingSkills = [...gapSkills.allGapSkillIds];

//   console.log(
//     `[PathwayBuilder] Initial skills to cover: ${remainingSkills.length}`
//   );

//   // Group by type
//   const grouped = groupResourcesByType(resources);

//   console.log(`[PathwayBuilder] Resources by type:`);
//   console.log(`[PathwayBuilder]   - Internships: ${grouped.internship.length}`);
//   console.log(`[PathwayBuilder]   - Projects: ${grouped.project.length}`);
//   console.log(`[PathwayBuilder]   - Courses: ${grouped.course.length}`);

//   // Try to pick best from each type first
//   const types = ["internship", "project", "course"];

//   for (const type of types) {
//     if (remainingSkills.length === 0) break;

//     const resourcesOfType = grouped[type];

//     if (resourcesOfType.length === 0) {
//       console.log(`[PathwayBuilder] No ${type}s available, skipping`);
//       continue;
//     }

//     // Find best resource of this type
//     let bestResource = null;
//     let bestSkillsCovered = [];
//     let bestScore = -1;

//     for (const resource of resourcesOfType) {
//       const skillsCovered = getSkillsCoveredByResource(
//         resource,
//         remainingSkills
//       );

//       if (skillsCovered.length > bestSkillsCovered.length) {
//         bestResource = resource;
//         bestSkillsCovered = skillsCovered;
//         bestScore = resource.calculatedScore || 0;
//       }
//     }

//     if (bestResource && bestSkillsCovered.length > 0) {
//       const personalizedDuration = calculatePersonalizedDuration(
//         bestResource,
//         bestSkillsCovered
//       );

//       console.log(
//         `[PathwayBuilder] Adding best ${type}: ${bestResource.title}`
//       );
//       console.log(
//         `[PathwayBuilder]   - Skills covered: ${bestSkillsCovered.length}`
//       );
//       console.log(
//         `[PathwayBuilder]   - Duration: ${personalizedDuration} days`
//       );

//       pathway.push({
//         resource: bestResource,
//         skillsCovered: bestSkillsCovered,
//         personalizedDuration,
//       });

//       remainingSkills = remainingSkills.filter(
//         (skillId) => !bestSkillsCovered.includes(skillId)
//       );

//       console.log(
//         `[PathwayBuilder]   - Remaining skills: ${remainingSkills.length}`
//       );
//     }
//   }

//   // Fill remaining gaps with best available resources
//   console.log(
//     "[PathwayBuilder] Filling remaining skill gaps with best resources"
//   );

//   const allResources = [...resources].sort(
//     (a, b) => (b.calculatedScore || 0) - (a.calculatedScore || 0)
//   );

//   for (const resource of allResources) {
//     if (remainingSkills.length === 0) break;
//     if (pathway.length >= 8) break;

//     // Skip if already in pathway
//     if (
//       pathway.some((step) => step.resource.resource_id === resource.resource_id)
//     ) {
//       continue;
//     }

//     const skillsCovered = getSkillsCoveredByResource(resource, remainingSkills);

//     if (skillsCovered.length > 0) {
//       const personalizedDuration = calculatePersonalizedDuration(
//         resource,
//         skillsCovered
//       );

//       console.log(`[PathwayBuilder] Adding filler resource: ${resource.title}`);
//       console.log(`[PathwayBuilder]   - Type: ${resource.resource_type}`);
//       console.log(
//         `[PathwayBuilder]   - Skills covered: ${skillsCovered.length}`
//       );
//       console.log(
//         `[PathwayBuilder]   - Duration: ${personalizedDuration} days`
//       );

//       pathway.push({
//         resource,
//         skillsCovered,
//         personalizedDuration,
//       });

//       remainingSkills = remainingSkills.filter(
//         (skillId) => !skillsCovered.includes(skillId)
//       );

//       console.log(
//         `[PathwayBuilder]   - Remaining skills: ${remainingSkills.length}`
//       );
//     }
//   }

//   console.log(
//     `[PathwayBuilder] Balanced pathway complete with ${pathway.length} steps`
//   );
//   console.log(
//     `[PathwayBuilder] Uncovered skills remaining: ${remainingSkills.length}`
//   );

//   return pathway;
// }

// /**
//  * Find best resource that covers remaining skills
//  * @param {Array} resources
//  * @param {Array} remainingSkills
//  * @returns {Object|null}
//  */
// function findBestResourceForSkills(resources, remainingSkills) {
//   let bestResource = null;
//   let maxCoverage = 0;

//   for (const resource of resources) {
//     const skillsCovered = getSkillsCoveredByResource(resource, remainingSkills);

//     if (skillsCovered.length > maxCoverage) {
//       maxCoverage = skillsCovered.length;
//       bestResource = resource;
//     }
//   }

//   return bestResource;
// }

// module.exports = {
//   buildPreferenceHeavyPathway,
//   buildFastestPathway,
//   buildBalancedPathway,
//   findBestResourceForSkills,
// };






































/**
 * Pathway Builder Service (REVISED)
 * Contains TRULY different strategies to build diverse pathways
 */

const {
  getSkillsCoveredByResource,
  calculatePersonalizedDuration,
} = require("../utils/pathwayUtils");
const { groupResourcesByType } = require("../utils/resourceUtils");

/**
 * STRATEGY 1: User Preference First
 * Strictly follows user's preferred resource order
 * Aims for: Maximum alignment with user preferences
 */
function buildPreferenceHeavyPathway(resources, gapSkills, userPreferences) {
  console.log("[PathwayBuilder] STRATEGY 1: Preference-Heavy Pathway");
  console.log(`[PathwayBuilder] User preference order: ${userPreferences.resource_priority.join(" > ")}`);

  const pathway = [];
  let remainingSkills = [...gapSkills.allGapSkillIds];
  const grouped = groupResourcesByType(resources);

  console.log(`[PathwayBuilder] Initial skills to cover: ${remainingSkills.length}`);

  // Follow preference order strictly
  for (const preferredType of userPreferences.resource_priority) {
    if (remainingSkills.length === 0) break;

    console.log(`[PathwayBuilder] Prioritizing ${preferredType}s`);

    const resourcesOfType = grouped[preferredType] || [];

    // Sort by score within this type
    const sorted = resourcesOfType.sort(
      (a, b) => (b.calculatedScore || 0) - (a.calculatedScore || 0)
    );

    // Take multiple resources of preferred type if available
    let addedCount = 0;
    const maxOfType = preferredType === userPreferences.resource_priority[0] ? 3 : 2;

    for (const resource of sorted) {
      if (remainingSkills.length === 0 || addedCount >= maxOfType) break;

      const skillsCovered = getSkillsCoveredByResource(resource, remainingSkills);

      if (skillsCovered.length > 0) {
        const personalizedDuration = calculatePersonalizedDuration(resource, skillsCovered);

        console.log(`[PathwayBuilder] Adding ${preferredType}: ${resource.title}`);
        console.log(`[PathwayBuilder]   Skills covered: ${skillsCovered.length}, Duration: ${personalizedDuration} days`);

        pathway.push({
          resource,
          skillsCovered,
          personalizedDuration,
        });

        remainingSkills = remainingSkills.filter((skillId) => !skillsCovered.includes(skillId));
        addedCount++;
      }
    }

    console.log(`[PathwayBuilder] Added ${addedCount} ${preferredType}(s), Remaining skills: ${remainingSkills.length}`);
  }

  // Fill any remaining gaps with best available (if still needed)
  if (remainingSkills.length > 0 && pathway.length < 6) {
    console.log(`[PathwayBuilder] Filling ${remainingSkills.length} remaining skills`);
    fillRemainingGaps(pathway, remainingSkills, resources, 2);
  }

  console.log(`[PathwayBuilder] Preference-heavy pathway complete: ${pathway.length} steps`);
  return pathway;
}

/**
 * STRATEGY 2: Efficiency First (Fastest Timeline)
 * Prioritizes resources with best skills-per-day ratio
 * Aims for: Shortest total duration
 */
function buildFastestPathway(resources, gapSkills, userPreferences) {
  console.log("[PathwayBuilder] STRATEGY 2: Fastest Timeline Pathway");

  const pathway = [];
  let remainingSkills = [...gapSkills.allGapSkillIds];

  console.log(`[PathwayBuilder] Initial skills to cover: ${remainingSkills.length}`);

  // Create efficiency scores considering REMAINING skills
  const getEfficiency = (resource, remaining) => {
    const skillsCovered = getSkillsCoveredByResource(resource, remaining);
    if (skillsCovered.length === 0) return 0;

    const duration = calculatePersonalizedDuration(resource, skillsCovered);
    return skillsCovered.length / Math.max(duration, 1);
  };

  // Iteratively pick most efficient resource for current remaining skills
  while (remainingSkills.length > 0 && pathway.length < 7) {
    let bestResource = null;
    let bestEfficiency = 0;
    let bestSkillsCovered = [];
    let bestDuration = 0;

    for (const resource of resources) {
      // Skip already used
      if (pathway.some((step) => step.resource.resource_id === resource.resource_id)) {
        continue;
      }

      const skillsCovered = getSkillsCoveredByResource(resource, remainingSkills);
      if (skillsCovered.length === 0) continue;

      const duration = calculatePersonalizedDuration(resource, skillsCovered);
      const efficiency = skillsCovered.length / Math.max(duration, 1);

      if (efficiency > bestEfficiency) {
        bestEfficiency = efficiency;
        bestResource = resource;
        bestSkillsCovered = skillsCovered;
        bestDuration = duration;
      }
    }

    if (!bestResource) {
      console.log("[PathwayBuilder] No more efficient resources available");
      break;
    }

    console.log(`[PathwayBuilder] Adding: ${bestResource.title}`);
    console.log(`[PathwayBuilder]   Efficiency: ${bestEfficiency.toFixed(3)} skills/day`);
    console.log(`[PathwayBuilder]   Skills: ${bestSkillsCovered.length}, Duration: ${bestDuration} days`);

    pathway.push({
      resource: bestResource,
      skillsCovered: bestSkillsCovered,
      personalizedDuration: bestDuration,
    });

    remainingSkills = remainingSkills.filter((skillId) => !bestSkillsCovered.includes(skillId));
    console.log(`[PathwayBuilder]   Remaining skills: ${remainingSkills.length}`);
  }

  console.log(`[PathwayBuilder] Fastest pathway complete: ${pathway.length} steps`);
  return pathway;
}

/**
 * STRATEGY 3: Coverage First (Maximum Skills per Resource)
 * Prioritizes resources that cover the most skills at once
 * Aims for: Fewest number of resources, maximum skill coverage per step
 */
function buildBalancedPathway(resources, gapSkills, userPreferences) {
  console.log("[PathwayBuilder] STRATEGY 3: Maximum Coverage Pathway");

  const pathway = [];
  let remainingSkills = [...gapSkills.allGapSkillIds];
  const grouped = groupResourcesByType(resources);

  console.log(`[PathwayBuilder] Initial skills to cover: ${remainingSkills.length}`);

  // Phase 1: Pick ONE resource from each type that covers MOST skills
  console.log("[PathwayBuilder] Phase 1: Selecting best from each type");

  const types = ["internship", "project", "course"];
  const pickedTypes = new Set();

  for (const type of types) {
    if (remainingSkills.length === 0) break;

    const resourcesOfType = grouped[type] || [];
    if (resourcesOfType.length === 0) continue;

    let bestResource = null;
    let maxCoverage = 0;
    let bestSkillsCovered = [];

    for (const resource of resourcesOfType) {
      const skillsCovered = getSkillsCoveredByResource(resource, remainingSkills);
      if (skillsCovered.length > maxCoverage) {
        maxCoverage = skillsCovered.length;
        bestResource = resource;
        bestSkillsCovered = skillsCovered;
      }
    }

    if (bestResource && bestSkillsCovered.length > 0) {
      const personalizedDuration = calculatePersonalizedDuration(
        bestResource,
        bestSkillsCovered
      );

      console.log(`[PathwayBuilder] Best ${type}: ${bestResource.title}`);
      console.log(`[PathwayBuilder]   Covers ${bestSkillsCovered.length} skills in ${personalizedDuration} days`);

      pathway.push({
        resource: bestResource,
        skillsCovered: bestSkillsCovered,
        personalizedDuration,
      });

      remainingSkills = remainingSkills.filter(
        (skillId) => !bestSkillsCovered.includes(skillId)
      );
      pickedTypes.add(type);
    }
  }

  console.log(`[PathwayBuilder] Phase 1 complete. Picked ${pathway.length} resources from ${pickedTypes.size} types`);
  console.log(`[PathwayBuilder] Remaining skills: ${remainingSkills.length}`);

  // Phase 2: Fill remaining gaps with resources that cover most remaining skills
  if (remainingSkills.length > 0) {
    console.log("[PathwayBuilder] Phase 2: Filling remaining gaps");

    while (remainingSkills.length > 0 && pathway.length < 6) {
      let bestResource = null;
      let maxCoverage = 0;
      let bestSkillsCovered = [];

      for (const resource of resources) {
        // Skip already used
        if (pathway.some((step) => step.resource.resource_id === resource.resource_id)) {
          continue;
        }

        const skillsCovered = getSkillsCoveredByResource(resource, remainingSkills);
        if (skillsCovered.length > maxCoverage) {
          maxCoverage = skillsCovered.length;
          bestResource = resource;
          bestSkillsCovered = skillsCovered;
        }
      }

      if (!bestResource || maxCoverage === 0) {
        console.log("[PathwayBuilder] No more resources can cover remaining skills");
        break;
      }

      const personalizedDuration = calculatePersonalizedDuration(
        bestResource,
        bestSkillsCovered
      );

      console.log(`[PathwayBuilder] Adding: ${bestResource.title}`);
      console.log(`[PathwayBuilder]   Covers ${bestSkillsCovered.length} skills in ${personalizedDuration} days`);

      pathway.push({
        resource: bestResource,
        skillsCovered: bestSkillsCovered,
        personalizedDuration,
      });

      remainingSkills = remainingSkills.filter(
        (skillId) => !bestSkillsCovered.includes(skillId)
      );
    }
  }

  console.log(`[PathwayBuilder] Balanced pathway complete: ${pathway.length} steps`);
  return pathway;
}


/**
 * STRATEGY 2: TRUE Fastest Timeline
 * Uses dynamic programming-like approach to find shortest path
 * Aims for: ABSOLUTE shortest total duration
 */
// function buildFastestPathway(resources, gapSkills, userPreferences) {
//   console.log("[PathwayBuilder] STRATEGY 2: TRUE Fastest Timeline Pathway");

//   let remainingSkills = [...gapSkills.allGapSkillIds];
//   console.log(`[PathwayBuilder] Initial skills to cover: ${remainingSkills.length}`);

//   // STEP 1: Prioritize courses (usually faster than internships/projects)
//   const grouped = groupResourcesByType(resources);
//   const courses = grouped.course || [];
//   const projects = grouped.project || [];
//   const internships = grouped.internship || [];

//   console.log(`[PathwayBuilder] Available: ${courses.length} courses, ${projects.length} projects, ${internships.length} internships`);

//   const pathway = [];

//   // STEP 2: First, try to cover maximum skills with SHORT courses
//   console.log("[PathwayBuilder] Phase 1: Selecting short, high-coverage courses");
  
//   const shortCourses = courses
//     .map(course => ({
//       resource: course,
//       skillsCovered: getSkillsCoveredByResource(course, remainingSkills),
//       personalizedDuration: 0 // Will calculate below
//     }))
//     .filter(c => c.skillsCovered.length > 0)
//     .map(c => {
//       c.personalizedDuration = calculatePersonalizedDuration(c.resource, c.skillsCovered);
//       return c;
//     })
//     .sort((a, b) => {
//       // Sort by: skills covered DESC, then duration ASC
//       if (a.skillsCovered.length !== b.skillsCovered.length) {
//         return b.skillsCovered.length - a.skillsCovered.length;
//       }
//       return a.personalizedDuration - b.personalizedDuration;
//     });

//   // Take top courses that cover most skills in least time
//   for (const course of shortCourses.slice(0, 4)) { // Max 4 courses
//     if (remainingSkills.length === 0) break;

//     const actualSkills = course.skillsCovered.filter(id => remainingSkills.includes(id));
//     if (actualSkills.length === 0) continue;

//     const actualDuration = calculatePersonalizedDuration(course.resource, actualSkills);

//     console.log(`[PathwayBuilder] Adding course: ${course.resource.title}`);
//     console.log(`[PathwayBuilder]   Skills: ${actualSkills.length}, Duration: ${actualDuration} days`);

//     pathway.push({
//       resource: course.resource,
//       skillsCovered: actualSkills,
//       personalizedDuration: actualDuration,
//     });

//     remainingSkills = remainingSkills.filter(id => !actualSkills.includes(id));
//   }

//   console.log(`[PathwayBuilder] After courses: ${remainingSkills.length} skills remaining`);

//   // STEP 3: If skills remain, add ONE short project (if available and needed)
//   if (remainingSkills.length > 0 && projects.length > 0) {
//     console.log("[PathwayBuilder] Phase 2: Checking for useful projects");

//     const usefulProjects = projects
//       .map(project => ({
//         resource: project,
//         skillsCovered: getSkillsCoveredByResource(project, remainingSkills),
//         personalizedDuration: parseFloat(project.total_duration) // Projects = full duration
//       }))
//       .filter(p => p.skillsCovered.length > 0)
//       .sort((a, b) => {
//         // Prioritize: more skills, shorter duration
//         const aRatio = a.skillsCovered.length / a.personalizedDuration;
//         const bRatio = b.skillsCovered.length / b.personalizedDuration;
//         return bRatio - aRatio;
//       });

//     if (usefulProjects.length > 0 && usefulProjects[0].skillsCovered.length >= 2) {
//       const project = usefulProjects[0];
      
//       console.log(`[PathwayBuilder] Adding project: ${project.resource.title}`);
//       console.log(`[PathwayBuilder]   Skills: ${project.skillsCovered.length}, Duration: ${project.personalizedDuration} days`);

//       pathway.push(project);
//       remainingSkills = remainingSkills.filter(id => !project.skillsCovered.includes(id));
//     }
//   }

//   console.log(`[PathwayBuilder] After projects: ${remainingSkills.length} skills remaining`);

//   // STEP 4: AVOID internships if possible (they're long)
//   // Only add if absolutely necessary AND covers many remaining skills
//   if (remainingSkills.length > 0 && internships.length > 0) {
//     console.log("[PathwayBuilder] Phase 3: Checking if internship necessary");

//     const usefulInternships = internships
//       .map(internship => ({
//         resource: internship,
//         skillsCovered: getSkillsCoveredByResource(internship, remainingSkills),
//         personalizedDuration: parseFloat(internship.total_duration)
//       }))
//       .filter(i => i.skillsCovered.length > 0)
//       .sort((a, b) => {
//         // Prefer internships covering most remaining skills
//         if (a.skillsCovered.length !== b.skillsCovered.length) {
//           return b.skillsCovered.length - a.skillsCovered.length;
//         }
//         return a.personalizedDuration - b.personalizedDuration; // Then shorter
//       });

//     // Only add internship if it covers at least 30% of remaining skills
//     if (usefulInternships.length > 0) {
//       const internship = usefulInternships[0];
//       const coverageRatio = internship.skillsCovered.length / remainingSkills.length;

//       if (coverageRatio >= 0.3 || remainingSkills.length <= 3) {
//         console.log(`[PathwayBuilder] Adding internship: ${internship.resource.title}`);
//         console.log(`[PathwayBuilder]   Skills: ${internship.skillsCovered.length}, Duration: ${internship.personalizedDuration} days`);
//         console.log(`[PathwayBuilder]   Coverage ratio: ${(coverageRatio * 100).toFixed(1)}%`);

//         pathway.push(internship);
//         remainingSkills = remainingSkills.filter(id => !internship.skillsCovered.includes(id));
//       } else {
//         console.log(`[PathwayBuilder] Skipping internship (only covers ${(coverageRatio * 100).toFixed(1)}% of remaining skills)`);
//       }
//     }
//   }

//   console.log(`[PathwayBuilder] After internships: ${remainingSkills.length} skills remaining`);

//   // STEP 5: If still have gaps, fill with shortest available resources
//   if (remainingSkills.length > 0) {
//     console.log("[PathwayBuilder] Phase 4: Filling final gaps with shortest resources");
    
//     const allAvailable = resources
//       .filter(r => !pathway.some(step => step.resource.resource_id === r.resource_id))
//       .map(r => ({
//         resource: r,
//         skillsCovered: getSkillsCoveredByResource(r, remainingSkills),
//         personalizedDuration: 0
//       }))
//       .filter(r => r.skillsCovered.length > 0)
//       .map(r => {
//         r.personalizedDuration = calculatePersonalizedDuration(r.resource, r.skillsCovered);
//         return r;
//       })
//       .sort((a, b) => a.personalizedDuration - b.personalizedDuration); // Shortest first

//     for (const item of allAvailable.slice(0, 2)) {
//       if (remainingSkills.length === 0) break;

//       const actualSkills = item.skillsCovered.filter(id => remainingSkills.includes(id));
//       if (actualSkills.length === 0) continue;

//       const actualDuration = calculatePersonalizedDuration(item.resource, actualSkills);

//       console.log(`[PathwayBuilder] Gap filler: ${item.resource.title}`);
//       console.log(`[PathwayBuilder]   Skills: ${actualSkills.length}, Duration: ${actualDuration} days`);

//       pathway.push({
//         resource: item.resource,
//         skillsCovered: actualSkills,
//         personalizedDuration: actualDuration,
//       });

//       remainingSkills = remainingSkills.filter(id => !actualSkills.includes(id));
//     }
//   }

//   const totalDuration = pathway.reduce((sum, step) => sum + step.personalizedDuration, 0);
//   console.log(`[PathwayBuilder] Fastest pathway complete: ${pathway.length} steps, ${totalDuration.toFixed(2)} days total`);
//   console.log(`[PathwayBuilder] Uncovered skills: ${remainingSkills.length}`);

//   return pathway;
// }

/**
 * STRATEGY 2: TRUE Fastest Timeline
 * Uses dynamic programming-like approach to find shortest path
 * Aims for: ABSOLUTE shortest total duration
 */
function buildFastestPathway(resources, gapSkills, userPreferences) {
  console.log("[PathwayBuilder] STRATEGY 2: TRUE Fastest Timeline Pathway");

  let remainingSkills = [...gapSkills.allGapSkillIds];
  console.log(`[PathwayBuilder] Initial skills to cover: ${remainingSkills.length}`);

  // STEP 1: Prioritize courses (usually faster than internships/projects)
  const grouped = groupResourcesByType(resources);
  const courses = grouped.course || [];
  const projects = grouped.project || [];
  const internships = grouped.internship || [];

  console.log(`[PathwayBuilder] Available: ${courses.length} courses, ${projects.length} projects, ${internships.length} internships`);

  const pathway = [];

  // STEP 2: First, try to cover maximum skills with SHORT courses
  console.log("[PathwayBuilder] Phase 1: Selecting short, high-coverage courses");
  
  const shortCourses = courses
    .map(course => ({
      resource: course,
      skillsCovered: getSkillsCoveredByResource(course, remainingSkills),
      personalizedDuration: 0 // Will calculate below
    }))
    .filter(c => c.skillsCovered.length > 0)
    .map(c => {
      c.personalizedDuration = calculatePersonalizedDuration(c.resource, c.skillsCovered);
      return c;
    })
    .sort((a, b) => {
      // Sort by: skills covered DESC, then duration ASC
      if (a.skillsCovered.length !== b.skillsCovered.length) {
        return b.skillsCovered.length - a.skillsCovered.length;
      }
      return a.personalizedDuration - b.personalizedDuration;
    });

  // Take top courses that cover most skills in least time
  for (const course of shortCourses.slice(0, 4)) { // Max 4 courses
    if (remainingSkills.length === 0) break;

    const actualSkills = course.skillsCovered.filter(id => remainingSkills.includes(id));
    if (actualSkills.length === 0) continue;

    const actualDuration = calculatePersonalizedDuration(course.resource, actualSkills);

    console.log(`[PathwayBuilder] Adding course: ${course.resource.title}`);
    console.log(`[PathwayBuilder]   Skills: ${actualSkills.length}, Duration: ${actualDuration} days`);

    pathway.push({
      resource: course.resource,
      skillsCovered: actualSkills,
      personalizedDuration: actualDuration,
    });

    remainingSkills = remainingSkills.filter(id => !actualSkills.includes(id));
  }

  console.log(`[PathwayBuilder] After courses: ${remainingSkills.length} skills remaining`);

  // STEP 3: If skills remain, add ONE short project (if available and needed)
  if (remainingSkills.length > 0 && projects.length > 0) {
    console.log("[PathwayBuilder] Phase 2: Checking for useful projects");

    const usefulProjects = projects
      .map(project => ({
        resource: project,
        skillsCovered: getSkillsCoveredByResource(project, remainingSkills),
        personalizedDuration: parseFloat(project.total_duration) // Projects = full duration
      }))
      .filter(p => p.skillsCovered.length > 0)
      .sort((a, b) => {
        // Prioritize: more skills, shorter duration
        const aRatio = a.skillsCovered.length / a.personalizedDuration;
        const bRatio = b.skillsCovered.length / b.personalizedDuration;
        return bRatio - aRatio;
      });

    if (usefulProjects.length > 0 && usefulProjects[0].skillsCovered.length >= 2) {
      const project = usefulProjects[0];
      
      console.log(`[PathwayBuilder] Adding project: ${project.resource.title}`);
      console.log(`[PathwayBuilder]   Skills: ${project.skillsCovered.length}, Duration: ${project.personalizedDuration} days`);

      pathway.push(project);
      remainingSkills = remainingSkills.filter(id => !project.skillsCovered.includes(id));
    }
  }

  console.log(`[PathwayBuilder] After projects: ${remainingSkills.length} skills remaining`);

  // STEP 4: AVOID internships if possible (they're long)
  // Only add if absolutely necessary AND covers many remaining skills
  if (remainingSkills.length > 0 && internships.length > 0) {
    console.log("[PathwayBuilder] Phase 3: Checking if internship necessary");

    const usefulInternships = internships
      .map(internship => ({
        resource: internship,
        skillsCovered: getSkillsCoveredByResource(internship, remainingSkills),
        personalizedDuration: parseFloat(internship.total_duration)
      }))
      .filter(i => i.skillsCovered.length > 0)
      .sort((a, b) => {
        // Prefer internships covering most remaining skills
        if (a.skillsCovered.length !== b.skillsCovered.length) {
          return b.skillsCovered.length - a.skillsCovered.length;
        }
        return a.personalizedDuration - b.personalizedDuration; // Then shorter
      });

    // Only add internship if it covers at least 30% of remaining skills
    if (usefulInternships.length > 0) {
      const internship = usefulInternships[0];
      const coverageRatio = internship.skillsCovered.length / remainingSkills.length;

      if (coverageRatio >= 0.3 || remainingSkills.length <= 3) {
        console.log(`[PathwayBuilder] Adding internship: ${internship.resource.title}`);
        console.log(`[PathwayBuilder]   Skills: ${internship.skillsCovered.length}, Duration: ${internship.personalizedDuration} days`);
        console.log(`[PathwayBuilder]   Coverage ratio: ${(coverageRatio * 100).toFixed(1)}%`);

        pathway.push(internship);
        remainingSkills = remainingSkills.filter(id => !internship.skillsCovered.includes(id));
      } else {
        console.log(`[PathwayBuilder] Skipping internship (only covers ${(coverageRatio * 100).toFixed(1)}% of remaining skills)`);
      }
    }
  }

  console.log(`[PathwayBuilder] After internships: ${remainingSkills.length} skills remaining`);

  // STEP 5: If still have gaps, fill with shortest available resources
  if (remainingSkills.length > 0) {
    console.log("[PathwayBuilder] Phase 4: Filling final gaps with shortest resources");
    
    const allAvailable = resources
      .filter(r => !pathway.some(step => step.resource.resource_id === r.resource_id))
      .map(r => ({
        resource: r,
        skillsCovered: getSkillsCoveredByResource(r, remainingSkills),
        personalizedDuration: 0
      }))
      .filter(r => r.skillsCovered.length > 0)
      .map(r => {
        r.personalizedDuration = calculatePersonalizedDuration(r.resource, r.skillsCovered);
        return r;
      })
      .sort((a, b) => a.personalizedDuration - b.personalizedDuration); // Shortest first

    for (const item of allAvailable.slice(0, 2)) {
      if (remainingSkills.length === 0) break;

      const actualSkills = item.skillsCovered.filter(id => remainingSkills.includes(id));
      if (actualSkills.length === 0) continue;

      const actualDuration = calculatePersonalizedDuration(item.resource, actualSkills);

      console.log(`[PathwayBuilder] Gap filler: ${item.resource.title}`);
      console.log(`[PathwayBuilder]   Skills: ${actualSkills.length}, Duration: ${actualDuration} days`);

      pathway.push({
        resource: item.resource,
        skillsCovered: actualSkills,
        personalizedDuration: actualDuration,
      });

      remainingSkills = remainingSkills.filter(id => !actualSkills.includes(id));
    }
  }

  const totalDuration = pathway.reduce((sum, step) => sum + step.personalizedDuration, 0);
  console.log(`[PathwayBuilder] Fastest pathway complete: ${pathway.length} steps, ${totalDuration.toFixed(2)} days total`);
  console.log(`[PathwayBuilder] Uncovered skills: ${remainingSkills.length}`);

  return pathway;
}

/**
 * Helper: Fill remaining skill gaps
 */
function fillRemainingGaps(pathway, remainingSkills, resources, maxToAdd) {
  let added = 0;

  const availableResources = resources
    .filter((r) => !pathway.some((step) => step.resource.resource_id === r.resource_id))
    .sort((a, b) => (b.calculatedScore || 0) - (a.calculatedScore || 0));

  for (const resource of availableResources) {
    if (remainingSkills.length === 0 || added >= maxToAdd) break;

    const skillsCovered = getSkillsCoveredByResource(resource, remainingSkills);

    if (skillsCovered.length > 0) {
      const personalizedDuration = calculatePersonalizedDuration(resource, skillsCovered);

      console.log(`[PathwayBuilder] Gap filler: ${resource.title} (${skillsCovered.length} skills)`);

      pathway.push({
        resource,
        skillsCovered,
        personalizedDuration,
      });

      remainingSkills = remainingSkills.filter((skillId) => !skillsCovered.includes(skillId));
      added++;
    }
  }

  console.log(`[PathwayBuilder] Filled gaps with ${added} resources`);
}

function findBestResourceForSkills(resources, remainingSkills) {
  let bestResource = null;
  let maxCoverage = 0;

  for (const resource of resources) {
    const skillsCovered = getSkillsCoveredByResource(resource, remainingSkills);

    if (skillsCovered.length > maxCoverage) {
      maxCoverage = skillsCovered.length;
      bestResource = resource;
    }
  }

  return bestResource;
}

module.exports = {
  buildPreferenceHeavyPathway,
  buildFastestPathway,
  buildBalancedPathway,
  findBestResourceForSkills
};