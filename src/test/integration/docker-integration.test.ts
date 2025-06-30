import * as vscode from 'vscode';
import { DockerRunner } from '../../shared/docker-runner';
import { ConfigManager } from '../../config/config-manager';

describe('Docker Integration Tests', () => {
  let dockerRunner: DockerRunner;
  let configManager: ConfigManager;
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    // Create mock context
    mockContext = {
      subscriptions: [],
      extensionMode: vscode.ExtensionMode.Development,
      globalState: {
        get: jest.fn(),
        update: jest.fn()
      },
      workspaceState: {
        get: jest.fn(),
        update: jest.fn()
      }
    } as any;

    // Initialize managers
    configManager = new ConfigManager(mockContext);
    dockerRunner = new DockerRunner(configManager);
  });

  describe('Docker Container Management', () => {
    it('should build static analysis container successfully', async () => {
      // Mock Docker build command
      const mockExec = jest.fn().mockResolvedValue({
        stdout: 'Successfully built abc123',
        stderr: '',
        exitCode: 0
      });

      // Mock child_process.exec
      jest.doMock('child_process', () => ({
        exec: mockExec
      }));

      const result = await dockerRunner.buildStaticContainer();
      
      expect(result.success).toBe(true);
      expect(result.containerId).toBeDefined();
    });

    it('should build dynamic analysis container successfully', async () => {
      // Mock Docker build command
      const mockExec = jest.fn().mockResolvedValue({
        stdout: 'Successfully built def456',
        stderr: '',
        exitCode: 0
      });

      // Mock child_process.exec
      jest.doMock('child_process', () => ({
        exec: mockExec
      }));

      const result = await dockerRunner.buildDynamicContainer();
      
      expect(result.success).toBe(true);
      expect(result.containerId).toBeDefined();
    });

    it('should handle Docker build failures', async () => {
      // Mock Docker build failure
      const mockExec = jest.fn().mockResolvedValue({
        stdout: '',
        stderr: 'Error: Docker build failed',
        exitCode: 1
      });

      // Mock child_process.exec
      jest.doMock('child_process', () => ({
        exec: mockExec
      }));

      const result = await dockerRunner.buildStaticContainer();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Docker build failed');
    });
  });

  describe('Container Execution', () => {
    it('should run static analysis container successfully', async () => {
      const testCode = `
#include <stdio.h>
#include <string.h>

int main() {
    char buffer[10];
    strcpy(buffer, "This is a test string that is too long");
    return 0;
}
      `;

      // Mock Docker run command
      const mockExec = jest.fn().mockResolvedValue({
        stdout: JSON.stringify({
          vulnerabilities: [
            {
              id: 'BUFFER_OVERFLOW_001',
              type: 'static',
              severity: 'High',
              message: 'Buffer overflow detected',
              line: 6,
              range: { start: { line: 5, character: 0 }, end: { line: 5, character: 20 } },
              source: 'CodeGuard Static Analysis'
            }
          ],
          success: true,
          duration: 1500
        }),
        stderr: '',
        exitCode: 0
      });

      // Mock child_process.exec
      jest.doMock('child_process', () => ({
        exec: mockExec
      }));

      const result = await dockerRunner.runStaticAnalysis(testCode, 'test.cpp');
      
      expect(result.success).toBe(true);
      expect(result.vulnerabilities).toHaveLength(1);
      expect(result.vulnerabilities![0].id).toBe('BUFFER_OVERFLOW_001');
    });

    it('should run dynamic analysis container successfully', async () => {
      const testCode = `
#include <stdlib.h>

int main() {
    int* ptr = malloc(100);
    // Memory leak: ptr is not freed
    return 0;
}
      `;

      // Mock Docker run command
      const mockExec = jest.fn().mockResolvedValue({
        stdout: JSON.stringify({
          vulnerabilities: [
            {
              id: 'MEMORY_LEAK_001',
              type: 'dynamic',
              severity: 'Critical',
              message: 'Memory leak detected',
              line: 4,
              range: { start: { line: 3, character: 0 }, end: { line: 3, character: 15 } },
              source: 'CodeGuard Dynamic Analysis'
            }
          ],
          success: true,
          duration: 3000
        }),
        stderr: '',
        exitCode: 0
      });

      // Mock child_process.exec
      jest.doMock('child_process', () => ({
        exec: mockExec
      }));

      const result = await dockerRunner.runDynamicAnalysis(testCode, 'test.cpp');
      
      expect(result.success).toBe(true);
      expect(result.vulnerabilities).toHaveLength(1);
      expect(result.vulnerabilities![0].id).toBe('MEMORY_LEAK_001');
    });

    it('should handle container execution timeout', async () => {
      const testCode = `
#include <stdio.h>

int main() {
    while(1) {
        // Infinite loop
    }
    return 0;
}
      `;

      // Mock Docker run timeout
      const mockExec = jest.fn().mockRejectedValue(new Error('Command timed out'));

      // Mock child_process.exec
      jest.doMock('child_process', () => ({
        exec: mockExec
      }));

      const result = await dockerRunner.runStaticAnalysis(testCode, 'test.cpp');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    it('should handle container execution errors', async () => {
      const testCode = `
#include <stdio.h>

int main() {
    return 0;
}
      `;

      // Mock Docker run error
      const mockExec = jest.fn().mockResolvedValue({
        stdout: '',
        stderr: 'Error: Container failed to start',
        exitCode: 1
      });

      // Mock child_process.exec
      jest.doMock('child_process', () => ({
        exec: mockExec
      }));

      const result = await dockerRunner.runStaticAnalysis(testCode, 'test.cpp');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Container failed to start');
    });
  });

  describe('Container Cleanup', () => {
    it('should cleanup containers successfully', async () => {
      // Mock Docker rm command
      const mockExec = jest.fn().mockResolvedValue({
        stdout: 'container123',
        stderr: '',
        exitCode: 0
      });

      // Mock child_process.exec
      jest.doMock('child_process', () => ({
        exec: mockExec
      }));

      const result = await dockerRunner.cleanupContainer('container123');
      
      expect(result.success).toBe(true);
    });

    it('should handle cleanup failures gracefully', async () => {
      // Mock Docker rm failure
      const mockExec = jest.fn().mockResolvedValue({
        stdout: '',
        stderr: 'Error: No such container',
        exitCode: 1
      });

      // Mock child_process.exec
      jest.doMock('child_process', () => ({
        exec: mockExec
      }));

      const result = await dockerRunner.cleanupContainer('nonexistent');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No such container');
    });
  });

  describe('Docker Health Checks', () => {
    it('should check Docker availability', async () => {
      // Mock Docker version command
      const mockExec = jest.fn().mockResolvedValue({
        stdout: 'Docker version 20.10.0',
        stderr: '',
        exitCode: 0
      });

      // Mock child_process.exec
      jest.doMock('child_process', () => ({
        exec: mockExec
      }));

      const result = await dockerRunner.checkDockerAvailability();
      
      expect(result.available).toBe(true);
      expect(result.version).toContain('20.10.0');
    });

    it('should detect when Docker is not available', async () => {
      // Mock Docker version failure
      const mockExec = jest.fn().mockRejectedValue(new Error('Docker not found'));

      // Mock child_process.exec
      jest.doMock('child_process', () => ({
        exec: mockExec
      }));

      const result = await dockerRunner.checkDockerAvailability();
      
      expect(result.available).toBe(false);
      expect(result.error).toContain('Docker not found');
    });
  });

  describe('Resource Management', () => {
    it('should manage container resources efficiently', async () => {
      // Mock Docker stats command
      const mockExec = jest.fn().mockResolvedValue({
        stdout: JSON.stringify({
          memory: '50MB',
          cpu: '25%',
          network: '1KB'
        }),
        stderr: '',
        exitCode: 0
      });

      // Mock child_process.exec
      jest.doMock('child_process', () => ({
        exec: mockExec
      }));

      const stats = await dockerRunner.getContainerStats('container123');
      
      expect(stats.memory).toBe('50MB');
      expect(stats.cpu).toBe('25%');
    });

    it('should enforce resource limits', async () => {
      const testCode = `
#include <stdio.h>
#include <stdlib.h>

int main() {
    // Allocate large amount of memory
    void* ptr = malloc(1024 * 1024 * 1024); // 1GB
    return 0;
}
      `;

      // Mock Docker run with resource limits
      const mockExec = jest.fn().mockResolvedValue({
        stdout: JSON.stringify({
          vulnerabilities: [],
          success: true,
          duration: 1000,
          resourceUsage: {
            memory: '100MB',
            cpu: '10%'
          }
        }),
        stderr: '',
        exitCode: 0
      });

      // Mock child_process.exec
      jest.doMock('child_process', () => ({
        exec: mockExec
      }));

      const result = await dockerRunner.runStaticAnalysis(testCode, 'test.cpp');
      
      expect(result.success).toBe(true);
      expect(result.resourceUsage).toBeDefined();
    });
  });
}); 