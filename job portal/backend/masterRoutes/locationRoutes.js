const express = require('express');
const router = express.Router();
const locationController = require('../masterDataController/locationController');

// GET all locations
router.get('/', locationController.getAllLocations);

//search api for 3 characters
router.get('/search',locationController.searchLocations)

// POST create new location
router.post('/', locationController.createLocation);

// POST create multiple locations (bulk insert) - MUST come before /:id route
router.post('/bulk', locationController.createBulkLocations);

// GET location by ID
router.get('/:id', locationController.getLocationById);

// PUT update location
router.put('/:id', locationController.updateLocation);

// DELETE location
router.delete('/:id', locationController.deleteLocation);

module.exports = router; 