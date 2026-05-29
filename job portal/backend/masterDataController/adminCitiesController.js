const { FilterOption } = require('../models');
const FilterService = require('../services/filterServices');
const { Op, fn, col } = require('sequelize');
const db = require('../models');

const addCity = async (req, res) => {
    try {
        const { value } = req.body;
        if (!value) {
            return res.status(400).json({ error: 'City value is required' });
        }
        const existing = await FilterOption.findOne({
            where: {
                category: 'cities',
                is_active: true,
                [Op.and]: [db.sequelize.where(fn('LOWER', col('value')), fn('LOWER', value.trim()))]
            }
        });
        if (existing) {
            return res.status(409).json({ error: 'Duplicate city', existing });
        }
        const newCity = await FilterOption.create({ category: 'cities', value: value.trim() });
        FilterService.clearCache();
        res.status(201).json({ success: true, data: newCity });
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};

const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const city = await FilterOption.findByPk(id);
        if (!city || city.category !== 'cities') {
            return res.status(404).json({ error: 'City not found' });
        }
        if (updates.value) {
            const duplicate = await FilterOption.findOne({
                where: {
                    category: 'cities',
                    is_active: true,
                    id: { [Op.ne]: id },
                    [Op.and]: [db.sequelize.where(fn('LOWER', col('value')), fn('LOWER', updates.value.trim()))]
                }
            });
            if (duplicate) {
                return res.status(409).json({ error: 'Duplicate city', existing: duplicate });
            }
            updates.value = updates.value.trim();
        }
        await FilterOption.update(updates, { where: { id } });
        const updated = await FilterOption.findByPk(id);
        FilterService.clearCache();
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};
const deleteCityPermanently = async (req, res) => {
    try {
        const { id } = req.params;
        const city = await FilterOption.findByPk(id);
        if (!city || city.category !== 'cities') {
            return res.status(404).json({ error: 'City not found' });
        }
        await FilterOption.destroy({ where: { id, category: 'cities' } });
        FilterService.clearCache();
        res.json({ success: true, message: 'City permanently deleted', id });
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};

const activateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const city = await FilterOption.findByPk(id);
        if (!city || city.category !== 'cities') {
            return res.status(404).json({ error: 'City not found' });
        }
        city.is_active = true;
        await city.save();
        FilterService.clearCache();
        res.json({ success: true, message: 'City activated', id });
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};

const deactivateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const city = await FilterOption.findByPk(id);
        if (!city || city.category !== 'cities') {
            return res.status(404).json({ error: 'City not found' });
        }
        city.is_active = false;
        await city.save();
        FilterService.clearCache();
        res.json({ success: true, message: 'City deactivated', id });
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};

const getActiveDeactiveCities = async (req, res) => {
    try {
        let { is_active } = req.query;
        if (typeof is_active == 'string') {
            is_active=is_active.toLowerCase()==='true'  
        }
        const cities = await FilterOption.findAll({
            where: { category: 'cities', is_active },
            order: [['value', 'ASC']]
        });
        res.json(cities);
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};

module.exports = { addCity, updateCity, deleteCityPermanently, activateCity, deactivateCity, getActiveDeactiveCities };
