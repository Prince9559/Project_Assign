const { Industry } = require('../models');
const { Op } = require("sequelize");
 
/* =========================
   GET ALL INDUSTRIES
========================= */
async function getAllIndustries(req, res) {
    try {
        const industries = await Industry.findAll({
            where: { status: 1 }, // Only fetch active industries
            attributes: ['id', 'name'],
            order: [['name', 'ASC']],
             limit: 20
        });
 
        res.status(200).json({
            success: true,
            data: industries,
            message: 'Industries fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching industries:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching industries',
            error: error.message
        });
    }
}
 
/* =========================
   SEARCH INDUSTRIES
   Min 3 characters (Typeahead)
========================= */
async function searchIndustries(req, res) {
    try {
        const { search } = req.query;
 
        // validation: minimum 1 character
        // if (!search || search.trim().length < 1) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Please enter at least 1 character to search"
        //     });
        // }
 
        const industries = await Industry.findAll({
            where: {
                status:1,
                name: {
                    [Op.like]: `%${search}%` // MySQL compatible
                }
            },
            attributes: ['id', 'name'],
            order: [['name', 'ASC']],
            limit: 10
        });
 
        res.status(200).json({
            success: true,
            data: industries,
            message: "Industries fetched successfully"
        });
 
    } catch (error) {
        console.error("Error searching industries:", error);
        res.status(500).json({
            success: false,
            message: "Error searching industries",
            error: error.message
        });
    }
}
 
 
/* =========================
   GET INDUSTRY BY ID
========================= */
async function getIndustryById(req, res) {
    try {
        const { id } = req.params;
 
        const industry = await Industry.findByPk(id, {
            attributes: ['id', 'name','status'] // Include id for frontend
        });
 
        if (!industry) {
            return res.status(404).json({
                success: false,
                message: 'Industry not found'
            });
        }
 
        res.status(200).json({
            success: true,
            data: industry,
            message: 'Industry fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching industry:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching industry',
            error: error.message
        });
    }
}
 
/* =========================
   CREATE INDUSTRY
========================= */
async function createIndustry(req, res) {
    try {
        const { name } = req.body;
 
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Industry name is required'
            });
        }
 
        const existingIndustry = await Industry.findOne({ where: { name } });
        if (existingIndustry) {
            return res.status(409).json({
                success: false,
                message: 'Industry with this name already exists'
            });
        }
 
        const industry = await Industry.create({ name });
 
        res.status(201).json({
            success: true,
            data: industry,
            message: 'Industry created successfully'
        });
    } catch (error) {
        console.error('Error creating industry:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating industry',
            error: error.message
        });
    }
}
 
/* =========================
   UPDATE INDUSTRY
========================= */
async function updateIndustry(req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body;
 
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Industry name is required'
            });
        }
 
        const industry = await Industry.findByPk(id);
        if (!industry) {
            return res.status(404).json({
                success: false,
                message: 'Industry not found'
            });
        }
 
        const existingIndustry = await Industry.findOne({
            where: {
                name,
                id: { [Op.ne]: id }
            }
        });
 
        if (existingIndustry) {
            return res.status(409).json({
                success: false,
                message: 'Industry with this name already exists'
            });
        }
 
        await industry.update({ name });
 
        res.status(200).json({
            success: true,
            data: industry,
            message: 'Industry updated successfully'
        });
    } catch (error) {
        console.error('Error updating industry:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating industry',
            error: error.message
        });
    }
}
 
/* =========================
   DELETE INDUSTRY
========================= */
async function deleteIndustry(req, res) {
    try {
        const { id } = req.params;
 
        const industry = await Industry.findByPk(id);
        if (!industry) {
            return res.status(404).json({
                success: false,
                message: 'Industry not found'
            });
        }
 
        await industry.destroy();
 
        res.status(200).json({
            success: true,
            message: 'Industry deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting industry:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting industry',
            error: error.message
        });
    }
}
 
/* =========================
   BULK CREATE INDUSTRIES
========================= */
async function createBulkIndustries(req, res) {
    try {
        const { industries } = req.body;
 
        if (!industries || !Array.isArray(industries) || industries.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Industries array is required and must not be empty'
            });
        }
 
        for (const industry of industries) {
            if (!industry.name) {
                return res.status(400).json({
                    success: false,
                    message: 'Industry name is required for all industries'
                });
            }
        }
 
        const industryNames = industries.map(ind => ind.name);
        const existingIndustries = await Industry.findAll({
            where: {
                name: { [Op.in]: industryNames }
            }
        });
 
        if (existingIndustries.length > 0) {
            const existingNames = existingIndustries.map(ind => ind.name);
            return res.status(409).json({
                success: false,
                message: `Industries already exist: ${existingNames.join(', ')}`
            });
        }
 
        const createdIndustries = await Industry.bulkCreate(industries);
 
        res.status(201).json({
            success: true,
            data: createdIndustries,
            message: `${createdIndustries.length} industries created successfully`
        });
    } catch (error) {
        console.error('Error creating bulk industries:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating industries',
            error: error.message
        });
    }
}
 
module.exports = {
    getAllIndustries,
    getIndustryById,
    createIndustry,
    updateIndustry,
    deleteIndustry,
    createBulkIndustries,
    searchIndustries
};
 
 