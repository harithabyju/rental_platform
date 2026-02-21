const searchService = require('./search.service');
const { searchSchema } = require('./search.validation');

const getSearchResults = async (req, res, next) => {
    try {
        const { error, value } = searchSchema.validate(req.query);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const results = await searchService.searchItems(value);
        res.json(results);
    } catch (err) {
        console.error('Search error:', err);
        next(err);
    }
};

module.exports = {
    getSearchResults
};
