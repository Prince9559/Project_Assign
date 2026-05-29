const express = require('express');
const router = express.Router();
const { getSkillsByDomainId } = require('../controllers/skillController');

router.get('/by-domain/:domainId', getSkillsByDomainId);

module.exports = router;
