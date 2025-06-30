import * as vscode from 'vscode';
import { AnalysisManager } from '../../analysis/analysis-manager';
import { ConfigManager } from '../../config/config-manager';
import { DiagnosticManager } from '../../diagnostics/diagnostic-manager';
import { StatusBarManager } from '../../ui/status-bar-manager';
import { OutputManager } from '../../ui/output-manager';
import { ProgressManager } from '../../ui/progress-manager';
import { StaticAnalysis } from '../../static/static-analysis';
import { DynamicAnalysis } from '../../dynamic/dynamic-analysis';

describe('Analysis Workflow Integration Tests', () => {
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

    // Initialize real managers
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

  describe('Static Analysis Workflow', () => {
    it('should complete static analysis workflow successfully', async () => {
      // Mock active editor
      const mockDocument = {
        fileName: 'test.cpp',
        uri: vscode.Uri.file('test.cpp'),
        languageId: 'cpp'
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument
      } as vscode.TextEditor;

      jest.spyOn(vscode.window, 'activeTextEditor', 'get').mockReturnValue(mockEditor);

      // Mock static analysis to return success
      const mockStaticAnalysis = {
        runAnalysis: jest.fn().mockResolvedValue({
          success: true,
          vulnerabilities: [
            {
              id: 'STATIC-001',
              type: 'static',
              severity: 'High',
              message: 'Buffer overflow vulnerability detected',
              line: 10,
              range: new vscode.Range(9, 0, 9, 20),
              source: 'CodeGuard Static Analysis'
            }
          ],
          errors: [],
          duration: 1500
        })
      };

      // Replace static analysis instance
      (analysisManager as any).staticAnalysis = mockStaticAnalysis;

      // Run static analysis
      await analysisManager.runStaticAnalysis();

      // Verify workflow completed
      expect(mockStaticAnalysis.runAnalysis).toHaveBeenCalledWith('test.cpp', expect.any(Object));
      expect(diagnosticManager.getVulnerabilities('test.cpp')).toHaveLength(1);
    });

    it('should handle static analysis errors gracefully', async () => {
      // Mock active editor
      const mockDocument = {
        fileName: 'test.cpp',
        uri: vscode.Uri.file('test.cpp'),
        languageId: 'cpp'
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument
      } as vscode.TextEditor;

      jest.spyOn(vscode.window, 'activeTextEditor', 'get').mockReturnValue(mockEditor);

      // Mock static analysis to return error
      const mockStaticAnalysis = {
        runAnalysis: jest.fn().mockResolvedValue({
          success: false,
          vulnerabilities: [],
          errors: ['Docker container failed to start'],
          duration: 500
        })
      };

      // Replace static analysis instance
      (analysisManager as any).staticAnalysis = mockStaticAnalysis;

      // Run static analysis
      await analysisManager.runStaticAnalysis();

      // Verify error handling
      expect(mockStaticAnalysis.runAnalysis).toHaveBeenCalled();
      expect(diagnosticManager.getVulnerabilities('test.cpp')).toHaveLength(0);
    });
  });

  describe('Dynamic Analysis Workflow', () => {
    it('should complete dynamic analysis workflow successfully', async () => {
      // Mock active editor
      const mockDocument = {
        fileName: 'test.cpp',
        uri: vscode.Uri.file('test.cpp'),
        languageId: 'cpp'
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument
      } as vscode.TextEditor;

      jest.spyOn(vscode.window, 'activeTextEditor', 'get').mockReturnValue(mockEditor);

      // Mock dynamic analysis to return success
      const mockDynamicAnalysis = {
        runAnalysis: jest.fn().mockResolvedValue({
          success: true,
          vulnerabilities: [
            {
              id: 'DYNAMIC-001',
              type: 'dynamic',
              severity: 'Critical',
              message: 'Memory leak detected during execution',
              line: 25,
              range: new vscode.Range(24, 0, 24, 15),
              source: 'CodeGuard Dynamic Analysis'
            }
          ],
          errors: [],
          duration: 3000
        })
      };

      // Replace dynamic analysis instance
      (analysisManager as any).dynamicAnalysis = mockDynamicAnalysis;

      // Run dynamic analysis
      await analysisManager.runDynamicAnalysis();

      // Verify workflow completed
      expect(mockDynamicAnalysis.runAnalysis).toHaveBeenCalledWith('test.cpp', expect.any(Object));
      expect(diagnosticManager.getVulnerabilities('test.cpp')).toHaveLength(1);
    });

    it('should handle dynamic analysis timeout', async () => {
      // Mock active editor
      const mockDocument = {
        fileName: 'test.cpp',
        uri: vscode.Uri.file('test.cpp'),
        languageId: 'cpp'
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument
      } as vscode.TextEditor;

      jest.spyOn(vscode.window, 'activeTextEditor', 'get').mockReturnValue(mockEditor);

      // Mock dynamic analysis to timeout
      const mockDynamicAnalysis = {
        runAnalysis: jest.fn().mockResolvedValue({
          success: false,
          vulnerabilities: [],
          errors: ['Analysis timed out after 600 seconds'],
          duration: 600000
        })
      };

      // Replace dynamic analysis instance
      (analysisManager as any).dynamicAnalysis = mockDynamicAnalysis;

      // Run dynamic analysis
      await analysisManager.runDynamicAnalysis();

      // Verify timeout handling
      expect(mockDynamicAnalysis.runAnalysis).toHaveBeenCalled();
      expect(diagnosticManager.getVulnerabilities('test.cpp')).toHaveLength(0);
    });
  });

  describe('Combined Analysis Workflow', () => {
    it('should complete combined analysis workflow successfully', async () => {
      // Mock active editor
      const mockDocument = {
        fileName: 'test.cpp',
        uri: vscode.Uri.file('test.cpp'),
        languageId: 'cpp'
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument
      } as vscode.TextEditor;

      jest.spyOn(vscode.window, 'activeTextEditor', 'get').mockReturnValue(mockEditor);

      // Mock both analyses
      const mockStaticAnalysis = {
        runAnalysis: jest.fn().mockResolvedValue({
          success: true,
          vulnerabilities: [
            {
              id: 'STATIC-001',
              type: 'static',
              severity: 'High',
              message: 'Buffer overflow vulnerability detected',
              line: 10,
              range: new vscode.Range(9, 0, 9, 20),
              source: 'CodeGuard Static Analysis'
            }
          ],
          errors: [],
          duration: 1500
        })
      };

      const mockDynamicAnalysis = {
        runAnalysis: jest.fn().mockResolvedValue({
          success: true,
          vulnerabilities: [
            {
              id: 'DYNAMIC-001',
              type: 'dynamic',
              severity: 'Critical',
              message: 'Memory leak detected during execution',
              line: 25,
              range: new vscode.Range(24, 0, 24, 15),
              source: 'CodeGuard Dynamic Analysis'
            }
          ],
          errors: [],
          duration: 3000
        })
      };

      // Replace analysis instances
      (analysisManager as any).staticAnalysis = mockStaticAnalysis;
      (analysisManager as any).dynamicAnalysis = mockDynamicAnalysis;

      // Run combined analysis
      await analysisManager.runAnalysisByType('both', 'test.cpp');

      // Verify both analyses ran
      expect(mockStaticAnalysis.runAnalysis).toHaveBeenCalled();
      expect(mockDynamicAnalysis.runAnalysis).toHaveBeenCalled();
      expect(diagnosticManager.getVulnerabilities('test.cpp')).toHaveLength(2);
    });

    it('should handle partial failure in combined analysis', async () => {
      // Mock active editor
      const mockDocument = {
        fileName: 'test.cpp',
        uri: vscode.Uri.file('test.cpp'),
        languageId: 'cpp'
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument
      } as vscode.TextEditor;

      jest.spyOn(vscode.window, 'activeTextEditor', 'get').mockReturnValue(mockEditor);

      // Mock static success, dynamic failure
      const mockStaticAnalysis = {
        runAnalysis: jest.fn().mockResolvedValue({
          success: true,
          vulnerabilities: [
            {
              id: 'STATIC-001',
              type: 'static',
              severity: 'High',
              message: 'Buffer overflow vulnerability detected',
              line: 10,
              range: new vscode.Range(9, 0, 9, 20),
              source: 'CodeGuard Static Analysis'
            }
          ],
          errors: [],
          duration: 1500
        })
      };

      const mockDynamicAnalysis = {
        runAnalysis: jest.fn().mockResolvedValue({
          success: false,
          vulnerabilities: [],
          errors: ['Dynamic analysis failed'],
          duration: 1000
        })
      };

      // Replace analysis instances
      (analysisManager as any).staticAnalysis = mockStaticAnalysis;
      (analysisManager as any).dynamicAnalysis = mockDynamicAnalysis;

      // Run combined analysis
      await analysisManager.runAnalysisByType('both', 'test.cpp');

      // Verify partial success
      expect(mockStaticAnalysis.runAnalysis).toHaveBeenCalled();
      expect(mockDynamicAnalysis.runAnalysis).toHaveBeenCalled();
      expect(diagnosticManager.getVulnerabilities('test.cpp')).toHaveLength(1);
    });
  });

  describe('Analysis Selection Workflow', () => {
    it('should show analysis selection dialog when mode is "ask"', async () => {
      // Mock configuration
      configManager.getAnalysisConfig = jest.fn().mockReturnValue({ defaultMode: 'ask' });

      // Mock active editor
      const mockDocument = {
        fileName: 'test.cpp',
        uri: vscode.Uri.file('test.cpp'),
        languageId: 'cpp'
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument
      } as vscode.TextEditor;

      jest.spyOn(vscode.window, 'activeTextEditor', 'get').mockReturnValue(mockEditor);

      // Mock quick pick
      const mockQuickPick = {
        label: 'Static Analysis',
        description: 'AI-powered vulnerability detection',
        value: 'static'
      };

      jest.spyOn(vscode.window, 'showQuickPick').mockResolvedValue(mockQuickPick as any);

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

      // Run analysis with selection
      await analysisManager.runAnalysisWithSelection();

      // Verify selection dialog was shown
      expect(vscode.window.showQuickPick).toHaveBeenCalled();
      expect(mockStaticAnalysis.runAnalysis).toHaveBeenCalled();
    });

    it('should use default mode when not "ask"', async () => {
      // Mock configuration
      configManager.getAnalysisConfig = jest.fn().mockReturnValue({ defaultMode: 'static' });

      // Mock active editor
      const mockDocument = {
        fileName: 'test.cpp',
        uri: vscode.Uri.file('test.cpp'),
        languageId: 'cpp'
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument
      } as vscode.TextEditor;

      jest.spyOn(vscode.window, 'activeTextEditor', 'get').mockReturnValue(mockEditor);

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

      // Run analysis with selection
      await analysisManager.runAnalysisWithSelection();

      // Verify no selection dialog was shown
      expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
      expect(mockStaticAnalysis.runAnalysis).toHaveBeenCalled();
    });
  });

  describe('Concurrent Analysis Handling', () => {
    it('should prevent multiple analyses from running simultaneously', async () => {
      // Mock active editor
      const mockDocument = {
        fileName: 'test.cpp',
        uri: vscode.Uri.file('test.cpp'),
        languageId: 'cpp'
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument
      } as vscode.TextEditor;

      jest.spyOn(vscode.window, 'activeTextEditor', 'get').mockReturnValue(mockEditor);

      // Mock warning dialog
      jest.spyOn(vscode.window, 'showWarningMessage').mockResolvedValue('Keep Running' as any);

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

      // Start first analysis
      const firstAnalysis = analysisManager.runStaticAnalysis();

      // Try to start second analysis immediately
      const secondAnalysis = analysisManager.runStaticAnalysis();

      // Wait for both to complete
      await Promise.all([firstAnalysis, secondAnalysis]);

      // Verify warning was shown
      expect(vscode.window.showWarningMessage).toHaveBeenCalled();
    });
  });
}); 