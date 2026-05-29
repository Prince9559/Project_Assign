const express = require('express');
const router = express.Router();

const adminCitiesController = require('../masterDataController/adminCitiesController');

router.get('/active', adminCitiesController.getActiveDeactiveCities);
router.post('/', adminCitiesController.addCity);
router.put('/:id', adminCitiesController.updateCity);
router.delete('/:id/permanent', adminCitiesController.deleteCityPermanently);
router.put('/:id/activate', adminCitiesController.activateCity);
router.put('/:id/deactivate', adminCitiesController.deactivateCity);

module.exports = router;    