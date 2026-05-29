// services/pathwayGeneration/graphBuilder.js

const {
  generateStateHash,
  stateSatisfiesTarget,
  deepClone,
} = require("./helpers");
const { GENERATION_LIMITS } = require("./config");

/**
 * Check if user is eligible for an opportunity based on current state and user category
 */
function isEligible(
  opportunity,
  currentState,
  userCategory,
  totalUserExp,
  eligibilityRules
) {


  const oppType = opportunity.type;

  // Check if blocked
  if (eligibilityRules.blocked_opportunity_types.includes(oppType)) {
    return false;
  }

  // Check if allowed
  if (!eligibilityRules.allowed_opportunity_types.includes(oppType)) {
    return false;
  }

  // Check prerequisites
  for (const prereq of opportunity.prerequisites) {
    const userExp = currentState.skills[prereq.skill_id] || 0;
    if (userExp === 0) {
      return false; // Missing prerequisite
    }
  }

  return true;
}

/**
 * Apply an opportunity to a state (returns new state)
 */
function applyOpportunity(currentState, opportunity) {
  const newState = deepClone(currentState);

  // Add skills and experience from this opportunity
  opportunity.skills_provided.forEach((skill) => {
    const currentExp = newState.skills[skill.skill_id] || 0;
    newState.skills[skill.skill_id] = currentExp + skill.experience_months;
  });

  // Update total experience
  newState.total_experience += opportunity.duration_months;

  // Generate new hash
  newState.hash = generateStateHash(newState.skills);

  return newState;
}

/**
 * Build graph of state transitions
 */
function buildGraph(
  startState,
  targetRequirements,
  opportunities,
  userCategory,
  eligibilityRules
) {
  const states = new Map(); // hash -> state
  const edges = []; // {from, to, opportunity}
  const goalStates = new Set(); // hashes of states that satisfy target

  states.set(startState.hash, startState);

  const queue = [startState];
  const visited = new Set([startState.hash]);

  let iterations = 0;
  const maxIterations = GENERATION_LIMITS.max_graph_states;

  while (queue.length > 0 && iterations < maxIterations) {
    iterations++;
    const currentState = queue.shift();

    // Check if this is a goal state
    if (stateSatisfiesTarget(currentState, targetRequirements)) {
      goalStates.add(currentState.hash);
      // Continue to explore for variations
    }

    // Try each opportunity
    for (const opp of opportunities) {
      // Check eligibility dynamically
      if (
        !isEligible(
          opp,
          currentState,
          userCategory,
          currentState.total_experience,
          eligibilityRules
        )
      ) {
        continue;
      }

      // Apply opportunity
      const nextState = applyOpportunity(currentState, opp);

      // Add edge
      edges.push({
        from: currentState.hash,
        to: nextState.hash,
        opportunity: opp,
      });

      // Add to states if new
      if (!states.has(nextState.hash)) {
        states.set(nextState.hash, nextState);
      }

      // Add to queue if not visited (allow revisits for variations)
      if (!visited.has(nextState.hash) && states.size < maxIterations) {
        visited.add(nextState.hash);
        queue.push(nextState);
      }
    }
  }

  return {
    states,
    edges,
    goalStates: Array.from(goalStates),
  };
}

module.exports = {
  buildGraph,
};
