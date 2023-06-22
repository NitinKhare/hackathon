const Joi = require('joi');

module.exports.create = Joi.object({
    organisationName: Joi.string().required(),
    organisationUrl: Joi.string().uri().required(),
    organisationSize: Joi.string(),
    processed: Joi.string(),
    email: Joi.string().required(),
    aboutPage: Joi.string().uri()
})