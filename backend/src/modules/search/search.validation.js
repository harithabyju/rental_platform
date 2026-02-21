const Joi = require('joi');

const searchSchema = Joi.object({
    q: Joi.string().allow('').default(''),
    category: Joi.string().allow('', null).optional(),
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    radius: Joi.number().min(1).max(100).default(10),
    start_date: Joi.date().required(),
    end_date: Joi.date().greater(Joi.ref('start_date')).required(),
    sort: Joi.string().valid('distance', 'price', 'rating').default('distance'),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(50).default(10)
});

module.exports = {
    searchSchema
};
