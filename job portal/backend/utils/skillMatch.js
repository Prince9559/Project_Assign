
/**
 * Skill Matching Utility — Strict Mode (Must-Have Mandatory)
 *
 * Current behavior:
 *   - If ANY must-have skill is missing → matchPercentage = 0
 *   - If ALL must-have skills are present → matchPercentage = % of preferred skills matched
 *   - If no skills defined → 100%
 *
 * Future-proof: Add new strategies and switch via `CURRENT_STRATEGY`.
 *
 * @module skillMatch
 */

// === Normalization Functions ===

/**
 * Normalize job skill input to standardized format.
 * Accepts multiple input shapes (Sequelize raw, objects, strings).
 *
 * @param {Array} jobSkillsInput - Raw job skills from DB or API
 * @param {Object} [skillMap] - Optional mapping: { skill_id: "skill name" }
 * @returns {Array<{name: string, type: 'must_have'|'preferred'>}
 */
function normalizeJobSkills(jobSkillsInput, skillMap = {}) {
  if (!Array.isArray(jobSkillsInput)) {
    console.warn('normalizeJobSkills: input is not an array — returning empty');
    return [];
  }

  return jobSkillsInput
    .map((s) => {
      //  Handle Sequelize raw output: { type, Skill: { skill_id, skill_name } }
      if (s && s.Skill && typeof s.Skill.skill_id === "number") {
        const name = skillMap[s.Skill.skill_id] || s.Skill.skill_name || "";
        return {
          name: name.trim().toLowerCase(),
          type: (s.type || "preferred").toLowerCase(),
        };
      }

      // Handle: { skill_id, type } (e.g., from manual object)
      if (s && s.skill_id && typeof s.skill_id === "number") {
        const name =
          skillMap[s.skill_id] ||
          s.Skill?.skill_name ||
          s.skill?.skill_name ||
          "";
        return {
          name: name.trim().toLowerCase(),
          type: (s.type || "preferred").toLowerCase(),
        };
      }

      // Handle raw Sequelize result with Skill association
      // if (s && s.skill_id && typeof s.skill_id === "number") {
      //   let name = "";
      //   if (skillMap[s.skill_id]) {
      //     name = skillMap[s.skill_id];
      //   } else if (s.Skill && typeof s.Skill.skill_name === "string") {
      //     name = s.Skill.skill_name;
      //   } else if (s.skill && typeof s.skill.skill_name === "string") {
      //     name = s.skill.skill_name;
      //   }
      //   return {
      //     name: name.trim().toLowerCase(),
      //     type: (s.type || "preferred").toLowerCase(),
      //   };
      // }

      // Handle { skill_name, type }
      if (s && typeof s.skill_name === "string") {
        return {
          name: s.skill_name.trim().toLowerCase(),
          type: (s.type || "preferred").toLowerCase(),
        };
      }

      // Handle plain string (assumes 'preferred')
      if (typeof s === "string" && s.trim()) {
        return {
          name: s.trim().toLowerCase(),
          type: "preferred",
        };
      }

      // Handle { name, type }
      if (s && typeof s.name === "string") {
        return {
          name: s.name.trim().toLowerCase(),
          type: (s.type || "preferred").toLowerCase(),
        };
      }

      // Invalid/skippable entry
      return null;
    })
    .filter(Boolean)
    .filter((item) => typeof item.name === 'string' && item.name.length > 0);
}

/**
 * Normalize user skill input to a Set of lower-case skill names.
 *
 * @param {Array} userSkillsInput - User skills from DB (UserSkill + Skill join)
 * @returns {Set<string>}
 */
function normalizeUserSkills(userSkillsInput) {
  if (!Array.isArray(userSkillsInput)) {
    console.warn('normalizeUserSkills: input is not an array — returning empty Set');
    return new Set();
  }

  const skillNames = userSkillsInput
    .map((s) => {
      if (typeof s === 'string') return s.trim();
      if (s && typeof s.skill_name === 'string') return s.skill_name.trim();
      if (s && s.Skill && typeof s.Skill.skill_name === 'string')
        return s.Skill.skill_name.trim();
      if (s && typeof s.name === 'string') return s.name.trim();
      return '';
    })
    .filter(Boolean)
    .map((name) => name.toLowerCase());

  return new Set(skillNames);
}

// === Strategy: STRICT (Your Current Logic) ===

/**
 * Strict skill matching strategy.
 * Must-have skills are mandatory; match % is based only on preferred skills.
 */
