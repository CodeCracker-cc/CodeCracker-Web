const Joi = require('joi');
const config = require('../../../config/serviceConfig');

const communitySchemas = {
  createPost: Joi.object({
    title: Joi.string()
      .min(5)
      .max(config.community.postLimits.titleMaxLength)
      .required(),
    content: Joi.string()
      .min(10)
      .max(config.community.postLimits.contentMaxLength)
      .required(),
    challengeId: Joi.string().hex().length(24),
    tags: Joi.array().items(Joi.string()).max(5)
  }),

  createComment: Joi.object({
    content: Joi.string()
      .min(1)
      .max(1000)
      .required(),
    postId: Joi.string().hex().length(24).required()
  }),

  rateChallenge: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    review: Joi.string().max(500)
  })
};

module.exports = communitySchemas; 