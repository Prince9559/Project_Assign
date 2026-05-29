const { FilterOption } = require('../models');;
const FilterService = require('../services/filterServices');
const { Op, fn, col } = require('sequelize');
const db = require('../models');


const addPerk = async (req, res) => {
    try {
        const { value } = req.body;
        if (!value) {
            return res.status(400).json({ error: 'Perk value is required' });
        }
        const existing = await FilterOption.findOne({
            where: {
                category: 'perks',
                is_active: true,
                [Op.and]: [db.sequelize.where(fn('LOWER', col('value')), fn('LOWER', value.trim()))]
            }
        });
        if (existing) {
            return res.status(409).json({ error: 'Duplicate perk', existing });
        }
        const newPerk = await FilterOption.create({ category: 'perks', value: value.trim() });
        FilterService.clearCache();
        res.status(201).json({ success: true, data: newPerk });
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};

const updatePerk = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const perk = await FilterOption.findByPk(id);
        if (!perk || perk.category !== 'perks') {
            return res.status(404).json({ error: 'Perk not found' });
        }
        if (updates.value) {
            const duplicate = await FilterOption.findOne({
                where: {
                    category: 'perks',
                    is_active: true,
                    id: { [Op.ne]: id },
                    [Op.and]: [db.sequelize.where(fn('LOWER', col('value')), fn('LOWER', updates.value.trim()))]
                }
            });
            if (duplicate) {
                return res.status(409).json({ error: 'Duplicate perk', existing: duplicate });
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

const deletePerkPermanently = async (req, res) => {
    try {
        const { id } = req.params;
        const perk = await FilterOption.findByPk(id);
        if (!perk || perk.category !== 'perks') {
            return res.status(404).json({ error: 'Perk not found' });
        }
        await FilterOption.destroy({ where: { id, category: 'perks' } });
        FilterService.clearCache();
        res.json({ success: true, message: 'Perk permanently deleted', id });
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};

const activatePerk = async (req, res) => {
    try {
        const { id } = req.params;
        const perk = await FilterOption.findByPk(id);
        if (!perk || perk.category !== 'perks') {
            return res.status(404).json({ error: 'Perk not found' });
        }
        perk.is_active = true;
        await perk.save();
        FilterService.clearCache();
        res.json({ success: true, message: 'Perk activated', id });
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};

const deactivatePerk = async (req, res) => {
    try {
        const { id } = req.params;
        const perk = await FilterOption.findByPk(id);
        if (!perk || perk.category !== 'perks') {
            return res.status(404).json({ error: 'Perk not found' });
        }
        perk.is_active = false;
        await perk.save();
        FilterService.clearCache();
        res.json({ success: true, message: 'Perk deactivated', id });
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};

const getActiveDeactivePerks = async (req, res) => {
    try {
        let { is_active } = req.query;
        //convert string to boolean if present
        if (typeof is_active === 'string') {
            is_active = is_active.toLowerCase() === 'true';
        }
        const perks = await FilterOption.findAll({
            where: { category: 'perks', is_active },
            order: [['value', 'ASC']]
        });
        res.json(perks);
    } catch (error) {
        res.status(500).json({ error: 'Internal error', message: error.message });
    }
};

module.exports = { addPerk, updatePerk, deletePerkPermanently, activatePerk, deactivatePerk, getActiveDeactivePerks };

