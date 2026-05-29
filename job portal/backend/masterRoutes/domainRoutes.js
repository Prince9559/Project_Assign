
const express = require('express');
const router = express.Router();
const domainController = require('../masterDataController/domainController');

// GET all courses
router.get('/', domainController.getAllDomain);

// search by 3 characters
router.get('/search', domainController.searchDomain);

// NEW: Create domain if not exists
router.post('/', domainController.createDomain);
// NEW: Get sub-skills for a domain
router.get('/:domainId/sub-skills', domainController.getDomainSubSkills);



module.exports = router; 