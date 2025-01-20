const Docker = require('dockerode');
const docker = new Docker();
const fs = require('fs').promises;
const path = require('path');

class ExecutionService {
  constructor() {
    this.timeoutMs = 10000; // 10 Sekunden Timeout
    this.memoryLimit = '50m'; // 50MB RAM Limit
  }

  async executeCode(code, language, testCases) {
    const containerConfig = this.getContainerConfig(language);
    const results = [];
    let totalExecutionTime = 0;

    try {
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const container = await docker.createContainer({
          ...containerConfig,
          HostConfig: {
            Memory: this.memoryLimit,
            MemorySwap: this.memoryLimit,
            NetworkMode: 'none', // Keine Netzwerkverbindung erlaubt
            PidsLimit: 100 // Prozess-Limit
          }
        });

        const startTime = Date.now();
        const { output, error } = await this.runContainer(container, code, testCase.input);
        const executionTime = Date.now() - startTime;
        totalExecutionTime += executionTime;

        results.push({
          testCase: i,
          passed: output.trim() === testCase.expectedOutput.trim(),
          output: output,
          error: error,
          executionTime
        });

        await container.remove({ force: true });
      }

      return {
        success: results.every(r => r.passed),
        results,
        totalExecutionTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        results: [],
        totalExecutionTime
      };
    }
  }

  getContainerConfig(language) {
    const configs = {
      python: {
        Image: 'python:3.9-slim',
        Cmd: ['python', '-c'],
        WorkingDir: '/code'
      },
      javascript: {
        Image: 'node:16-alpine',
        Cmd: ['node', '-e'],
        WorkingDir: '/code'
      },
      // Weitere Sprachen können hier hinzugefügt werden
    };

    return configs[language] || configs.python;
  }

  async runContainer(container, code, input) {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        container.kill();
        reject(new Error('Zeitüberschreitung bei der Code-Ausführung'));
      }, this.timeoutMs);

      try {
        await container.start();
        
        const exec = await container.exec({
          Cmd: [...container.Config.Cmd, code],
          AttachStdout: true,
          AttachStderr: true
        });

        const stream = await exec.start();
        let output = '';
        let error = '';

        stream.on('data', (chunk) => {
          output += chunk.toString();
        });

        stream.on('error', (err) => {
          error += err.toString();
        });

        stream.on('end', () => {
          clearTimeout(timeout);
          resolve({ output, error });
        });
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });
  }
}

module.exports = new ExecutionService(); 