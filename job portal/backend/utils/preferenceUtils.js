// backend/utils/preferenceUtils.js

/**
 * User Preference Management Utilities
 * Handles user pathway preferences
*/

const db = require("../models");
const { UserPathwayPreference } = db;

/**
 * Get user preferences (create default if not exists)
 * @param {Number} userId
 * @returns {Object} - User preferences
 */
async function getUserPreferences(userId) {
  let preferences = await UserPathwayPreference.findOne({
    where: { user_id: userId },
  });

  // Create default preferences if not exist
  if (!preferences) {
    preferences = await UserPathwayPreference.create({
      user_id: userId,
      resource_priority: [ "project","internship", "course"],
      max_timeline: 30, // 26 weeks in days
      min_timeline: 1, // 4 weeks in days
    });
  }

  return preferences;
}

/**
 * Update user preferences
 * @param {Number} userId
 * @param {Object} updates - { resource_priority, max_timeline, min_timeline }
 * @returns {Object} - Updated preferences
 */
async function updateUserPreferences(userId, updates) {
  const [preferences, created] = await UserPathwayPreference.findOrCreate({
    where: { user_id: userId },
    defaults: {
      user_id: userId,
      resource_priority: ["internship", "project", "course"],
      max_timeline: 365,
      min_timeline: 1,
    },
  });

  // Update fields
  if (updates.resource_priority) {
    preferences.resource_priority = updates.resource_priority;
  }

  if (updates.max_timeline !== undefined) {
    preferences.max_timeline = updates.max_timeline;
  }

  if (updates.min_timeline !== undefined) {
    preferences.min_timeline = updates.min_timeline;
  }

  await preferences.save();

  return preferences;
}

/**
 * Validate preference data
 * @param {Object} preferences
 * @returns {Object} - { valid: boolean, errors: [] }
 */
function validatePreferences(preferences) {
  const errors = [];

  // Validate resource_priority
  if (preferences.resource_priority) {
    const validTypes = ["internship", "project", "course"];
    const priority = preferences.resource_priority;

    if (!Array.isArray(priority)) {
      errors.push("resource_priority must be an array");
    } else {
      const invalidTypes = priority.filter((type) => !validTypes.includes(type));
      if (invalidTypes.length > 0) {
        errors.push(`Invalid resource types: ${invalidTypes.join(", ")}`);
      }
    }
  }

  // Validate timeline
  if (preferences.max_timeline !== undefined) {
    if (preferences.max_timeline < 7) {
      errors.push("max_timeline must be at least 7 days");
    }
    if (preferences.max_timeline > 365) {
      errors.push("max_timeline cannot exceed 365 days");
    }
  }

  if (preferences.min_timeline !== undefined) {
    if (preferences.min_timeline < 1) {
      errors.push("min_timeline must be at least 1 day");
    }
  }

  // Check min < max
  if (
    preferences.min_timeline !== undefined &&
    preferences.max_timeline !== undefined
  ) {
    if (preferences.min_timeline >= preferences.max_timeline) {
      errors.push("min_timeline must be less than max_timeline");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get default preferences
 * @returns {Object}
 */
function getDefaultPreferences() {
  return {
    resource_priority: ["internship", "project", "course"],
    max_timeline: 365, // 26 weeks thinking off will do
    min_timeline: 1, // 4 weeks
  };
}

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  validatePreferences,
  getDefaultPreferences,
};