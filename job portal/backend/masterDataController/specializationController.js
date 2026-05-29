const { Specialization, Course } = require('../models');
const { Op } = require("sequelize");
async function getAllSpecializations(req, res) {
    try {
        const specializations = await Specialization.findAll({
            attributes: ['id', 'name', 'course_id'], // Include id and course_id for frontend
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'name'] // Include course id and name
                }
            ],
            order: [['name', 'ASC']]
        });
        res.status(200).json({
            success: true,
            data: specializations,
            message: 'Specializations fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching specializations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching specializations',
            error: error.message
        });
    }
}

async function searchSpecializations(req, res) {
    try {
        const { search } = req.query;

        // If search is not provided or less than 3 chars, return empty array
        // if (!search || search.length < 3) {
        //     return res.status(200).json({
        //         success: true,
        //         data: [],
        //         message: 'Type at least 3 characters to search'
        //     });
        // }

        // Fetch matching specializations
        const specializations = await Specialization.findAll({
            where: {
                name: {
                    [Op.like]: `%${search}%` // case-insensitive in MySQL/MariaDB if collation is ci
                }
            },
            attributes: ['id', 'name', 'course_id'],
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'name']
                }
            ],
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: specializations,
            message: 'Specializations fetched successfully'
        });
    } catch (error) {
        console.error('Error searching specializations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching specializations',
            error: error.message
        });
    }
}

async function getSpecializationById(req, res) {
    try {
        const { id } = req.params;
        const specialization = await Specialization.findByPk(id, {
            attributes: ['id', 'name', 'course_id'], // Include id and course_id for frontend
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'name'] // Include course id and name
                }
            ]
        });

        if (!specialization) {
            return res.status(404).json({
                success: false,
                message: 'Specialization not found'
            });
        }

        res.status(200).json({
            success: true,
            data: specialization,
            message: 'Specialization fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching specialization:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching specialization',
            error: error.message
        });
    }
}
async function getSpecializationsByCourse(req, res) {
    try {
        const { course_id } = req.params;
        const specializations = await Specialization.findAll({
            where: { course_id: course_id },
            attributes: ['id', 'name', 'course_id'],
            order: [['name', 'ASC']],
            include:[{
                model:Course,
                as:'course',
                attributes:['name']
            }]
        })
        if (specializations.length === 0) {
            console.log('No specializations found for course_id', course_id);
            return res.status(404).json({
                success: false,
                message: 'No specializations found for course_id', course_id,
                error:'No specializations found for course_id'
            })
        }
        res.status(200).json({
            success: true,
            data: specializations,
            message:'Specializations fetched successfully!'
        })
    } catch (error) {
        console.error('Error fetching specializations by course:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error while fetching specializations by Course',
            error:error.message,
        })
   }
}
async function createSpecialization(req, res) {
    try {
        const { name, course_id } = req.body;

        if (!name || !course_id) {
            return res.status(400).json({
                success: false,
                message: 'Specialization name and course ID are required'
            });
        }

        // Verify course exists
        const course = await Course.findByPk(course_id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const existingSpecialization = await Specialization.findOne({
            where: { name, course_id }
        });
        if (existingSpecialization) {
            return res.status(409).json({
                success: false,
                message: 'Specialization with this name already exists for this course'
            });
        }

        const specialization = await Specialization.create({ name, course_id });

        res.status(201).json({
            success: true,
            data: specialization,
            message: 'Specialization created successfully'
        });
    } catch (error) {
        console.error('Error creating specialization:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating specialization',
            error: error.message
        });
    }
}
async function updateSpecialization(req, res) {
    try {
        const { id } = req.params;
        const { name, course_id } = req.body;

        if (!name || !course_id) {
            return res.status(400).json({
                success: false,
                message: 'Specialization name and course ID are required'
            });
        }

        const specialization = await Specialization.findByPk(id);
        if (!specialization) {
            return res.status(404).json({
                success: false,
                message: 'Specialization not found'
            });
        }

        // Verify course exists
        const course = await Course.findByPk(course_id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const existingSpecialization = await Specialization.findOne({
            where: {
                name,
                course_id,
                id: { [require('sequelize').Op.ne]: id }
            }
        });
        if (existingSpecialization) {
            return res.status(409).json({
                success: false,
                message: 'Specialization with this name already exists for this course'
            });
        }

        await specialization.update({ name, course_id });

        res.status(200).json({
            success: true,
            data: specialization,
            message: 'Specialization updated successfully'
        });
    } catch (error) {
        console.error('Error updating specialization:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating specialization',
            error: error.message
        });
    }
}
async function deleteSpecialization(req, res) {
    try {
        const { id } = req.params;

        const specialization = await Specialization.findByPk(id);
        if (!specialization) {
            return res.status(404).json({
                success: false,
                message: 'Specialization not found'
            });
        }

        // Check if specialization is being used in educations
        const { Education } = require('../../models');
        const educationsCount = await Education.count({ where: { specialization_id: id } });
        if (educationsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete specialization. It is used by ${educationsCount} education record(s)`
            });
        }

        await specialization.destroy();

        res.status(200).json({
            success: true,
            message: 'Specialization deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting specialization:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting specialization',
            error: error.message
        });
    }
}
async function createBulkSpecializations(req, res) {
    try {
        const { specializations } = req.body;

        if (!specializations || !Array.isArray(specializations) || specializations.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Specializations array is required and must not be empty'
            });
        }

        // Validate each specialization
        for (const specialization of specializations) {
            if (!specialization.name || !specialization.course_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Specialization name and course_id are required for all specializations'
                });
            }
        }

        // Verify all course_ids exist
        const course_ids = [...new Set(specializations.map(spec => spec.course_id))];
        const existingCourses = await Course.findAll({
            where: {
                id: { [require('sequelize').Op.in]: course_ids }
            }
        });

        if (existingCourses.length !== course_ids.length) {
            const existingcourse_ids = existingCourses.map(course => course.id);
            const missingcourse_ids = course_ids.filter(id => !existingcourse_ids.includes(id));
            return res.status(404).json({
                success: false,
                message: `Courses not found with IDs: ${missingcourse_ids.join(', ')}`
            });
        }

        // Check for duplicates
        const specializationKeys = specializations.map(spec => ({ name: spec.name, course_id: spec.course_id }));
        const existingSpecializations = await Specialization.findAll({
            where: {
                [require('sequelize').Op.or]: specializationKeys
            }
        });

        if (existingSpecializations.length > 0) {
            const existingNames = existingSpecializations.map(spec => `${spec.name} (Course ID: ${spec.course_id})`);
            return res.status(409).json({
                success: false,
                message: `Specializations already exist: ${existingNames.join(', ')}`
            });
        }

        // Create all specializations
        const createdSpecializations = await Specialization.bulkCreate(specializations);

        res.status(201).json({
            success: true,
            data: createdSpecializations,
            message: `${createdSpecializations.length} specializations created successfully`
        });
    } catch (error) {
        console.error('Error creating bulk specializations:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating specializations',
            error: error.message
        });
    }
}
module.exports = {
    getAllSpecializations,
    getSpecializationById,
    getSpecializationsByCourse,
    createSpecialization,
    updateSpecialization,
    deleteSpecialization,
    createBulkSpecializations,
     searchSpecializations
}; 