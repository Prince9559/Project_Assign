const { Domain, Skill, JobRoleDomain } = require('../models');
const { Op } = require('sequelize');

/**
 * GET ALL DOMAINS
 * Preserved existing structure exactly.
 */
async function getAllDomain(req, res) {
  try {
    const domains = await Domain.findAll({
      where: { status: 1 }, // Only fetch active domains
      attributes: ["domain_id", "domain_name"],
      order: [["domain_name", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: domains,
      message: "Domain fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching Domain:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Domain",
      error: error.message,
    });
  }
}

/**
 * SEARCH DOMAINS (min 3 characters)
 * Enhanced with optional exclusion logic for job-role-specific suggestions.
 * Preserved existing structure.
 */
async function searchDomain(req, res) {
  try {
    const { search, limit = 10, excludeJobRole } = req.query;

    // if (!search || search.trim().length < 3) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Please enter at least 3 characters to search",
    //     data: []
    //   });
    // }

    const searchTerm = search.trim();
    const limitInt = Math.min(parseInt(limit, 10), 50);

    const whereClause = {
      status: 1, // Only search active domains
      domain_name: { [Op.like]: `%${searchTerm}%` }
    };

    // Optional: Exclude domains already suggested for a specific job role
    if (excludeJobRole && !isNaN(excludeJobRole)) {
      const existingMappings = await JobRoleDomain.findAll({
        where: { job_role_id: excludeJobRole },
        attributes: ['domain_id'],
        raw: true
      });
      const excludedIds = existingMappings.map(m => m.domain_id);

      if (excludedIds.length > 0) {
        whereClause.domain_id = { [Op.notIn]: excludedIds };
      }
    }

    const domains = await Domain.findAll({
      where: whereClause,
      attributes: ["domain_id", "domain_name"],
      order: [["domain_name", "ASC"]],
      limit: limitInt,
    });

    res.status(200).json({
      success: true,
      data: domains,
      message: "Domain fetched successfully",
    });
  } catch (error) {
    console.error("Error searching Domain:", error);
    res.status(500).json({
      success: false,
      message: "Error searching Domain",
      error: error.message,
      data: []
    });
  }
}

/**
 * NEW: GET SUB-SKILLS FOR A DOMAIN
 * Fetches skills belonging to a specific domain.
 * Supports optional search within the domain.
 */
async function getDomainSubSkills(req, res) {
  try {
    const { domainId } = req.params;
    const { search, limit = 20 } = req.query;

    if (!domainId || isNaN(domainId)) {
      return res.status(400).json({
        success: false,
        message: "Valid domain ID is required",
        data: []
      });
    }

    const limitInt = Math.min(parseInt(limit, 10), 50);
    const whereClause = { status:1,domain_id: parseInt(domainId, 10) };

    if (search && search.trim().length >= 2) {
      whereClause.skill_name = { [Op.like]: `%${search.trim()}%` };
    }

    const skills = await Skill.findAll({
      where: whereClause,
      attributes: ['skill_id', 'skill_name', 'domain_id'],
      order: [['skill_name', 'ASC']],
      limit: limitInt
    });

    res.status(200).json({
      success: true,
      data: skills,
      message: "Sub-skills fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching domain sub-skills:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sub-skills",
      error: error.message,
      data: []
    });
  }
}

/**
 * NEW: CREATE DOMAIN (If not exists)
 * Used for custom domain creation on the fly.
 */
async function createDomain(req, res) {
  try {
    const { domain_name } = req.body;

    // if (!domain_name || domain_name.trim().length < 2) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Domain name must be at least 2 characters",
    //     data: null
    //   });
    // }

    const normalizedName = domain_name.trim();

    // Check existence (case-insensitive)
    const existing = await Domain.findOne({
      where: {
        domain_name: { [Op.iLike]: normalizedName }
      },
      attributes: ['domain_id', 'domain_name']
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        data: {
          domain_id: existing.domain_id,
          domain_name: existing.domain_name,
          created: false
        },
        message: "Domain already exists"
      });
    }

    const newDomain = await Domain.create({
      domain_name: normalizedName
    });

    res.status(201).json({
      success: true,
      data: {
        domain_id: newDomain.domain_id,
        domain_name: newDomain.domain_name,
        created: true
      },
      message: "Domain created successfully"
    });

  } catch (error) {
    console.error("Error creating domain:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create domain",
      error: error.message,
      data: null
    });
  }
}

module.exports = {
  getAllDomain,
  searchDomain,
  getDomainSubSkills,
  createDomain
};