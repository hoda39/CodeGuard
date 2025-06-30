import * as vscode from 'vscode';
import { AnalysisManager } from '../../analysis/analysis-manager';
import { ConfigManager } from '../../config/config-manager';
import { DiagnosticManager } from '../../diagnostics/diagnostic-manager';
import { StatusBarManager } from '../../ui/status-bar-manager';
import { OutputManager } from '../../ui/output-manager';
import { ProgressManager } from '../../ui/progress-manager';
import path from 'path';

// Mock dependencies
const mockContext = {
  subscriptions: [],
  extensionMode: vscode.ExtensionMode.Development,
  workspaceState: {
    get: jest.fn(),
    update: jest.fn(),
    keys: jest.fn().mockReturnValue([])
  },
  globalState: {
    get: jest.fn(),
    update: jest.fn(),
    keys: jest.fn().mockReturnValue([])
  },
  secrets: {
    get: jest.fn(),
    store: jest.fn(),
    delete: jest.fn()
  },
  extensionUri: vscode.Uri.file(__dirname),
  extensionPath: __dirname,
  storageUri: vscode.Uri.file(__dirname),
  globalStorageUri: vscode.Uri.file(__dirname),
  logUri: vscode.Uri.file(__dirname),
  extensionId: 'test.codeguard',
  environmentVariableCollection: {} as any,
  logOutputChannel: {} as any,
  asAbsolutePath: jest.fn((relativePath: string) => path.join(__dirname, relativePath)),
  storagePath: __dirname,
  globalStoragePath: __dirname,
  logPath: __dirname,
  extension: {} as any,
  languageModelAccessInformation: {} as any
} as unknown as vscode.ExtensionContext;

const mockConfigManager = {
  initialize: jest.fn(),
  getConfig: jest.fn(),
  getAnalysisConfig: jest.fn(),
  getStaticConfig: jest.fn(),
  getDynamicConfig: jest.fn(),
  getUIConfig: jest.fn()
} as any;

const mockDiagnosticManager = {
  initialize: jest.fn(),
  addVulnerabilities: jest.fn(),
  clearVulnerabilities: jest.fn(),
  getVulnerabilities: jest.fn(),
  cleanup: jest.fn()
} as any;

const mockStatusBarManager = {
  initialize: jest.fn(),
  updateStatus: jest.fn(),
  showProgress: jest.fn(),
  showSuccess: jest.fn(),
  showError: jest.fn(),
  cleanup: jest.fn()
} as any;

const mockOutputManager = {
  log: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  show: jest.fn(),
  clear: jest.fn(),
  appendLine: jest.fn()
} as any;

const mockProgressManager = {
  withProgress: jest.fn(),
  showStaticAnalysisProgress: jest.fn(),
  showDynamicAnalysisProgress: jest.fn(),
  showCombinedAnalysisProgress: jest.fn()
} as any;

describe('AnalysisManager', () => {
  let analysisManager: AnalysisManager;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock returns
    mockConfigManager.getConfig.mockReturnValue({
      analysis: { defaultMode: 'ask' },
      static: { inferenceMode: 'Local', inferenceServerURL: 'http://localhost:5000', useCUDA: false },
      dynamic: { apiURL: 'https://localhost:3000', containerTimeout: 600000 },
      diagnostics: { informationLevel: 'Verbose', diagnosticMessageInformation: [], showDescription: true, highlightSeverityType: 'Error', maxNumberOfLines: 1, delayBeforeAnalysis: 1500 },
      ui: { showProgressNotifications: true, showStatusBar: true, autoShowOutput: true, progressLocation: 'notification' }
    });
    
    mockConfigManager.getAnalysisConfig.mockReturnValue({ defaultMode: 'ask' });
    
    // Create analysis manager with mocked dependencies
    analysisManager = new AnalysisManager(mockContext, {
      configManager: mockConfigManager,
      diagnosticManager: mockDiagnosticManager,
      statusBarManager: mockStatusBarManager,
      outputManager: mockOutputManager,
      progressManager: mockProgressManager
    });
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await analysisManager.initialize();
      
      expect(mockOutputManager.log).toHaveBeenCalledWith('Analysis manager initialized');
    });

    it('should set max concurrent analyses based on configuration', async () => {
      mockConfigManager.getConfig.mockReturnValue({
        analysis: { defaultMode: 'both' },
        static: { inferenceMode: 'Local', inferenceServerURL: 'http://localhost:5000', useCUDA: false },
        dynamic: { apiURL: 'https://localhost:3000', containerTimeout: 600000 },
        diagnostics: { informationLevel: 'Verbose', diagnosticMessageInformation: [], showDescription: true, highlightSeverityType: 'Error', maxNumberOfLines: 1, delayBeforeAnalysis: 1500 },
        ui: { showProgressNotifications: true, showStatusBar: true, autoShowOutput: true, progressLocation: 'notification' }
      });

      await analysisManager.initialize();
      
      expect(mockOutputManager.log).toHaveBeenCalledWith('Analysis manager initialized');
    });
  });

  describe('analysis state management', () => {
    it('should track analysis running state correctly', () => {
      expect(analysisManager.isAnalysisRunning()).toBe(false);
      
      // Mock current analysis
      (analysisManager as any).currentAnalysis = {
        cancellationToken: new vscode.CancellationTokenSource(),
        type: 'static',
        filePath: 'test.cpp',
        startTime: Date.now()
      };
      
      expect(analysisManager.isAnalysisRunning()).toBe(true);
    });

    it('should return current analysis info', () => {
      const mockAnalysis = {
        cancellationToken: new vscode.CancellationTokenSource(),
        type: 'static',
        filePath: 'test.cpp',
        startTime: Date.now()
      };
      
      (analysisManager as any).currentAnalysis = mockAnalysis;
      
      const currentAnalysis = analysisManager.getCurrentAnalysis();
      expect(currentAnalysis).toBeDefined();
      expect(currentAnalysis?.type).toBe('static');
      expect(currentAnalysis?.filePath).toBe('test.cpp');
    });

    it('should return null when no analysis is running', () => {
      expect(analysisManager.getCurrentAnalysis()).toBeNull();
    });
  });

  describe('analysis cancellation', () => {
    it('should cancel running analysis', async () => {
      const mockCancellationToken = new vscode.CancellationTokenSource();
      (analysisManager as any).currentAnalysis = {
        cancellationToken: mockCancellationToken,
        type: 'static',
        filePath: 'test.cpp',
        startTime: Date.now()
      };

      await analysisManager.cancelAnalysis();
      
      expect(mockCancellationToken.cancel).toHaveBeenCalled();
      expect(mockStatusBarManager.updateStatus).toHaveBeenCalledWith('Analysis cancelled');
      expect(mockOutputManager.log).toHaveBeenCalledWith(expect.stringContaining('Analysis cancelled by user'));
    });

    it('should handle cancellation when no analysis is running', async () => {
      await analysisManager.cancelAnalysis();
      
      expect(mockStatusBarManager.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle analysis errors gracefully', () => {
      const errors = ['Test error 1', 'Test error 2'];
      const filePath = 'test.cpp';
      
      (analysisManager as any).handleAnalysisError(errors, filePath);
      
      expect(mockStatusBarManager.showError).toHaveBeenCalledWith('Analysis failed');
      expect(mockOutputManager.error).toHaveBeenCalledWith('Analysis failed: Test error 1, Test error 2');
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources properly', async () => {
      await analysisManager.cleanup();
      
      expect(mockOutputManager.log).toHaveBeenCalledWith('Analysis manager cleaned up');
    });
  });
}); 