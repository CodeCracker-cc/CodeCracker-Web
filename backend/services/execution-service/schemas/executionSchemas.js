const Joi = require('joi');
const config = require('../../../config/serviceConfig');

const executionSchemas = {
  execute: Joi.object({
    code: Joi.string().max(10000).required(),
    language: Joi.string()
      .valid(...config.execution.supportedLanguages)
      .required(),
    testCases: Joi.array().items(
      Joi.object({
        input: Joi.string().required(),
        expectedOutput: Joi.string().required(),
        timeLimit: Joi.number()
          .max(config.execution.containerLimits.timeout)
          .default(2000),
        memoryLimit: Joi.number()
          .max(parseInt(config.execution.containerLimits.memory))
          .default(50)
      })
    ).required()
  })
};

module.exports = executionSchemas; 