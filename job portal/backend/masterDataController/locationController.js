const { Location } = require('../models');
const { Op } = require("sequelize");
async function getAllLocations(req, res) {
    try {
        const locations = await Location.findAll({
            attributes: ['id', 'name'], // Include id for frontend
            order: [['name', 'ASC']]
        });
        res.status(200).json({
            success: true,
            data: locations,
            message: 'Locations fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching locations',
            error: error.message
        });
    }
}


async function searchLocations(req, res) {
    try {
        const { search } = req.query;

        // // validation: minimum 3 characters
        // if (!search || search.trim().length < 3) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Please enter at least 3 characters to search"
        //     });
        // }

        const locations = await Location.findAll({
            where: {
                name: {
                    [Op.like]: `%${search}%`   // MySQL
                    // [Op.iLike]: `%${search}%` // PostgreSQL
                }
            },
            attributes: ['id', 'name'],
            order: [['name', 'ASC']],
            limit: 10 // optional (good for search bars)
        });

        res.status(200).json({
            success: true,
            data: locations,
            message: "Locations fetched successfully"
        });

    } catch (error) {
        console.error("Error searching locations:", error);
        res.status(500).json({
            success: false,
            message: "Error searching locations",
            error: error.message
        });
    }
}

async function getLocationById(req, res) {
    try {
        const { id } = req.params;
        const location = await Location.findByPk(id, {
            attributes: ['id', 'name'] // Include id for frontend
        });

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        res.status(200).json({
            success: true,
            data: location,
            message: 'Location fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching location',
            error: error.message
        });
    }
}
async function createLocation(req, res) {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Location name is required'
            });
        }

        const existingLocation = await Location.findOne({ where: { name } });
        if (existingLocation) {
            return res.status(409).json({
                success: false,
                message: 'Location with this name already exists'
            });
        }

        const location = await Location.create({ name });

        res.status(201).json({
            success: true,
            data: location,
            message: 'Location created successfully'
        });
    } catch (error) {
        console.error('Error creating location:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating location',
            error: error.message
        });
    }
}
async function updateLocation(req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Location name is required'
            });
        }

        const location = await Location.findByPk(id);
        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        const existingLocation = await Location.findOne({
            where: {
                name,
                id: { [require('sequelize').Op.ne]: id }
            }
        });
        if (existingLocation) {
            return res.status(409).json({
                success: false,
                message: 'Location with this name already exists'
            });
        }

        await location.update({ name });

        res.status(200).json({
            success: true,
            data: location,
            message: 'Location updated successfully'
        });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating location',
            error: error.message
        });
    }
}
async function deleteLocation(req, res) {
    try {
        const { id } = req.params;

        const location = await Location.findByPk(id);
        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        // Check if location is being used in userdetails
        const { UserDetail } = require('../models');
        const userDetailsCount = await UserDetail.count({
            where: {
                [require('sequelize').Op.or]: [
                    { current_location_id: id },
                    { job_location_id: id }
                ]
            }
        });
        if (userDetailsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete location. It is used by ${userDetailsCount} user(s)`
            });
        }

        await location.destroy();

        res.status(200).json({
            success: true,
            message: 'Location deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting location',
            error: error.message
        });
    }
}
async function createBulkLocations(req, res) {
    try {
        const { locations } = req.body;

        if (!locations || !Array.isArray(locations) || locations.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Locations array is required and must not be empty'
            });
        }

        // Validate each location
        for (const location of locations) {
            if (!location.name) {
                return res.status(400).json({
                    success: false,
                    message: 'Location name is required for all locations'
                });
            }
        }

        // Check for duplicates
        const locationNames = locations.map(loc => loc.name);
        const existingLocations = await Location.findAll({
            where: {
                name: { [require('sequelize').Op.in]: locationNames }
            }
        });

        if (existingLocations.length > 0) {
            const existingNames = existingLocations.map(loc => loc.name);
            return res.status(409).json({
                success: false,
                message: `Locations already exist: ${existingNames.join(', ')}`
            });
        }

        // Create all locations
        const createdLocations = await Location.bulkCreate(locations);

        res.status(201).json({
            success: true,
            data: createdLocations,
            message: `${createdLocations.length} locations created successfully`
        });
    } catch (error) {
        console.error('Error creating bulk locations:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating locations',
            error: error.message
        });
    }
}
module.exports = {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    createBulkLocations,
    searchLocations
}; 