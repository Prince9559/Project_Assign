const { FilterOption } = require('../models');
const FilterService = require('../services/filterServices');
const { Op, fn, col } = require('sequelize');
const db = require('../models');
const addDuration = async (req, res) => {
    try {
        const { value } = req.body;
        if (!value) {
            return res.status(400).json({ error: 'Duration value is required' });
        }
        const existing = await FilterOption.findOne({
            where: {
                category: 'duration',
                is_active: true,
                [Op.and]: [db.sequelize.where(fn('LOWER', col('value')), fn('LOWER', value.trim()))]
            }
        });
        if (existing) {
            return res.status(409).json({ error: 'Duplicate duration', existing });
        }
        const newDuration = await FilterOption.create({ category: 'duration', value: value.trim() });
        FilterService.clearCache();
        res.status(201).json({ success: true, data: newDuration });
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};

const updateDuration = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const duration = await FilterOption.findByPk(id);
        if (!duration || duration.category !== 'duration') {
            return res.status(404).json({ error: 'Duration option not found' });
        }
        if (updates.value) {
            const duplicate = await FilterOption.findOne({
                where: {
                    category: 'duration',
                    is_active: true,
                    id: { [Op.ne]: id },
                    [Op.and]: [db.sequelize.where(fn('LOWER', col('value')), fn('LOWER', updates.value.trim()))]
                }
            });
            if (duplicate) {
                return res.status(409).json({ error: 'Duplicate duration', existing: duplicate });
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
const deleteDurationPermanently = async (req, res) => {
    try {
        const { id } = req.params;
        const duration = await FilterOption.findByPk(id);
        if (!duration || duration.category !== 'duration') {
            return res.status(404).json({ error: 'Duration option not found' });
        }
        await FilterOption.destroy({ where: { id, category: 'duration' } });
        FilterService.clearCache();
        res.json({ success: true, message: 'Duration option permanently deleted', id });
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};
const activateDuration = async (req, res) => {
    try {
        const { id } = req.params;
        const duration = await FilterOption.findByPk(id);
        if (!duration || duration.category !== 'duration') {
            return res.status(404).json({ error: 'Duration option not found' });
        }
        duration.is_active = true;
        await duration.save();
        FilterService.clearCache();
        res.json({ success: true, message: 'Duration option activated', id });
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};
const deactivateDuration = async (req, res) => {
    try {
        const { id } = req.params;
        const duration = await FilterOption.findByPk(id);
        if (!duration || duration.category !== 'duration') {
            return res.status(404).json({ error: 'Duration option not found' });
        }
        duration.is_active = false;
        await duration.save();
        FilterService.clearCache();
        res.json({ success: true, message: 'Duration option deactivated', id });
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};
const getActiveDeactiveDurations = async (req, res) => {
    try {
        let { is_active } = req.query;
        //covert string to boolean if present
        if (typeof is_active == 'string') {
            is_active=is_active.toLowerCase()==='true'
        }
        const durations = await FilterOption.findAll({
            where: { category: 'duration', is_active },
            order: [['value', 'ASC']]
        });
        res.json(durations);
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};
module.exports = {
    addDuration,
    updateDuration,
    activateDuration,
    deactivateDuration,
    deleteDurationPermanently,
    getActiveDeactiveDurations,
};
