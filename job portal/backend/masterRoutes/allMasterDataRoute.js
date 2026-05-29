const express = require('express');
const router = express.Router();

const masterController = require('../masterDataController/masterController');

router.get('/', masterController.getAllMasterData);

module.exports = router;