const STRICT_STRATEGY = {
  name: 'strict',

  /**
   * Compute skill match.
   *
   * @param {Array<{name: string, type: string}>} jobSkills - Normalized job skills
   * @param {Set<string>} userSkillSet - Normalized user skills
   * @returns {Object} Result with matchPercentage, passedMustHave, and detailed breakdown
   */
  compute(jobSkills, userSkillSet) {
    // Edge: no skills required → perfect match

    if (jobSkills.length === 0) {
      return {
        matchPercentage: 100,
        passedMustHave: true,
        details: {
          mustHave: {
            required: [],
            matched: [],
            missing: [],
            count: { required: 0, matched: 0, missing: 0 },
          },
          preferred: {
            required: [],
            matched: [],
            missing: [],
            count: { required: 0, matched: 0, missing: 0 },
          },
          overall: {
            matched: [],
            missing: [],
            count: { matched: 0, missing: 0, total: 0 },
          },
        },
      };
    }

    // Partition job skills
    const mustHave = jobSkills.filter((s) => s.type === 'must_have');
    const preferred = jobSkills.filter((s) => s.type === 'preferred');

    // Evaluate must-have
    const matchedMustHave = mustHave.filter((s) => userSkillSet.has(s.name));
    const missingMustHave = mustHave.filter((s) => !userSkillSet.has(s.name));
    const passedMustHave = missingMustHave.length === 0 ;

    // Evaluate preferred
    const matchedPreferred = preferred.filter((s) => userSkillSet.has(s.name));
    const missingPreferred = preferred.filter((s) => !userSkillSet.has(s.name));

    // Compute percentage
    let matchPercentage = 0;
    if (passedMustHave) {
      if (preferred.length === 0) {
        matchPercentage = 100; // no preferred → full match
      } else {
        matchPercentage = Math.round((matchedPreferred.length / preferred.length) * 100);
      }
    }
    // else remains 0 (missing ≥1 must-have)

    // Clamp to [0, 100]
    matchPercentage = Math.max(0, Math.min(100, matchPercentage));

    // Build detailed breakdown
    const details = {
      mustHave: {
        required: mustHave.map((s) => s.name),
        matched: matchedMustHave.map((s) => s.name),
        missing: missingMustHave.map((s) => s.name),
        count: {
          required: mustHave.length,
          matched: matchedMustHave.length,
          missing: missingMustHave.length,
        },
      },
      preferred: {
        required: preferred.map((s) => s.name),
        matched: matchedPreferred.map((s) => s.name),
        missing: missingPreferred.map((s) => s.name),
        count: {
          required: preferred.length,
          matched: matchedPreferred.length,
          missing: missingPreferred.length,
        },
      },
      overall: {
        matched: [...matchedMustHave, ...matchedPreferred].map((s) => s.name),
        missing: [...missingMustHave, ...missingPreferred].map((s) => s.name),
        count: {
          matched: matchedMustHave.length + matchedPreferred.length,
          missing: missingMustHave.length + missingPreferred.length,
          total: jobSkills.length,
        },
      },
    };

    return {
      matchPercentage,
      passedMustHave,
      details,
    };
  },
};

// === Placeholder: WEIGHTED Strategy (for future use) ===

const WEIGHTED_STRATEGY = {
  name: 'weighted',
  compute(jobSkills, userSkillSet, options = {}) {
    const { weightMustHave = 0.7, weightPreferred = 0.3 } = options;

    if (jobSkills.length === 0) {
      return {
        matchPercentage: 100,
        passedMustHave: true,
        details: {
          mustHave: { required: [], matched: [], missing: [], count: { required: 0, matched: 0, missing: 0 } },
          preferred: { required: [], matched: [], missing: [], count: { required: 0, matched: 0, missing: 0 } },
          overall: { matched: [], missing: [], count: { matched: 0, missing: 0, total: 0 } },
        },
      };
    }

    const mustHave = jobSkills.filter((s) => s.type === 'must_have');
    const preferred = jobSkills.filter((s) => s.type === 'preferred');

    const matchedMustHave = mustHave.filter((s) => userSkillSet.has(s.name));
    const matchedPreferred = preferred.filter((s) => userSkillSet.has(s.name));

    const mustHaveScore =
      mustHave.length === 0
        ? weightMustHave * 100
        : (matchedMustHave.length / mustHave.length) * 100 * weightMustHave;

    const preferredScore =
      preferred.length === 0
        ? weightPreferred * 100
        : (matchedPreferred.length / preferred.length) * 100 * weightPreferred;

    const matchPercentage = Math.round(mustHaveScore + preferredScore);
    const passedMustHave = matchedMustHave.length === mustHave.length;

    // Reuse detail builder (in real app, extract to helper to avoid duplication)
    const missingMustHave = mustHave.filter((s) => !userSkillSet.has(s.name));
    const missingPreferred = preferred.filter((s) => !userSkillSet.has(s.name));

    const details = {
      mustHave: {
        required: mustHave.map((s) => s.name),
        matched: matchedMustHave.map((s) => s.name),
        missing: missingMustHave.map((s) => s.name),
        count: {
          required: mustHave.length,
          matched: matchedMustHave.length,
          missing: missingMustHave.length,
        },
      },
      preferred: {
        required: preferred.map((s) => s.name),
        matched: matchedPreferred.map((s) => s.name),
        missing: missingPreferred.map((s) => s.name),
        count: {
          required: preferred.length,
          matched: matchedPreferred.length,
          missing: missingPreferred.length,
        },
      },
      overall: {
        matched: [...matchedMustHave, ...matchedPreferred].map((s) => s.name),
        missing: [...missingMustHave, ...missingPreferred].map((s) => s.name),
        count: {
          matched: matchedMustHave.length + matchedPreferred.length,
          missing: missingMustHave.length + missingPreferred.length,
          total: jobSkills.length,
        },
      },
    };

    return {
      matchPercentage: Math.max(0, Math.min(100, matchPercentage)),
      passedMustHave,
      details,
    };
  },
};

