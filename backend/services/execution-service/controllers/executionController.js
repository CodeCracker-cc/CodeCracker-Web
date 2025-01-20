const Docker = require('dockerode');
const fs = require('fs').promises;
const path = require('path');
const executionSchemas = require('../schemas/executionSchemas');
const validateRequest = require('../../../middleware/validateRequest');
const AppError = require('../../../utils/appError');
const logger = require('../../../utils/logger');
const config = require('../../../config/serviceConfig');

class ExecutionController {
  constructor() {
    this.docker = new Docker();
    this.supportedLanguages = config.execution.supportedLanguages;
  }

  async execute(req, res, next) {
    try {
      await validateRequest(executionSchemas.execute)(req, res, async () => {
        const { code, language, testCases } = req.body;

        if (!this.supportedLanguages.includes(language)) {
          throw new AppError(`Sprache ${language} wird nicht unterstützt`, 400);
        }

        const results = await Promise.all(
          testCases.map(testCase => this.runTest(code, language, testCase))
        );

        const success = results.every(result => result.passed);

        res.status(200).json({
          status: 'success',
          data: {
            success,
            results
          }
        });
      });
    } catch (err) {
      next(err);
    }
  }

  async runTest(code, language, testCase) {
    const containerId = await this.createContainer(language);
    
    try {
      await this.copyCodeToContainer(containerId, code, language);
      const result = await this.runCodeInContainer(
        containerId,
        language,
        testCase
      );
      
      return {
        passed: result.output.trim() === testCase.expectedOutput.trim(),
        output: result.output,
        error: result.error,
        executionTime: result.executionTime
      };
    } catch (err) {
      logger.error(`Code Execution Error: ${err.message}`);
      return {
        passed: false,
        error: err.message,
        executionTime: 0
      };
    } finally {
      await this.cleanupContainer(containerId);
    }
  }

  async createContainer(language) {
    const container = await this.docker.createContainer({
      Image: `codecracker-${language}`,
      Cmd: ['/bin/sh'],
      WorkingDir: '/app',
      NetworkDisabled: true,
      HostConfig: {
        Memory: config.execution.containerLimits.memory,
        CpuQuota: config.execution.containerLimits.cpu * 100000,
        PidsLimit: 50
      }
    });

    await container.start();
    return container.id;
  }

  async cleanupContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      await container.stop();
      await container.remove();
    } catch (err) {
      logger.error(`Container Cleanup Error: ${err.message}`);
    }
  }
}

module.exports = new ExecutionController(); 