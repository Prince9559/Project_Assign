// services/filterService.js
const FilterOption = require('../models/filterOption');

class FilterService {
    // Cache for better performance
    static cache = new Map();
    static cacheExpiry = new Map();
    static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    static async getFilterOptions(category) {
        const cacheKey = `filter_${category}`;
        const now = Date.now();

        // Check cache first
        if (this.cache.has(cacheKey) && this.cacheExpiry.get(cacheKey) > now) {
            return this.cache.get(cacheKey);
        }

        try {
            const options = await FilterOption.findAll({
                where: {
                    category: category,
                    is_active: true
                },
                order: [['value', 'ASC']],
                attributes: ['value']
            });

            const values = options.map(option => option.value);

            // Update cache
            this.cache.set(cacheKey, values);
            this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);

            return values;
        } catch (error) {
            console.error(`Error fetching ${category} options:`, error);
            return [];
        }
    }

    static async getAllFilters() {
        const [cities, duration, perks] = await Promise.all([
            this.getFilterOptions('cities'),
            this.getFilterOptions('duration'),
            this.getFilterOptions('perks')
        ]);

        return {
            allowedCities: cities,
            durationOptions: duration,
            allowedPerks: perks,
        };
    }

    static clearCache() {
        this.cache.clear();
        this.cacheExpiry.clear();
    }
}

module.exports = FilterService;