// === Strategy Registry & Active Strategy ===

const STRATEGIES = {
  strict: STRICT_STRATEGY,
  weighted: WEIGHTED_STRATEGY,
};

//  CHANGE THIS TO SWITCH GLOBAL BEHAVIOR
let CURRENT_STRATEGY = STRATEGIES.strict;

/**
 * Set active strategy globally (e.g., for A/B testing or per-tenant config).
 * @param {string|Object} strategy - Strategy name ('strict') or strategy object
 */
function setStrategy(strategy) {
  if (typeof strategy === 'string') {
    if (!STRATEGIES[strategy]) {
      throw new Error(
        `Unknown strategy: ${strategy}. Available: ${Object.keys(STRATEGIES).join(', ')}`
      );
    }
    CURRENT_STRATEGY = STRATEGIES[strategy];
  } else if (strategy && typeof strategy.compute === 'function') {
    CURRENT_STRATEGY = strategy;
  } else {
    throw new Error('Invalid strategy: must be a name or object with `compute` method');
  }
}

// === Public API (Stable Interfaces) ===

/**
 * Calculate skill match percentage only.
 * @param {Array} jobSkillsInput
 * @param {Array} userSkillsInput
 * @param {Object} [options]
 * @param {Object} [options.skillMap]
 * @param {string} [options.strategy] - Override global strategy ('strict', 'weighted')
 * @returns {number} 0–100, or 100 if no skills
 */
function calculateSkillMatch(jobSkillsInput, userSkillsInput, options = {}) {
  const { strategy: strategyName, ...rest } = options;

  const strategy = strategyName
    ? STRATEGIES[strategyName] || CURRENT_STRATEGY
    : CURRENT_STRATEGY;

  try {
    const jobSkills = normalizeJobSkills(jobSkillsInput, rest.skillMap);
    const userSkillSet = normalizeUserSkills(userSkillsInput);
    const { matchPercentage } = strategy.compute(jobSkills, userSkillSet, rest);
    return matchPercentage;
  } catch (error) {
    console.error('calculateSkillMatch failed:', error);
    return 0; // safe fallback
  }
}

/**
 * Get detailed skill match breakdown.
 * @param {Array} jobSkillsInput
 * @param {Array} userSkillsInput
 * @param {Object} [options]
 * @param {Object} [options.skillMap]
 * @param {string} [options.strategy]
 * @returns {Object} Full match object
 */
function getDetailedSkillMatch(jobSkillsInput, userSkillsInput, options = {}) {
  const { strategy: strategyName, ...rest } = options;

  const strategy = strategyName
    ? STRATEGIES[strategyName] || CURRENT_STRATEGY
    : CURRENT_STRATEGY;

  try {
    const jobSkills = normalizeJobSkills(jobSkillsInput, rest.skillMap);
    const userSkillSet = normalizeUserSkills(userSkillsInput);
    const { matchPercentage, passedMustHave, details } = strategy.compute(
      jobSkills,
      userSkillSet,
      rest
    );


    return {
      matchPercentage,
      passedMustHave,
      mustHave: details.mustHave,
      preferred: details.preferred,
      overall: details.overall,
      mandatorySkillsMet: passedMustHave,
      preferredMatchPercentage:matchPercentage,
  // preferredMatchPercentage: preferred.length === 0 ? 100 : Math.round((matchedPreferred.length / preferred.length) * 100),
    };
  } catch (error) {
    console.error('getDetailedSkillMatch failed:', error);
    return {
      matchPercentage: 0,
      passedMustHave: false,
      mustHave: {
        required: [],
        matched: [],
        missing: [],
        count: { required: 0, matched: 0, missing: 0 },
      },
      preferred: {
        required: [],
        matched: [],
        missing: [],
        count: { required: 0, matched: 0, missing: 0 },
      },
      overall: {
        matched: [],
        missing: [],
        count: { matched: 0, missing: 0, total: 0 },
      },
      mandatorySkillsMet: false,
      preferredMatchPercentage:0,
    };
  }
}

// === Exports ===

module.exports = {
  // Primary interfaces (use these)
  calculateSkillMatch,
  getDetailedSkillMatch,

  // For testing, debugging, or advanced use
  normalizeJobSkills,
  normalizeUserSkills,
  setStrategy,

  // Strategy registry (for explicit use)
  STRATEGIES,
  STRICT_STRATEGY,
  WEIGHTED_STRATEGY,
};