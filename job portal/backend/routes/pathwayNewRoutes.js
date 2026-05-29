
// routes/pathwayRoutes.js

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pathwayNewController');

// Generate pathways
// router.post('/generate', pathwayController.generatePathways);

// // Get user's saved pathways
// router.get('/:userId', pathwayController.getUserPathways);



//all are mounted like /api/pathways/v4

// Pathway generation & management
router.post('/generate', ctrl.generatePathways);
router.get('/user/:userId', ctrl.getUserPathways);
router.get('/:pathwayId', ctrl.getPathwayById);
router.patch('/steps/:stepId/status', ctrl.updateStepStatus);
router.post('/:pathwayId/select', ctrl.selectPathway);

// Opportunity details
router.get('/opportunities/:type/:id', ctrl.getOpportunityDetails);

// Skill gap preview (lightweight)
router.get('/skills/required', ctrl.getSkillGapPreview);

module.exports = router;