const { JobRole, Domain, JobRoleDomain, Skill } = require('../models');
const { Op, literal, where } = require("sequelize");
// Assuming you have this utility, if not, remove the import and use simple trim/validation
// const { sanitizeSearchInput } = require("../utils/sanitizer"); 

/**
 * GET ALL JOB ROLES
 * Preserved existing structure.
 */
const getJobRoles = async (req, res) => {
    try {
        const jobRoles = await JobRole.findAll({
            where: { status: 1 }, // Only fetch active job roles
            attributes: ['id', 'title', 'description'],
            order: [['title', 'ASC']]
        });
        res.status(200).json({
            message: "Job Roles fetched Successfully",
            success: true,
            data: jobRoles
        });
    } catch (error) {
        console.log("Error in getting JobRoles", error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
            data: []
        });
    }
};

/**
 * SEARCH JOB ROLES
 * Preserved existing structure and sorting logic.
 */
const searchJobRoles = async (req, res) => {
    try {
        const { search } = req.query;

        // Simple validation if sanitizer is not available
        // if (!search || typeof search !== 'string' || search.trim().length < 2) {
        //     return res.status(400).json({
        //         message: "Please enter at least 2 characters to search",
        //         success: false,
        //         data: []
        //     });
        // }

        
        // const searchTerm = search.trim();
        const searchTerm = (search || "").trim();

        const jobRoles = await JobRole.findAll({
            where: {
                status: 1, // Only search active job roles
                title: {
                    [Op.like]: `%${searchTerm}%`
                }
            },
            attributes: ['id', 'title', 'description'],
            order: [
                [
                    literal(`CASE 
                        WHEN title = '${searchTerm.replace(/'/g, "\\'")}' THEN 1 
                        WHEN title LIKE '${searchTerm.replace(/'/g, "\\'")}%' THEN 2 
                        ELSE 3 
                    END`),
                    'ASC'
                ],
                ['title', 'ASC']
            ],
            limit: 10
        });

        res.status(200).json({
            success: true,
            message: "Job Roles fetched successfully",
            data: jobRoles
        });

    } catch (error) {
        console.error("Error searching JobRoles:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
            data: []
        });
    }
};

/**
 * NEW: GET SUGGESTED DOMAINS FOR A JOB ROLE
 * Fetches domains mapped to the specific job role via job_role_domains table.
 */
const getSuggestedDomains = async (req, res) => {
    try {
        const { jobRoleId } = req.params;
        const { limit = 20, includeSkills = false } = req.query;
        const limitInt = Math.min(parseInt(limit, 10), 50);

        if (!jobRoleId || isNaN(jobRoleId)) {
            return res.status(400).json({
                success: false,
                message: "Valid job role ID is required",
                data: []
            });
        }

        // Verify job role exists
        const jobRole = await JobRole.findByPk(jobRoleId, {
            attributes: ['id', 'title']
        });

        if (!jobRole) {
            return res.status(404).json({
                success: false,
                message: "Job role not found",
                data: []
            });
        }

        console.log("fetching")

        // Fetch mappings
        const mappings = await JobRoleDomain.findAll({
            where: { job_role_id: jobRoleId },
            attributes: ['is_primary', 'display_order'],
            include: [{
                model: Domain,
                as: 'domain',
                attributes: ['domain_id', 'domain_name'],
                where: { status: 1 },  //  ONLY fetch approved domains
                required: true,
                // Optionally include top 10 skills for each domain if requested
                ...(includeSkills === 'true' && {
                    include: [{
                        model: Skill,
                        as: 'skills',
                        attributes: ['skill_id', 'skill_name'],
                        limit: 10
                    }]
                })
            }],
            order: [
                ['is_primary', 'DESC'],
                ['display_order', 'ASC'],
                ['domain', 'domain_name', 'ASC']
            ],
            limit: limitInt
        });

        // Format response to match expected structure
        const formattedData = mappings.map(m => ({
            domain_id: m.domain.domain_id,
            domain_name: m.domain.domain_name,
            is_primary: m.is_primary,
            display_order: m.display_order,
            ...(includeSkills === 'true' && {
                sub_skills: m.domain.skills ? m.domain.skills.map(s => ({
                    skill_id: s.skill_id,
                    skill_name: s.skill_name
                })) : []
            })
        }));

        res.status(200).json({
            success: true,
            message: "Suggested domains fetched successfully",
            data: formattedData
        });

    } catch (error) {
        console.error("Error fetching suggested domains:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
            data: []
        });
    }
};

const addJobRole = async (req, res) => {
    try {
        const { jobRole, description } = req.body;
        if (!jobRole) {
            return res.status(400).json({
                message: "Job Role is required",
                success: false,
                data: null,
                error: "Job Role is required"
            });
        }

        // Normalize for comparison
        const existingJobRole = await JobRole.findOne({
            where: {
                title: { [Op.iLike]: jobRole.trim() }
            }
        });

        if (existingJobRole) {
            return res.status(409).json({
                message: "Job Role already exists",
                success: false,
                data: existingJobRole,
                error: "Job Role already exists"
            });
        }

        const newJobRole = await JobRole.create({
            title: jobRole.trim(),
            description: description || null
        });

        return res.status(201).json({
            message: "Job Role added successfully",
            success: true,
            data: newJobRole
        });

    } catch (error) {
        console.log("Error while adding JobRoles", error.message);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
            success: false,
            data: null
        });
    }
};

const updateJobRole = async (req, res) => {
    try {
        const { job_role_id } = req.params;
        const { jobRole, description } = req.body;

        const jobRoleToUpdate = await JobRole.findByPk(job_role_id);
        if (!jobRoleToUpdate) {
            return res.status(404).json({
                message: "Job Role not found",
                success: false,
                data: null
            });
        }

        await jobRoleToUpdate.update({
            title: jobRole || jobRoleToUpdate.title,
            description: description !== undefined ? description : jobRoleToUpdate.description
        });

        return res.status(200).json({
            message: "Job Role updated successfully!",
            success: true,
            data: jobRoleToUpdate
        });

    } catch (error) {
        console.log("Error while updating JobRoles", error.message);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
            success: false,
            data: null
        });
    }
};

const deleteJobRole = async (req, res) => {
    try {
        const { job_role_id } = req.params;
        const jobRoleToDelete = await JobRole.findByPk(job_role_id);

        if (!jobRoleToDelete) {
            return res.status(404).json({
                message: "Job Role not found",
                success: false,
                data: null,
                error: "Job role not found"
            });
        }

        await jobRoleToDelete.destroy();

        return res.status(200).json({
            message: "Job Role deleted successfully!",
            success: true,
            data: jobRoleToDelete
        });

    } catch (error) {
        console.log("Error while deleting JobRoles", error.message);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            data: null,
            error: error.message
        });
    }
};

module.exports = {
    getJobRoles,
    searchJobRoles,
    getSuggestedDomains,
    addJobRole,
    updateJobRole,
    deleteJobRole
};