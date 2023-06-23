const Joi = require('joi');

module.exports.create = Joi.object({
    prompt: Joi.string().required(),
    alias: Joi.string().max(100).required(),
}).unknown(true)