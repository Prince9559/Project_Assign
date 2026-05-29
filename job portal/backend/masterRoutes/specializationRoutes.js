const express = require('express');
const router = express.Router();
const specializationController = require('../masterDataController/specializationController');


// GET all specializations for a course
router.get('/course/:course_id', specializationController.getSpecializationsByCourse);

// GET all specializations
router.get('/', specializationController.getAllSpecializations);

//search by 3 characters
router.get('/search', specializationController. searchSpecializations);

// POST create new specialization
router.post('/', specializationController.createSpecialization);

// POST create multiple specializations (bulk insert) - MUST come before /:id route
router.post('/bulk', specializationController.createBulkSpecializations);

// GET specialization by ID
router.get('/:id', specializationController.getSpecializationById);

// PUT update specialization
router.put('/:id', specializationController.updateSpecialization);

// DELETE specialization
router.delete('/:id', specializationController.deleteSpecialization);

module.exports = router; 