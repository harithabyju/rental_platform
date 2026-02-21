const { query: expressQuery } = require('express');

/**
 * Validate search query parameters
 */
exports.validateSearch = (req, res, next) => {
    const { minPrice, maxPrice, page, pageSize } = req.query;

    if (minPrice !== undefined && (isNaN(parseFloat(minPrice)) || parseFloat(minPrice) < 0)) {
        return res.status(400).json({ success: false, message: 'minPrice must be a non-negative number' });
    }

    if (maxPrice !== undefined && (isNaN(parseFloat(maxPrice)) || parseFloat(maxPrice) < 0)) {
        return res.status(400).json({ success: false, message: 'maxPrice must be a non-negative number' });
    }

    if (minPrice !== undefined && maxPrice !== undefined && parseFloat(minPrice) > parseFloat(maxPrice)) {
        return res.status(400).json({ success: false, message: 'minPrice cannot be greater than maxPrice' });
    }

    if (page !== undefined && (isNaN(parseInt(page, 10)) || parseInt(page, 10) < 1)) {
        return res.status(400).json({ success: false, message: 'page must be a positive integer' });
    }

    if (pageSize !== undefined && (isNaN(parseInt(pageSize, 10)) || parseInt(pageSize, 10) < 1 || parseInt(pageSize, 10) > 100)) {
        return res.status(400).json({ success: false, message: 'pageSize must be between 1 and 100' });
    }

    next();
};

/**
 * Validate category ID param
 */
exports.validateCategoryId = (req, res, next) => {
    const { categoryId } = req.params;
    if (!categoryId || isNaN(parseInt(categoryId, 10)) || parseInt(categoryId, 10) < 1) {
        return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }
    next();
};

/**
 * Validate item ID param
 */
exports.validateItemId = (req, res, next) => {
    const { itemId } = req.params;
    if (!itemId || isNaN(parseInt(itemId, 10)) || parseInt(itemId, 10) < 1) {
        return res.status(400).json({ success: false, message: 'Invalid item ID' });
    }
    next();
};
