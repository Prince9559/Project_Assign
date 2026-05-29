// controllers/pathwayController.js

const { generatePathways } = require('../services/pathwayGeneration/pathwayService');

/**
 * POST /api/pathways/generate
 * Generate learning pathways for a user
 */
exports.generatePathways = async (req, res) => {
  try {
    const { user_id, target_type, target_id, target_role, user_preferences } = req.body;
    
    // Validation
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required',
      });
    }
    
    if (!target_type || !['job_specific', 'role_specific'].includes(target_type)) {
      return res.status(400).json({
        success: false,
        message: 'target_type must be either job_specific or role_specific',
      });
    }
    
    if (target_type === 'job_specific' && !target_id) {
      return res.status(400).json({
        success: false,
        message: 'target_id is required for job_specific targeting',
      });
    }
    
    if (target_type === 'role_specific' && !target_role) {
      return res.status(400).json({
        success: false,
        message: 'target_role is required for role_specific targeting',
      });
    }
    
    // Generate pathways
    const result = await generatePathways(
      user_id,
      target_type,
      target_id,
      target_role,
      user_preferences
    );
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error in generatePathways controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * GET /api/pathways/:userId
 * Get saved pathways for a user
 */
exports.getUserPathwaysOld = async (req, res) => {
  try {
    const { userId } = req.params;
    const { target_type, status } = req.query;
    
    const db = require('../models');
    const { Op } = require('sequelize');
    
    const where = {
      user_id: userId,
    };
    
    if (target_type) {
      where.target_type = target_type;
    }
    
    if (status) {
      where.status = status;
    } else {
      where.status = 'active'; // Default to active
    }
    
    const pathways = await db.UserPathway.findAll({
      where,
      include: [
        {
          model: db.PathwayStep,
          as: 'steps',
        },
      ],
      order: [
        ['pathway_rank', 'ASC'],
        [{ model: db.PathwayStep, as: 'steps' }, 'step_order', 'ASC'],
      ],
    });
    
    return res.status(200).json({
      success: true,
      data: pathways,
    });
    
  } catch (error) {
    console.error('Error in getUserPathways controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};




// ## Usage Examples

// ### **1. Generate Job-Specific Pathway**
// ```bash
// POST /api/pathways/generate
// Content-Type: application/json

// {
//   "user_id": 123,
//   "target_type": "job_specific",
//   "target_id": 456,
//   "user_preferences": {
//     "include_courses": true,
//     "include_projects": true,
//     "include_internships": true,
//     "include_jobs": false
//   }
// }
// ```

// ### **2. Generate Role-Specific Pathway**
// ```bash
// POST /api/pathways/generate
// Content-Type: application/json

// {
//   "user_id": 123,
//   "target_type": "role_specific",
//   "target_role": "Backend Developer"
// }
// ```

// ### **3. Get User's Saved Pathways**
// ```bash
// GET /api/pathways/123?target_type=job_specific&status=active
// ```

// ---

// ## Summary

// **What you got:**
// 1.  **Minimal, well-structured files** (10 files total, easy to navigate)
// 2.  **No data duplication** (queries from source tables directly)
// 3.  **Top 3 pathways sorted by max skills covered, then duration**
// 4.  **Dynamic eligibility** (re-evaluated at each step)
// 5.  **User category support** (currently_studying, fresher, professional)
// 6.  **Configurable and modular** (easy to change rules/logic)
// 7.  **Database caching** (7-day expiry)
// 8.  **Job-specific and role-specific targeting**
// 9.  **Missing resource handling** (placeholders for incomplete data)
// 10.  **Proper scoring** (skill coverage prioritized, then duration)

// **Next steps:**
// 1. Run migrations to add/update tables
// 2. Add `user_category` column to `user_details`
// 3. Populate `learning_resources` with courses
// 4. Test with sample data

// Let me know if you need any clarifications or modifications!



















// controllers/pathwayController.js
const db = require('../models');
const { Op } = require('sequelize');
const pathwayService = require('../services/pathwayGeneration/pathwayService');

// Generate new pathways
// exports.generatePathways = async (req, res) => {
//   try {
//     const { user_id, target_type, target_id, target_role, user_preferences } = req.body;

//     // Validation
//     if (!user_id || !target_type) {
//       return res.status(400).json({ success: false, message: 'Missing required fields' });
//     }
//     if (!['job_specific', 'role_specific'].includes(target_type)) {
//       return res.status(400).json({ success: false, message: 'Invalid target_type' });
//     }
//     if (target_type === 'job_specific' && !target_id) {
//       return res.status(400).json({ success: false, message: 'target_id required for job_specific' });
//     }
//     if (target_type === 'role_specific' && !target_role) {
//       return res.status(400).json({ success: false, message: 'target_role required for role_specific' });
//     }

//     const result = await pathwayService.generatePathways(
//       user_id,
//       target_type,
//       target_id,
//       target_role,
//       user_preferences
//     );

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('[PathwayController] Error in generatePathways:', error);
//     return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
//   }
// };

// Get paginated pathways for user
exports.getUserPathways = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, target_type, status = 'active' } = req.query;
    const offset = (page - 1) * limit;

    const where = { user_id: userId, status };
    if (target_type) where.target_type = target_type;

    const { count, rows } = await db.UserPathway.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['pathway_rank', 'ASC']],
      include: [
        {
          model: db.PathwayStep,
          as: 'steps',
          order: [['step_order', 'ASC']],
          separate: true,
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: {
        pathways: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          total_pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('[PathwayController] Error in getUserPathways:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get single pathway by ID
exports.getPathwayById = async (req, res) => {
  try {
    const { pathwayId } = req.params;
    const pathway = await db.UserPathway.findByPk(pathwayId, {
      include: [
        {
          model: db.PathwayStep,
          as: 'steps',
          order: [['step_order', 'ASC']],
        },
        {
          model: db.JobPost,
          as: 'targetJob',
        },
      ],
    });

    if (!pathway) {
      return res.status(404).json({ success: false, message: 'Pathway not found' });
    }

    return res.status(200).json({ success: true, data: pathway });
  } catch (error) {
    console.error('[PathwayController] Error in getPathwayById:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update step status (e.g., completed)
exports.updateStepStatus = async (req, res) => {
  try {
    const { stepId } = req.params;
    const { status } = req.body;

    if (!['pending', 'in_progress', 'completed', 'skipped'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const step = await db.PathwayStep.findByPk(stepId);
    if (!step) {
      return res.status(404).json({ success: false, message: 'Step not found' });
    }

    await step.update({ status, ...(status === 'completed' ? { completed_at: new Date() } : {}) });

    // Auto-update parent pathway status
    const pathway = await db.UserPathway.findByPk(step.pathway_id);
    const allSteps = await db.PathwayStep.findAll({ where: { pathway_id: step.pathway_id } });
    const completedCount = allSteps.filter(s => s.status === 'completed').length;

    if (completedCount === allSteps.length) {
      await pathway.update({ status: 'completed' });
    } else if (completedCount > 0) {
      await pathway.update({ status: 'in_progress' });
    }

    return res.status(200).json({ success: true, data: step });
  } catch (error) {
    console.error('[PathwayController] Error in updateStepStatus:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Select a pathway
exports.selectPathway = async (req, res) => {
  try {
    const { pathwayId } = req.params;
    const pathway = await db.UserPathway.findByPk(pathwayId);
    if (!pathway) {
      return res.status(404).json({ success: false, message: 'Pathway not found' });
    }

    // Deselect others
    await db.UserPathway.update(
      { status: 'suggested' },
      { where: { user_id: pathway.user_id, target_type: pathway.target_type, status: 'selected' } }
    );

    // Select this one
    await pathway.update({ status: 'selected', selected_at: new Date() });

    return res.status(200).json({ success: true, message: 'Pathway selected', data: pathway });
  } catch (error) {
    console.error('[PathwayController] Error in selectPathway:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get opportunity details (course/internship/etc.)
exports.getOpportunityDetails = async (req, res) => {
  try {
    const { type, id } = req.params;
    let opportunity = null;

    if (type === 'course') {
      opportunity = await db.LearningResource.findByPk(id, {
        include: [{ model: db.ResourceSkill, as: 'resourceSkills' }],
      });
    } else {
      // Internship, project, job → from job_posts
      opportunity = await db.JobPost.findByPk(id, {
        include: [
          // { model: db.JobPostSkill, as: 'Skills' }
          {
                    model: db.Skill,
                    as: "skills", // ← This is your existing belongsToMany alias
                    through: {
                      attributes: ["type", "min_experience_months"], // ← Pull JobPostSkill fields here
                    },
                    attributes: ["skill_id", "skill_name"],
          },
        ],
      });
    }

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    return res.status(200).json({ success: true, data: opportunity });
  } catch (error) {
    console.error('[PathwayController] Error in getOpportunityDetails:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Lightweight skill gap preview (no full pathway gen)
exports.getSkillGapPreview = async (req, res) => {
  try {
    const { user_id, target_type, target_id, target_role } = req.query;
    const result = await pathwayService.getSkillGapPreview(user_id, target_type, target_id, target_role);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[PathwayController] Error in getSkillGapPreview:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};