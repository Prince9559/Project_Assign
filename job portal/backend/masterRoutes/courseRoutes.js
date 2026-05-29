const express = require('express');
const router = express.Router();
const courseController = require('../masterDataController/courseController');

// GET all courses
router.get('/', courseController.getAllCourses);

// search by 3 characters
router.get('/search', courseController.searchCourses);

// POST create new course
router.post('/', courseController.createCourse);

// POST create multiple courses (bulk insert) - MUST come before /:id route
router.post('/bulk', courseController.createBulkCourses);

// GET course by ID
router.get('/:id', courseController.getCourseById);

// PUT update course
router.put('/:id', courseController.updateCourse);

// DELETE course
router.delete('/:id', courseController.deleteCourse);



module.exports = router; 