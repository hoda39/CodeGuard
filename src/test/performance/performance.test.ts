import * as vscode from 'vscode';
import { AnalysisManager } from '../../analysis/analysis-manager';
import { ConfigManager } from '../../config/config-manager';
import { DiagnosticManager } from '../../diagnostics/diagnostic-manager';
import { StatusBarManager } from '../../ui/status-bar-manager';
import { OutputManager } from '../../ui/output-manager';
import { ProgressManager } from '../../ui/progress-manager';

describe('Performance Tests', () => {
  let analysisManager: AnalysisManager;
  let configManager: ConfigManager;
  let diagnosticManager: DiagnosticManager;
  let statusBarManager: StatusBarManager;
  let outputManager: OutputManager;
  let progressManager: ProgressManager;
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
    outputManager = new OutputManager(mockContext);
    configManager = new ConfigManager(mockContext);
    diagnosticManager = new DiagnosticManager(mockContext);
    statusBarManager = new StatusBarManager(mockContext);
    progressManager = new ProgressManager(outputManager);

    // Create analysis manager with real dependencies
    analysisManager = new AnalysisManager(mockContext, {
      configManager,
      diagnosticManager,
      statusBarManager,
      outputManager,
      progressManager
    });
  });

  describe('Large File Analysis Performance', () => {
    it('should handle large C++ files efficiently', async () => {
      // Generate large test file (10,000 lines)
      const largeCode = generateLargeTestFile(10000);
      
      const startTime = Date.now();
      
      // Mock static analysis for large file
      const mockStaticAnalysis = {
        runAnalysis: jest.fn().mockResolvedValue({
          success: true,
          vulnerabilities: [],
          errors: [],
          duration: 5000
        })
      };

      (analysisManager as any).staticAnalysis = mockStaticAnalysis;

      // Run analysis
      await analysisManager.runAnalysisByType('static', 'large_test.cpp');

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Performance assertions
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(mockStaticAnalysis.runAnalysis).toHaveBeenCalled();
    });

    it('should handle multiple concurrent analyses', async () => {
      const testFiles = [
        'test1.cpp',
        'test2.cpp', 
        'test3.cpp'
      ];

      const startTime = Date.now();

      // Mock static analysis
      const mockStaticAnalysis = {
        runAnalysis: jest.fn().mockResolvedValue({
          success: true,
          vulnerabilities: [],
          errors: [],
          duration: 1000
        })
      };

      (analysisManager as any).staticAnalysis = mockStaticAnalysis;

      // Run concurrent analyses
      const promises = testFiles.map(file => 
        analysisManager.runAnalysisByType('static', file)
      );

      await Promise.all(promises);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Performance assertions
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(mockStaticAnalysis.runAnalysis).toHaveBeenCalledTimes(3);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should maintain reasonable memory usage during analysis', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Generate multiple large files
      const largeFiles = Array.from({ length: 5 }, (_, i) => 
        generateLargeTestFile(5000, i)
      );

      // Mock static analysis
      const mockStaticAnalysis = {
        runAnalysis: jest.fn().mockResolvedValue({
          success: true,
          vulnerabilities: [],
          errors: [],
          duration: 1000
        })
      };

      (analysisManager as any).staticAnalysis = mockStaticAnalysis;

      // Run analyses sequentially
      for (let i = 0; i < largeFiles.length; i++) {
        await analysisManager.runAnalysisByType('static', `large_file_${i}.cpp`);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory usage assertions (should not increase by more than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('UI Responsiveness Performance', () => {
    it('should maintain UI responsiveness during analysis', async () => {
      const uiUpdateTimes: number[] = [];
      
      // Mock status bar updates
      const originalUpdateStatus = statusBarManager.updateStatus.bind(statusBarManager);
      statusBarManager.updateStatus = jest.fn((status: string) => {
        uiUpdateTimes.push(Date.now());
        return originalUpdateStatus(status);
      });

      // Mock static analysis with progress updates
      const mockStaticAnalysis = {
        runAnalysis: jest.fn().mockImplementation(async () => {
          // Simulate progress updates
          for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            statusBarManager.updateStatus(`Progress ${i * 10}%`);
          }
          
          return {
            success: true,
            vulnerabilities: [],
            errors: [],
            duration: 1000
          };
        })
      };

      (analysisManager as any).staticAnalysis = mockStaticAnalysis;

      const startTime = Date.now();
      await analysisManager.runAnalysisByType('static', 'test.cpp');
      const endTime = Date.now();

      // UI responsiveness assertions
      expect(uiUpdateTimes.length).toBeGreaterThan(0);
      
      // Check that UI updates are frequent (at least every 200ms)
      for (let i = 1; i < uiUpdateTimes.length; i++) {
        const timeDiff = uiUpdateTimes[i] - uiUpdateTimes[i - 1];
        expect(timeDiff).toBeLessThan(200);
      }
    });
  });

  describe('Diagnostic Performance', () => {
    it('should handle large numbers of vulnerabilities efficiently', async () => {
      const largeVulnerabilitySet = generateLargeVulnerabilitySet(1000);
      
      const startTime = Date.now();
      
      // Add large number of vulnerabilities
      diagnosticManager.addVulnerabilities('test.cpp', largeVulnerabilitySet);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Performance assertions
      expect(processingTime).toBeLessThan(1000); // Should process within 1 second
      expect(diagnosticManager.getVulnerabilities('test.cpp')).toHaveLength(1000);
    });

    it('should efficiently clear large diagnostic sets', async () => {
      const largeVulnerabilitySet = generateLargeVulnerabilitySet(500);
      
      // Add vulnerabilities
      diagnosticManager.addVulnerabilities('test.cpp', largeVulnerabilitySet);
      expect(diagnosticManager.getVulnerabilities('test.cpp')).toHaveLength(500);
      
      const startTime = Date.now();
      
      // Clear vulnerabilities
      diagnosticManager.clearVulnerabilities('test.cpp');
      
      const endTime = Date.now();
      const clearingTime = endTime - startTime;

      // Performance assertions
      expect(clearingTime).toBeLessThan(500); // Should clear within 500ms
      expect(diagnosticManager.getVulnerabilities('test.cpp')).toHaveLength(0);
    });
  });

  describe('Configuration Performance', () => {
    it('should handle configuration updates efficiently', async () => {
      const configUpdates = Array.from({ length: 100 }, (_, i) => ({
        analysis: { defaultMode: (i % 2 === 0 ? 'static' : 'dynamic') as 'static' | 'dynamic' },
        static: { 
          inferenceMode: (i % 2 === 0 ? 'Local' : 'On Premise') as 'Local' | 'On Premise',
          inferenceServerURL: 'http://localhost:8000',
          useCUDA: i % 2 === 0
        }
      }));

      const startTime = Date.now();

      // Apply multiple configuration updates
      for (const update of configUpdates) {
        await configManager.updateConfig(update);
      }

      const endTime = Date.now();
      const updateTime = endTime - startTime;

      // Performance assertions
      expect(updateTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});

// Helper functions
function generateLargeTestFile(lineCount: number, fileIndex: number = 0): string {
  const lines: string[] = [];
  
  lines.push('#include <stdio.h>');
  lines.push('#include <stdlib.h>');
  lines.push('#include <string.h>');
  lines.push('');
  lines.push(`// Large test file ${fileIndex} with ${lineCount} lines`);
  lines.push('int main() {');
  
  for (let i = 0; i < lineCount - 10; i++) {
    lines.push(`    int var${i} = ${i}; // Line ${i + 6}`);
  }
  
  lines.push('    return 0;');
  lines.push('}');
  
  return lines.join('\n');
}

function generateLargeVulnerabilitySet(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `VULN-${i.toString().padStart(3, '0')}`,
    type: (i % 2 === 0 ? 'static' : 'dynamic') as 'static' | 'dynamic',
    severity: (['Critical', 'High', 'Medium', 'Low'][i % 4]) as 'Critical' | 'High' | 'Medium' | 'Low',
    message: `Test vulnerability ${i}`,
    line: i + 1,
    range: new vscode.Range(i, 0, i, 20),
    source: 'CodeGuard Performance Test'
  }));
} 