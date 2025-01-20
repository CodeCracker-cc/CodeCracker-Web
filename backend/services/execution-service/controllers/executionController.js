const ExecutionService = require('../services/executionService');
const ExecutionResult = require('../models/ExecutionResult');

class ExecutionController {
  async execute(req, res) {
    try {
      const { code, language, testCases, submissionId } = req.body;

      const result = await ExecutionService.executeCode(code, language, testCases);
      
      // Speichere das Ergebnis
      await ExecutionResult.create({
        submissionId,
        language,
        status: result.success ? 'success' : 'failed',
        results: result.results,
        totalExecutionTime: result.totalExecutionTime
      });

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }
}

module.exports = new ExecutionController(); 