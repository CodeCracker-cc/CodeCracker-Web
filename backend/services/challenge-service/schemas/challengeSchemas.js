const Joi = require('joi');
const config = require('../../../config/serviceConfig');

const challengeSchemas = {
  createChallenge: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(20).required(),
    difficulty: Joi.string()
      .valid('beginner', 'intermediate', 'advanced', 'expert')
      .required(),
    category: Joi.string()
      .valid(...config.challenge.categories)
      .required(),
    points: Joi.number().min(1).max(100).required(),
    testCases: Joi.array().items(
      Joi.object({
        input: Joi.string().required(),
        expectedOutput: Joi.string().required(),
        isHidden: Joi.boolean().default(false),
        timeLimit: Joi.number().default(2000),
        memoryLimit: Joi.number().default(50)
      })
    ).min(1).required(),
    solutionTemplate: Joi.string().required(),
    supportedLanguages: Joi.array()
      .items(Joi.string().valid(...config.execution.supportedLanguages))
      .min(1)
      .required()
  }),

  submitSolution: Joi.object({
    code: Joi.string().max(10000).required(),
    language: Joi.string()
      .valid(...config.execution.supportedLanguages)
      .required()
  }),

  updateChallenge: Joi.object({
    title: Joi.string().min(5).max(100),
    description: Joi.string().min(20),
    difficulty: Joi.string()
      .valid('beginner', 'intermediate', 'advanced', 'expert'),
    category: Joi.string()
      .valid(...config.challenge.categories),
    points: Joi.number().min(1).max(100),
    testCases: Joi.array().items(
      Joi.object({
        input: Joi.string().required(),
        expectedOutput: Joi.string().required(),
        isHidden: Joi.boolean().default(false),
        timeLimit: Joi.number().default(2000),
        memoryLimit: Joi.number().default(50)
      })
    ),
    solutionTemplate: Joi.string(),
    supportedLanguages: Joi.array()
      .items(Joi.string().valid(...config.execution.supportedLanguages))
      .min(1)
  }).min(1),

  queryParams: Joi.object({
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert'),
    category: Joi.string().valid(...config.challenge.categories),
    sort: Joi.string().valid('points', 'difficulty', 'createdAt'),
    limit: Joi.number().min(1).max(100).default(10),
    page: Joi.number().min(1).default(1)
  })
};

module.exports = challengeSchemas; 