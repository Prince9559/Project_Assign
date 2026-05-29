const { Course, Specialization } = require('../models');
const { Op, literal } = require("sequelize");
const { sanitizeSearchInput } = require("../utils/sanitizer"); // Adjust path accordingly


async function getAllCourses(req, res) {
    try {
        const courses = await Course.findAll({
            where: { status: 1 }, // Only fetch active courses
            attributes: ['id', 'name'], // Include id for frontend
            order: [['name', 'ASC']]
        });
        res.status(200).json({
            success: true,
            data: courses,
            message: 'Courses fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching courses',
            error: error.message
        });
    }
}


async function searchCourses(req, res) {
    try {
        const { search } = req.query;

        // 1. Sanitize Input
        const validation = sanitizeSearchInput(search);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.error || "Invalid search input"
            });
        }

        const searchTerm = validation.value; // Safe to use

        // 2. Execute Query with Safe Literal
        const courses = await Course.findAll({
            where: {
                name: {
                    [Op.like]: `%${searchTerm}%`
                },
                status: 1 // Only search active courses
            },
            attributes: ['id', 'name'],
            order: [
                [
                    literal(`CASE 
                        WHEN name = '${searchTerm}' THEN 1 
                        WHEN name LIKE '${searchTerm}%' THEN 2 
                        ELSE 3 
                    END`),
                    'ASC'
                ],
                ['name', 'ASC']
            ],
            limit: 10
        });

        res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            data: courses
        });

    } catch (error) {
        console.error("Error searching courses:", error);
        res.status(500).json({
            success: false,
            message: "Error searching courses",
            error: error.message
        });
    }
}


async function getCourseById(req, res) {
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id, {
            attributes: ['id', 'name','status'] // Include id for frontend
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: course,
            message: 'Course fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching course',
            error: error.message
        });
    }
}
async function createCourse(req, res) {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Course name is required'
            });
        }

        const existingCourse = await Course.findOne({ where: { name } });
        if (existingCourse) {
            return res.status(409).json({
                success: false,
                message: 'Course with this name already exists'
            });
        }

        const course = await Course.create({ name });

        res.status(201).json({
            success: true,
            data: course,
            message: 'Course created successfully'
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating course',
            error: error.message
        });
    }
}
async function updateCourse(req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Course name is required'
            });
        }

        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const existingCourse = await Course.findOne({
            where: {
                name,
                id: { [require('sequelize').Op.ne]: id }
            }
        });
        if (existingCourse) {
            return res.status(409).json({
                success: false,
                message: 'Course with this name already exists'
            });
        }

        await course.update({ name });

        res.status(200).json({
            success: true,
            data: course,
            message: 'Course updated successfully'
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating course',
            error: error.message
        });
    }
}
async function deleteCourse(req, res) {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if course is being used in specializations
        const specializationsCount = await Specialization.count({ where: { course_id: id } });
        if (specializationsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete course. It is used by ${specializationsCount} specialization(s)`
            });
        }

        await course.destroy();

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting course',
            error: error.message
        });
    }
}
async function createBulkCourses(req, res) {
    try {
        const { courses } = req.body;

        if (!courses || !Array.isArray(courses) || courses.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Courses array is required and must not be empty'
            });
        }

        // Validate each course
        for (const course of courses) {
            if (!course.name) {
                return res.status(400).json({
                    success: false,
                    message: 'Course name is required for all courses'
                });
            }
        }

        // Check for duplicates
        const courseNames = courses.map(course => course.name);
        const existingCourses = await Course.findAll({
            where: {
                name: { [require('sequelize').Op.in]: courseNames }
            }
        });

        if (existingCourses.length > 0) {
            const existingNames = existingCourses.map(course => course.name);
            return res.status(409).json({
                success: false,
                message: `Courses already exist: ${existingNames.join(', ')}`
            });
        }

        // Create all courses
        const createdCourses = await Course.bulkCreate(courses);

        res.status(201).json({
            success: true,
            data: createdCourses,
            message: `${createdCourses.length} courses created successfully`
        });
    } catch (error) {
        console.error('Error creating bulk courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating courses',
            error: error.message
        });
    }
}

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    createBulkCourses,
    searchCourses
}; 