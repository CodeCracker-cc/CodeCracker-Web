const Joi = require('joi');

const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    username: Joi.string().min(3).max(20).required(),
    role: Joi.string().valid('user', 'admin', 'moderator').default('user')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    bio: Joi.string().max(500),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark'),
      language: Joi.string().valid('de', 'en'),
      notifications: Joi.object({
        email: Joi.boolean(),
        push: Joi.boolean()
      })
    })
  })
};

module.exports = authSchemas; 