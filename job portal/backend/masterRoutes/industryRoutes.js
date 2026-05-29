const express = require('express');
const router = express.Router();
const industryController = require('../masterDataController/industryController');
 
// GET all industries
router.get('/', industryController.getAllIndustries);
 
// SEARCH industries by name
router.get('/search', industryController.searchIndustries);
 
// POST create new industry
router.post('/', industryController.createIndustry);
 
// POST create multiple industries (bulk insert) – MUST come before /:id route
router.post('/bulk', industryController.createBulkIndustries);
 
// GET industry by ID
router.get('/:id', industryController.getIndustryById);
 
// PUT update industry
router.put('/:id', industryController.updateIndustry);
 
// DELETE industry
router.delete('/:id', industryController.deleteIndustry);
 
module.exports = router;
 
 