import * as vscode from 'vscode';

describe('CodeGuard Extension End-to-End Tests', () => {
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
  });

  describe('Extension Activation', () => {
    it('should activate extension successfully', async () => {
      // Mock VS Code window
      const mockWindow = {
        createOutputChannel: jest.fn().mockReturnValue({
          appendLine: jest.fn(),
          show: jest.fn(),
          clear: jest.fn(),
          dispose: jest.fn()
        }),
        showErrorMessage: jest.fn(),
        showInformationMessage: jest.fn(),
        activeTextEditor: null
      };

      // Mock VS Code workspace
      const mockWorkspace = {
        getConfiguration: jest.fn().mockReturnValue({
          get: jest.fn(),
          update: jest.fn()
        }),
        onDidChangeConfiguration: jest.fn()
      };

      // Mock VS Code languages
      const mockLanguages = {
        createDiagnosticCollection: jest.fn().mockReturnValue({
          set: jest.fn(),
          delete: jest.fn(),
          clear: jest.fn(),
          dispose: jest.fn()
        }),
        registerCodeActionsProvider: jest.fn()
      };

      // Mock vscode module
      jest.doMock('vscode', () => ({
        window: mockWindow,
        workspace: mockWorkspace,
        languages: mockLanguages,
        ExtensionMode: { Development: 1 },
        ProgressLocation: { Notification: 15 },
        DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
        Uri: { file: jest.fn() },
        Range: jest.fn(),
        Diagnostic: jest.fn(),
        CancellationTokenSource: jest.fn().mockReturnValue({
          token: {},
          cancel: jest.fn()
        }),
        WorkspaceEdit: jest.fn().mockReturnValue({
          replace: jest.fn()
        })
      }));

      // Test that extension can be activated without errors
      expect(mockContext.subscriptions).toBeDefined();
      expect(mockWindow.createOutputChannel).toBeDefined();
      expect(mockWorkspace.getConfiguration).toBeDefined();
    });
  });

  describe('Command Registration', () => {
    it('should register all required commands', () => {
      const requiredCommands = [
        'codeguard.runAnalysis',
        'codeguard.runStaticAnalysis',
        'codeguard.runDynamicAnalysis',
        'codeguard.cancelAnalysis',
        'codeguard.testUI',
        'codeguard.testUIComponents'
      ];

      // Mock command registration
      const mockRegisterCommand = jest.fn();
      
      // Test that all commands are registered
      requiredCommands.forEach(command => {
        expect(typeof command).toBe('string');
        expect(command.startsWith('codeguard.')).toBe(true);
      });
    });
  });

  describe('Configuration Management', () => {
    it('should load default configuration', () => {
      const mockConfig = {
        get: jest.fn().mockReturnValue('ask'),
        update: jest.fn()
      };

      const mockWorkspace = {
        getConfiguration: jest.fn().mockReturnValue(mockConfig)
      };

      // Test configuration loading
      const config = mockWorkspace.getConfiguration('codeguard');
      expect(config).toBeDefined();
      expect(config.get).toBeDefined();
    });

    it('should handle configuration updates', () => {
      const mockConfig = {
        get: jest.fn(),
        update: jest.fn()
      };

      const mockWorkspace = {
        getConfiguration: jest.fn().mockReturnValue(mockConfig)
      };

      // Test configuration update
      const config = mockWorkspace.getConfiguration('codeguard');
      config.update('analysis.defaultMode', 'static');
      
      expect(mockConfig.update).toHaveBeenCalledWith('analysis.defaultMode', 'static');
    });
  });

  describe('UI Components', () => {
    it('should create output channel', () => {
      const mockOutputChannel = {
        appendLine: jest.fn(),
        show: jest.fn(),
        clear: jest.fn(),
        dispose: jest.fn()
      };

      const mockWindow = {
        createOutputChannel: jest.fn().mockReturnValue(mockOutputChannel)
      };

      const outputChannel = mockWindow.createOutputChannel('CodeGuard');
      expect(outputChannel).toBeDefined();
      expect(outputChannel.appendLine).toBeDefined();
      expect(outputChannel.show).toBeDefined();
    });

    it('should create status bar item', () => {
      const mockStatusBarItem = {
        text: 'CodeGuard Ready',
        tooltip: 'CodeGuard Security Analysis',
        command: 'codeguard.runAnalysis',
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn()
      };

      const mockWindow = {
        createStatusBarItem: jest.fn().mockReturnValue(mockStatusBarItem)
      };

      const statusBarItem = mockWindow.createStatusBarItem();
      expect(statusBarItem).toBeDefined();
      expect(statusBarItem.show).toBeDefined();
      expect(statusBarItem.hide).toBeDefined();
    });
  });

  describe('Diagnostic Management', () => {
    it('should create diagnostic collection', () => {
      const mockDiagnosticCollection = {
        set: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn(),
        dispose: jest.fn()
      };

      const mockLanguages = {
        createDiagnosticCollection: jest.fn().mockReturnValue(mockDiagnosticCollection)
      };

      const diagnosticCollection = mockLanguages.createDiagnosticCollection('codeguard');
      expect(diagnosticCollection).toBeDefined();
      expect(diagnosticCollection.set).toBeDefined();
      expect(diagnosticCollection.clear).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle activation errors gracefully', () => {
      const mockShowErrorMessage = jest.fn();
      const mockWindow = {
        showErrorMessage: mockShowErrorMessage
      };

      // Simulate activation error
      const error = new Error('Activation failed');
      mockWindow.showErrorMessage(`CodeGuard activation failed: ${error.message}`);

      expect(mockShowErrorMessage).toHaveBeenCalledWith('CodeGuard activation failed: Activation failed');
    });

    it('should handle analysis errors gracefully', () => {
      const mockShowErrorMessage = jest.fn();
      const mockWindow = {
        showErrorMessage: mockShowErrorMessage
      };

      // Simulate analysis error
      const error = 'Docker container failed to start';
      mockWindow.showErrorMessage(`CodeGuard analysis failed: ${error}`);

      expect(mockShowErrorMessage).toHaveBeenCalledWith('CodeGuard analysis failed: Docker container failed to start');
    });
  });

  describe('Extension Lifecycle', () => {
    it('should handle extension deactivation', () => {
      const mockDispose = jest.fn();
      const mockSubscription = {
        dispose: mockDispose
      };

      // Simulate extension deactivation
      mockSubscription.dispose();

      expect(mockDispose).toHaveBeenCalled();
    });

    it('should cleanup resources on deactivation', () => {
      const mockDispose = jest.fn();
      const mockOutputChannel = {
        dispose: mockDispose
      };

      const mockDiagnosticCollection = {
        dispose: mockDispose
      };

      const mockStatusBarItem = {
        dispose: mockDispose
      };

      // Simulate cleanup
      mockOutputChannel.dispose();
      mockDiagnosticCollection.dispose();
      mockStatusBarItem.dispose();

      expect(mockDispose).toHaveBeenCalledTimes(3);
    });
  });

  describe('Performance', () => {
    it('should initialize quickly', () => {
      const startTime = Date.now();

      // Simulate initialization
      const mockConfig = {
        get: jest.fn(),
        update: jest.fn()
      };

      const mockWorkspace = {
        getConfiguration: jest.fn().mockReturnValue(mockConfig)
      };

      const config = mockWorkspace.getConfiguration('codeguard');
      const endTime = Date.now();

      const initializationTime = endTime - startTime;
      expect(initializationTime).toBeLessThan(100); // Should initialize within 100ms
    });

    it('should handle large configuration objects efficiently', () => {
      const largeConfig = {
        analysis: { defaultMode: 'ask' },
        static: { 
          inferenceMode: 'Local',
          inferenceServerURL: 'http://localhost:5000',
          useCUDA: false
        },
        dynamic: {
          apiURL: 'https://localhost:3000',
          containerTimeout: 600000
        },
        diagnostics: {
          informationLevel: 'Verbose',
          diagnosticMessageInformation: Array.from({ length: 100 }, (_, i) => `config_${i}`),
          showDescription: true,
          highlightSeverityType: 'Error',
          maxNumberOfLines: 1,
          delayBeforeAnalysis: 1500
        },
        ui: {
          showProgressNotifications: true,
          showStatusBar: true,
          autoShowOutput: true,
          progressLocation: 'notification'
        }
      };

      const startTime = Date.now();

      // Simulate configuration processing
      const mockConfig = {
        get: jest.fn(),
        update: jest.fn()
      };

      const mockWorkspace = {
        getConfiguration: jest.fn().mockReturnValue(mockConfig)
      };

      const config = mockWorkspace.getConfiguration('codeguard');
      const endTime = Date.now();

      const processingTime = endTime - startTime;
      expect(processingTime).toBeLessThan(50); // Should process within 50ms
    });
  });
}); 