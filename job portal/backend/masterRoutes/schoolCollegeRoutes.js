const express = require('express');
const router = express.Router();
const schoolCollegeController = require('../masterDataController/schoolCollegeController');


// GET all colleges
router.get('/', schoolCollegeController.getAllColleges);

//search by 3 characters
router.get("/search",schoolCollegeController.searchColleges)

// GET college by ID
router.get('/:id', schoolCollegeController.getCollegeById);

// POST create new college
router.post('/', schoolCollegeController.createCollege);

//bulk create college
router.post('/bulk', schoolCollegeController.bulkCreateColleges);   

// PUT update college
router.put('/:id', schoolCollegeController.updateCollege);

// DELETE college
router.delete('/:id', schoolCollegeController.deleteCollege);

module.exports = router; 