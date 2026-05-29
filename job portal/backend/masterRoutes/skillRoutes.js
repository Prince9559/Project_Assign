const express = require('express');
const router = express.Router();
const skillsController = require('../masterDataController/skillsController');


// GET all skills
router.get('/', skillsController.getAllSkills);

//search by 3 characters
router.get("/search",skillsController.searchSkills)

//get skills by domain

router.get("/domain/:domain_id",skillsController.getSkillsByDomain)


router.get("/skill/:domain_id",skillsController.getSkillsByDomain)


// GET skill by ID
router.get('/:id', skillsController.getSkillById);

// POST create new skills
router.post('/', skillsController.createSkill);

//bulk create skil;
router.post('/bulk', skillsController.createBulkSkills);   

// PUT update skill
router.put('/:id', skillsController.updateSkill);

// DELETE skill
router.delete('/:id', skillsController.deleteSkill);



module.exports = router; 