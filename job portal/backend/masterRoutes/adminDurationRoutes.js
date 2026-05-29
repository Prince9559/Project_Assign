
const express = require('express')
const router = express.Router();

const adminDurationController = require('../masterDataController/adminDurationController');



// Admin Duration routes
router.get('/active', adminDurationController.getActiveDeactiveDurations);
router.post('/', adminDurationController.addDuration);
router.put('/:id', adminDurationController.updateDuration);
router.delete('/:id/permanent', adminDurationController.deleteDurationPermanently);
router.put('/:id/activate', adminDurationController.activateDuration);
router.put('/:id/deactivate', adminDurationController.deactivateDuration);


module.exports = router;