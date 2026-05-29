const express = require('express')
const router = express.Router();

const adminPerksController = require('../masterDataController/adminPerksController');


router.get('/active', adminPerksController.getActiveDeactivePerks);
router.post('/', adminPerksController.addPerk);
router.put('/:id', adminPerksController.updatePerk);
router.delete('/:id/permanent', adminPerksController.deletePerkPermanently);
router.put('/:id/activate', adminPerksController.activatePerk);
router.put('/:id/deactivate', adminPerksController.deactivatePerk);


module.exports = router;