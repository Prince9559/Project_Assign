const { Skill, UserSkill, JobPostSkill, Domain } = require('../models');
const { Op } = require('sequelize');

async function getAllSkills(req, res) {
    try {
        const skills = await Skill.findAll({
            where: { status: 1 },
            attributes: ['skill_id', 'skill_name', 'domain_id'],
            order: [['skill_name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: skills,
            message: 'Skills fetched successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching skills',
            error: error.message,
            data: []
        });
    }
}

async function getSkillsByDomain(req, res) {
    try {
        const { domain_id } = req.params;

        if (!domain_id || isNaN(domain_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid domain ID',
                data: []
            });
        }

        const skills = await Skill.findAll({
            where: { domain_id: parseInt(domain_id, 10), status: 1  },
            attributes: ['skill_id', 'skill_name', 'domain_id'],
            order: [['skill_name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: skills,
            message: 'Skills fetched successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching skills',
            error: error.message,
            data: []
        });
    }
}

/**
 * SEARCH SKILLS
 * Enhanced to support global search or domain-specific search (for sub-skills)
 */
async function searchSkills(req, res) {
    try {
        const { search, domain_id, limit = 15 } = req.query;

        if (!search || search.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Please enter at least 2 characters to search',
                data: []
            });
        }

        const searchTerm = search.trim();
        const limitInt = Math.min(parseInt(limit, 10), 50);

        const whereClause = {
            skill_name: { [Op.like]: `%${searchTerm}%` },
            status: 1 
        };

        if (domain_id && !isNaN(domain_id)) {
            whereClause.domain_id = parseInt(domain_id, 10);
        }

        const skills = await Skill.findAll({
            where: whereClause,
            attributes: ['skill_id', 'skill_name', 'domain_id'],
            include: [{
                model: Domain,
                as: 'domain',
                attributes: ['domain_id', 'domain_name'],
                required: false
            }],
            order: [['skill_name', 'ASC']],
            limit: limitInt
        });

        // Format slightly to ensure domain_name is available if needed by frontend
        const formattedSkills = skills.map(s => ({
            skill_id: s.skill_id,
            skill_name: s.skill_name,
            domain_id: s.domain_id,
            domain_name: s.domain?.domain_name || null
        }));

        res.status(200).json({
            success: true,
            data: formattedSkills,
            message: 'Skills fetched successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching skills',
            error: error.message,
            data: []
        });
    }
}

async function getSkillById(req, res) {
    try {
        const { id } = req.params;

        const skill = await Skill.findByPk(id, {
            attributes: ['skill_id', 'skill_name', 'domain_id','status']
        });

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found',
                data: null
            });
        }

        res.status(200).json({
            success: true,
            data: skill,
            message: 'Skill fetched successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching skill',
            error: error.message,
            data: null
        });
    }
}

async function createSkill(req, res) {
    try {
        const { skill_name, domain_id } = req.body;

        if (!skill_name || !domain_id) {
            return res.status(400).json({
                success: false,
                message: 'Skill name and domain id are required',
                data: null
            });
        }

        const existingSkill = await Skill.findOne({
            where: {
                skill_name: { [Op.iLike]: skill_name.trim() },
                domain_id
            }
        });

        if (existingSkill) {
            return res.status(409).json({
                success: false,
                message: 'Skill already exists in this domain',
                data: existingSkill
            });
        }

        const skill = await Skill.create({
            skill_name: skill_name.trim(),
            domain_id
        });

        res.status(201).json({
            success: true,
            data: skill,
            message: 'Skill created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating skill',
            error: error.message,
            data: null
        });
    }
}

// ... (updateSkill, deleteSkill, createBulkSkills remain unchanged structurally)
// Just ensuring they return data: null or data: [] on error for consistency

async function updateSkill(req, res) {
    try {
        const { id } = req.params;
        const { skill_name, domain_id } = req.body;

        if (!skill_name || !domain_id) {
            return res.status(400).json({
                success: false,
                message: 'Skill name and domain id are required',
                data: null
            });
        }

        const skill = await Skill.findByPk(id);
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found',
                data: null
            });
        }

        const existingSkill = await Skill.findOne({
            where: {
                skill_name: { [Op.iLike]: skill_name.trim() },
                domain_id,
                skill_id: { [Op.ne]: id }
            }
        });

        if (existingSkill) {
            return res.status(409).json({
                success: false,
                message: 'Skill already exists in this domain',
                data: existingSkill
            });
        }

        await skill.update({
            skill_name: skill_name.trim(),
            domain_id
        });

        res.status(200).json({
            success: true,
            data: skill,
            message: 'Skill updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating skill',
            error: error.message,
            data: null
        });
    }
}

async function deleteSkill(req, res) {
    try {
        const { id } = req.params;

        const skill = await Skill.findByPk(id);
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found',
                data: null
            });
        }

        // Check usage before deleting
        const userSkillCount = await UserSkill.count({ where: { skill_id: id } });
        const jobSkillCount = await JobPostSkill.count({ where: { skill_id: id } });

        if (userSkillCount > 0 || jobSkillCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete skill as it is in use',
                data: null
            });
        }

        await skill.destroy();

        res.status(200).json({
            success: true,
            message: 'Skill deleted successfully',
            data: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting skill',
            error: error.message,
            data: null
        });
    }
}

async function createBulkSkills(req, res) {
    try {
        const { skills } = req.body;

        if (!Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Skills array is required',
                data: []
            });
        }

        for (const skill of skills) {
            if (!skill.skill_name || !skill.domain_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Skill name and domain id are required for all items',
                    data: []
                });
            }
        }

        const createdSkills = await Skill.bulkCreate(
            skills.map(s => ({
                skill_name: s.skill_name.trim(),
                domain_id: s.domain_id
            })),
            { ignoreDuplicates: true }
        );

        res.status(201).json({
            success: true,
            data: createdSkills,
            message: `${createdSkills.length} skills processed successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating skills',
            error: error.message,
            data: []
        });
    }
}

module.exports = {
    getAllSkills,
    getSkillsByDomain,
    searchSkills,
    getSkillById,
    createSkill,
    updateSkill,
    deleteSkill,
    createBulkSkills
};