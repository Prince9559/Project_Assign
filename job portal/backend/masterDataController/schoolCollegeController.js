const { SchoolCollege } = require('../models');
const { Op, literal } = require("sequelize");

async function getAllColleges(req, res) {
    try {
        const colleges = await SchoolCollege.findAll({
            attributes: ['id', 'name', 'logo_pic'], // Include id for frontend
            order: [['name', 'ASC']]
        });
        res.status(200).json({
            success: true,
            data: colleges,
            message: 'Colleges fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching colleges:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching colleges',
            error: error.message
        });
    }
}



async function searchColleges(req, res) {
    try {
        const { search } = req.query;

        // 1. Basic Length Validation
        // if (!search || search.trim().length < 3) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Please enter at least 3 characters to search"
        //     });
        // }

        // 2. Sanitization: Allow only letters, numbers, spaces, hyphens, underscores
        const searchTerm = search.trim();
        const safePattern = /^[a-zA-Z0-9\s\-_]+$/;

        if (!safePattern.test(searchTerm)) {
            return res.status(400).json({
                success: false,
                message: "Search input contains invalid characters."
            });
        }

        // 3. Query with Custom Sorting Priority
        const colleges = await SchoolCollege.findAll({
            where: {
                name: {
                    [Op.like]: `%${searchTerm}%`
                }
            },
            attributes: ['id', 'name', 'logo_pic'],
            order: [
                [
                    literal(`CASE 
                        WHEN name = '${searchTerm}' THEN 1 
                        WHEN name LIKE '${searchTerm}%' THEN 2 
                        ELSE 3 
                    END`),
                    'ASC'
                ],
                ['name', 'ASC'] // Secondary alphabetical sort
            ],
            limit: 10
        });

        res.status(200).json({
            success: true,
            data: colleges,
            message: "Colleges fetched successfully"
        });

    } catch (error) {
        console.error("Error searching colleges:", error);
        res.status(500).json({
            success: false,
            message: "Error searching colleges",
            error: error.message
        });
    }
}


async function getCollegeById(req, res) {
    try {
        const { id } = req.params;
        const college = await SchoolCollege.findByPk(id, {
            attributes: ['id', 'name', 'logo_pic'] // Include id for frontend
        });

        if (!college) {
            return res.status(404).json({
                success: false,
                message: 'College not found'
            });
        }

        res.status(200).json({
            success: true,
            data: college,
            message: 'College fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching college:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching college',
            error: error.message
        });
    }
}
async function createCollege(req, res) {
    try {
        const { name, logo_pic } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'College name is required'
            });
        }

        const existingCollege = await SchoolCollege.findOne({ where: { name } });
        if (existingCollege) {
            return res.status(409).json({
                success: false,
                message: 'College with this name already exists'
            });
        }

        const college = await SchoolCollege.create({ name, logo_pic });

        res.status(201).json({
            success: true,
            data: college,
            message: 'College created successfully'
        });
    } catch (error) {
        console.error('Error creating college:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating college',
            error: error.message
        });
    }
}
async function bulkCreateColleges(req, res) {
    try {
        const { colleges } = req.body;

        if (!colleges || !Array.isArray(colleges) || colleges.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Colleges array is required and must not be empty'
            });
        }

        // Validate each college data
        for (let i = 0; i < colleges.length; i++) {
            const college = colleges[i];
            if (!college.name) {
                return res.status(400).json({
                    success: false,
                    message: `College name is required at index ${i}`
                });
            }
        }

        // Check for duplicate names in the input array
        const names = colleges.map(c => c.name);
        const uniqueNames = [...new Set(names)];
        if (uniqueNames.length !== names.length) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate college names found in the input array'
            });
        }

        // Check for existing colleges with the same names
        const existingColleges = await SchoolCollege.findAll({
            where: {
                name: names
            }
        });

        if (existingColleges.length > 0) {
            const existingNames = existingColleges.map(c => c.name);
            return res.status(409).json({
                success: false,
                message: `Colleges with these names already exist: ${existingNames.join(', ')}`
            });
        }

        // Create all colleges
        const createdColleges = await SchoolCollege.bulkCreate(colleges, {
            returning: true
        });

        res.status(201).json({
            success: true,
            data: createdColleges,
            message: `${createdColleges.length} colleges created successfully`
        });
    } catch (error) {
        console.error('Error creating colleges in bulk:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating colleges in bulk',
            error: error.message
        });
    }
}
async function updateCollege(req, res) {
    try {
        const { id } = req.params;
        const { name, logo_pic } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'College name is required'
            });
        }

        const college = await SchoolCollege.findByPk(id);
        if (!college) {
            return res.status(404).json({
                success: false,
                message: 'College not found'
            });
        }

        const existingCollege = await SchoolCollege.findOne({
            where: {
                name,
                id: { [require('sequelize').Op.ne]: id }
            }
        });
        if (existingCollege) {
            return res.status(409).json({
                success: false,
                message: 'College with this name already exists'
            });
        }

        await college.update({ name, logo_pic });

        res.status(200).json({
            success: true,
            data: college,
            message: 'College updated successfully'
        });
    } catch (error) {
        console.error('Error updating college:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating college',
            error: error.message
        });
    }
}
async function deleteCollege(req, res) {
    try {
        const { id } = req.params;

        const college = await SchoolCollege.findByPk(id);
        if (!college) {
            return res.status(404).json({
                success: false,
                message: 'College not found'
            });
        }

        // Check if college is being used in educations
        const { Education } = require('../../models');
        const educationsCount = await Education.count({ where: { school_college_id: id } });
        if (educationsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete college. It is used by ${educationsCount} education record(s)`
            });
        }

        await college.destroy();

        res.status(200).json({
            success: true,
            message: 'College deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting college:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting college',
            error: error.message
        });
    }
}

module.exports = {
    getAllColleges,
    getCollegeById,
    createCollege,
    bulkCreateColleges,
    updateCollege,
    deleteCollege,
    searchColleges
}; 