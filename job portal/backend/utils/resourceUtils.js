//  /backend/utils/resourceUtils.js
/**
 * Resource Management Utility Functions
 * Handles resource filtering, sorting, validation
 */

/**
 * Filter resources by availability and timeline constraints
 * @param {Array} resources - Array of LearningResource objects
 * @param {Object} constraints - { maxDays, minDays, includeInactive }
 * @returns {Array} - Filtered resources
 */
function filterResourcesByConstraints(resources, constraints = {}) {
  const {
    maxDays = null,
    minDays = null,
    includeInactive = false,
  } = constraints;

  return resources.filter((resource) => {
    // Active status check
    if (!includeInactive && !resource.is_active) {
      return false;
    }

    // Timeline constraints
    const duration = parseFloat(resource.total_duration);

    if (maxDays !== null && duration > maxDays) {
      return false;
    }

    if (minDays !== null && duration < minDays) {
      return false;
    }

    return true;
  });
}

/**
 * Group resources by type
 * @param {Array} resources - Array of resources
 * @returns {Object} - { internship: [], project: [], course: [] }
 */
function groupResourcesByType(resources) {
  return {
    internship: resources.filter((r) => r.resource_type === "internship"),
    project: resources.filter((r) => r.resource_type === "project"),
    course: resources.filter((r) => r.resource_type === "course"),
    job: resources.filter((r) => r.resource_type === "job"),
  };
}

/**
 * Sort resources by score (descending)
 * @param {Array} resources - Resources with calculatedScore property
 * @returns {Array} - Sorted resources
 */
function sortResourcesByScore(resources) {
  return [...resources].sort((a, b) => {
    return (b.calculatedScore || 0) - (a.calculatedScore || 0);
  });
}

/**
 * Sort resources by efficiency (skills per day)
 * @param {Array} resources - Resources with resourceSkills
 * @returns {Array} - Sorted resources
 */
function sortResourcesByEfficiency(resources) {
  return [...resources].sort((a, b) => {
    const aEff = a.resourceSkills.length / parseFloat(a.total_duration);
    const bEff = b.resourceSkills.length / parseFloat(b.total_duration);
    return bEff - aEff;
  });
}

/**
 * Sort resources by user preference order
 * @param {Array} resources
 * @param {Array} priorityOrder - e.g., ['internship', 'project', 'course']
 * @returns {Array} - Sorted resources
 */
function sortResourcesByPreference(resources, priorityOrder) {
  return [...resources].sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.resource_type);
    const bIndex = priorityOrder.indexOf(b.resource_type);

    // If same type, maintain original order
    if (aIndex === bIndex) return 0;

    // Unknown types go to end
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });
}

/**
 * Remove duplicate resources (same job_post_id or same skills)
 * @param {Array} resources
 * @returns {Array} - Deduplicated resources
 */
function deduplicateResources(resources) {
  const seen = new Set();
  const result = [];

  for (const resource of resources) {
    // Check by job_post_id for internal resources
    if (resource.job_post_id) {
      if (seen.has(`job_${resource.job_post_id}`)) continue;
      seen.add(`job_${resource.job_post_id}`);
    }

    // Check by external_resource_id for external resources
    if (resource.external_resource_id) {
      const key = `ext_${resource.external_provider_name}_${resource.external_resource_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
    }

    result.push(resource);
  }

  return result;
}

/**
 * Get top N resources by score
 * @param {Array} resources - Resources with calculatedScore
 * @param {Number} n - Number of resources to return
 * @returns {Array}
 */
function getTopResources(resources, n = 10) {
  return sortResourcesByScore(resources).slice(0, n);
}

/**
 * Validate if resource can be included in pathway
 * @param {Object} resource
 * @param {Object} constraints
 * @returns {Boolean}
 */
function isResourceValid(resource, constraints = {}) {
  const { maxDays = Infinity, requiredSkills = [] } = constraints;

  // Check duration
  if (parseFloat(resource.total_duration) > maxDays) {
    return false;
  }

  // Check if resource teaches at least one required skill
  if (requiredSkills.length > 0) {
    const resourceSkillIds = resource.resourceSkills.map((rs) => rs.skill_id);
    const hasRequiredSkill = requiredSkills.some((skillId) =>
      resourceSkillIds.includes(skillId)
    );

    if (!hasRequiredSkill) {
      return false;
    }
  }

  return true;
}

/**
 * Get resource metadata for display
 * @param {Object} resource
 * @returns {Object}
 */
function getResourceMetadata(resource) {
  return {
    resource_id: resource.resource_id,
    type: resource.resource_type,
    title: resource.title,
    duration_days: parseFloat(resource.total_duration),
    duration_weeks: parseFloat((resource.total_duration / 7).toFixed(1)),
    difficulty: resource.difficulty_level,
    skills_count: resource.resourceSkills?.length || 0,
    rating: resource.rating ? parseFloat(resource.rating) : null,
    is_internal: resource.source_type === "internal",
  };
}

module.exports = {
  filterResourcesByConstraints,
  groupResourcesByType,
  sortResourcesByScore,
  sortResourcesByEfficiency,
  sortResourcesByPreference,
  deduplicateResources,
  getTopResources,
  isResourceValid,
  getResourceMetadata,
};
