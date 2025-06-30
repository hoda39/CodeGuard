// Test setup file for Jest

// Mock VS Code API
const mockVSCode = {
  window: {
    createOutputChannel: jest.fn().mockReturnValue({
      appendLine: jest.fn(),
      show: jest.fn(),
      clear: jest.fn(),
      dispose: jest.fn()
    }),
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showQuickPick: jest.fn(),
    activeTextEditor: null
  },
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn(),
      update: jest.fn()
    }),
    onDidChangeConfiguration: jest.fn()
  },
  languages: {
    createDiagnosticCollection: jest.fn().mockReturnValue({
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      dispose: jest.fn()
    }),
    registerCodeActionsProvider: jest.fn()
  },
  ExtensionMode: {
    Development: 1,
    Production: 2,
    Test: 3
  },
  ProgressLocation: {
    SourceControl: 1,
    Window: 10,
    Notification: 15
  },
  DiagnosticSeverity: {
    Error: 0,
    Warning: 1,
    Information: 2,
    Hint: 3
  },
  Uri: {
    file: jest.fn().mockReturnValue({ fsPath: 'test.cpp' })
  },
  Range: jest.fn(),
  Diagnostic: jest.fn(),
  CancellationTokenSource: jest.fn().mockReturnValue({
    token: {},
    cancel: jest.fn()
  }),
  WorkspaceEdit: jest.fn().mockReturnValue({
    replace: jest.fn()
  })
};

// Mock the vscode module
jest.mock('vscode', () => mockVSCode);

// Mock child_process
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn(),
  resolve: jest.fn(),
  dirname: jest.fn(),
  basename: jest.fn()
}));

// Global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 