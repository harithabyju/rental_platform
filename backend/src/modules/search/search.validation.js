const Joi = require('joi');

const searchSchema = Joi.object({
    q: Joi.string().allow('').default(''),
    category: Joi.string().allow('', null).optional(),
    lat: Joi.number().min(-90).max(90).optional().allow(null),
    lng: Joi.number().min(-180).max(180).optional().allow(null),
    radius: Joi.number().min(1).max(5000).default(10),
    start_date: Joi.date().optional(),
    end_date: Joi.date().greater(Joi.ref('start_date')).optional(),
    sort: Joi.string().valid('distance', 'price', 'rating').default('distance'),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(50).default(10)
});

module.exports = {
    searchSchema
};
