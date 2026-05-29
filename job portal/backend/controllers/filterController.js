const { Domain, Skill } = require('../models');
const FilterService = require('../services/filterServices');

// Individual filter endpoints


const getDurationOptions = async (req, res) => {
    try {
        const durations = await FilterService.getFilterOptions('duration');
        const durationList = durations.map(duration => ({
            id: duration.id,
            value: duration.value,
            display_order: duration.display_order
        }));
        res.json(durationList);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch duration options' });
    }
};

const getPerks = async (req, res) => {
    try {
        const perks = await FilterService.getFilterOptions('perks');
        const perkList = perks.map(perk => ({
            id: perk.id,
            value: perk.value,
            display_order: perk.display_order
        }));
        res.json(perkList);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch perks' });
    }
};



module.exports = {
    getDurationOptions,
    getPerks,
};