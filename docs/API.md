# CodeGuard API Documentation

This document describes the internal APIs and extension points of the CodeGuard extension.

## Table of Contents
1. [Core APIs](#core-apis)
2. [Analysis APIs](#analysis-apis)
3. [UI APIs](#ui-apis)
4. [Configuration APIs](#configuration-apis)
5. [Docker APIs](#docker-apis)
6. [Extension Points](#extension-points)

## Core APIs

### Extension Activation
The main extension entry point is `src/extension.ts`.

```typescript
export function activate(context: vscode.ExtensionContext): void
```

**Parameters**:
- `context`: VS Code extension context

**Responsibilities**:
- Register commands and providers
- Initialize managers
- Set up event listeners
- Configure extension behavior

### Extension Deactivation
```typescript
export function deactivate(): void
```

**Responsibilities**:
- Clean up resources
- Cancel running analysis
- Dispose of managers

## Analysis APIs

### Analysis Manager
Located in `src/analysis/analysis-manager.ts`

#### AnalysisManager Class
```typescript
class AnalysisManager {
  constructor(
    private configManager: ConfigManager,
    private diagnosticManager: DiagnosticManager,
    private outputManager: OutputManager,
    private progressManager: ProgressManager
  )
}
```

#### Methods

##### runAnalysis()
```typescript
async runAnalysis(
  analysisType: 'static' | 'dynamic' | 'combined',
  workspaceFolder: vscode.WorkspaceFolder,
  files: string[]
): Promise<AnalysisResult>
```

**Parameters**:
- `analysisType`: Type of analysis to run
- `workspaceFolder`: VS Code workspace folder
- `files`: Array of file paths to analyze

**Returns**: Promise<AnalysisResult>

**Description**: Main entry point for running analysis

##### cancelAnalysis()
```typescript
async cancelAnalysis(): Promise<void>
```

**Description**: Cancels any running analysis

##### getAnalysisStatus()
```typescript
getAnalysisStatus(): AnalysisStatus
```

**Returns**: Current analysis status

### Static Analysis
Located in `src/static/static-analysis.ts`

#### StaticAnalysis Class
```typescript
class StaticAnalysis {
  constructor(
    private dockerRunner: DockerRunner,
    private configManager: ConfigManager,
    private diagnosticManager: DiagnosticManager
  )
}
```

#### Methods

##### analyze()
```typescript
async analyze(
  workspaceFolder: vscode.WorkspaceFolder,
  files: string[]
): Promise<StaticAnalysisResult>
```

**Parameters**:
- `workspaceFolder`: VS Code workspace folder
- `files`: Array of file paths to analyze

**Returns**: Promise<StaticAnalysisResult>

**Description**: Runs static analysis on specified files

### Dynamic Analysis
Located in `src/dynamic/dynamic-analysis.ts`

#### DynamicAnalysis Class
```typescript
class DynamicAnalysis {
  constructor(
    private dockerRunner: DockerRunner,
    private diagnosticManager: DiagnosticManager
  )
}
```

#### Methods

##### analyze()
```typescript
async analyze(
  workspaceFolder: vscode.WorkspaceFolder,
  files: string[]
): Promise<DynamicAnalysisResult>
```

**Parameters**:
- `workspaceFolder`: VS Code workspace folder
- `files`: Array of file paths to analyze

**Returns**: Promise<DynamicAnalysisResult>

**Description**: Runs dynamic analysis on specified files

## UI APIs

### Output Manager
Located in `src/ui/output-manager.ts`

#### OutputManager Class
```typescript
class OutputManager {
  constructor(private outputChannel: vscode.OutputChannel)
}
```

#### Methods

##### showOutput()
```typescript
showOutput(): void
```

**Description**: Shows the output panel

##### appendLine()
```typescript
appendLine(message: string): void
```

**Parameters**:
- `message`: Message to append

**Description**: Appends a line to the output

##### clear()
```typescript
clear(): void
```

**Description**: Clears the output panel

### Progress Manager
Located in `src/ui/progress-manager.ts`

#### ProgressManager Class
```typescript
class ProgressManager {
  constructor(private configManager: ConfigManager)
}
```

#### Methods

##### showProgress()
```typescript
async showProgress<T>(
  title: string,
  task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
): Promise<T>
```

**Parameters**:
- `title`: Progress title
- `task`: Task to execute with progress updates

**Returns**: Promise<T>

**Description**: Shows progress for a long-running task

##### updateProgress()
```typescript
updateProgress(message: string, increment?: number): void
```

**Parameters**:
- `message`: Progress message
- `increment`: Progress increment (optional)

**Description**: Updates current progress

### Status Bar Manager
Located in `src/ui/status-bar-manager.ts`

#### StatusBarManager Class
```typescript
class StatusBarManager {
  constructor(private statusBarItem: vscode.StatusBarItem)
}
```

#### Methods

##### updateStatus()
```typescript
updateStatus(text: string, tooltip?: string): void
```

**Parameters**:
- `text`: Status text
- `tooltip`: Status tooltip (optional)

**Description**: Updates the status bar

##### show()
```typescript
show(): void
```

**Description**: Shows the status bar item

##### hide()
```typescript
hide(): void
```

**Description**: Hides the status bar item

## Configuration APIs

### Config Manager
Located in `src/config/config-manager.ts`

#### ConfigManager Class
```typescript
class ConfigManager {
  constructor()
}
```

#### Methods

##### getConfig()
```typescript
getConfig(): CodeGuardConfig
```

**Returns**: Current configuration

**Description**: Gets the current extension configuration

##### updateConfig()
```typescript
updateConfig(updates: Partial<CodeGuardConfig>): void
```

**Parameters**:
- `updates`: Configuration updates

**Description**: Updates the configuration

##### getSetting()
```typescript
getSetting<T>(key: string, defaultValue: T): T
```

**Parameters**:
- `key`: Setting key
- `defaultValue`: Default value

**Returns**: Setting value

**Description**: Gets a specific setting value

## Docker APIs

### Docker Runner
Located in `src/shared/docker-runner.ts`

#### DockerRunner Class
```typescript
class DockerRunner {
  constructor()
}
```

#### Methods

##### runStaticAnalysis()
```typescript
async runStaticAnalysis(
  workspacePath: string,
  files: string[]
): Promise<StaticAnalysisResult>
```

**Parameters**:
- `workspacePath`: Path to workspace
- `files`: Array of file paths

**Returns**: Promise<StaticAnalysisResult>

**Description**: Runs static analysis in Docker container

##### runDynamicAnalysis()
```typescript
async runDynamicAnalysis(
  workspacePath: string,
  files: string[]
): Promise<DynamicAnalysisResult>
```

**Parameters**:
- `workspacePath`: Path to workspace
- `files`: Array of file paths

**Returns**: Promise<DynamicAnalysisResult>

**Description**: Runs dynamic analysis in Docker container

##### buildImage()
```typescript
async buildImage(imageName: string, dockerfilePath: string): Promise<void>
```

**Parameters**:
- `imageName`: Docker image name
- `dockerfilePath`: Path to Dockerfile

**Description**: Builds a Docker image

##### runContainer()
```typescript
async runContainer(
  imageName: string,
  command: string[],
  volumes: string[],
  environment?: Record<string, string>
): Promise<string>
```

**Parameters**:
- `imageName`: Docker image name
- `command`: Command to run
- `volumes`: Volume mounts
- `environment`: Environment variables (optional)

**Returns**: Container output

**Description**: Runs a Docker container

## Extension Points

### Commands
All commands are registered in `src/extension.ts`:

```typescript
// Main analysis commands
codeguard.runAnalysis
codeguard.runStaticAnalysis
codeguard.runDynamicAnalysis
codeguard.cancelAnalysis

// UI test commands
codeguard.testUI
codeguard.testUIComponents
codeguard.showPerformanceReport
```

### Configuration
Extension configuration is defined in `package.json`:

```json
{
  "configuration": {
    "title": "CodeGuard",
    "properties": {
      "codeguard.ui.showProgressNotifications": {
        "type": "boolean",
        "default": true
      },
      "codeguard.ui.showStatusBar": {
        "type": "boolean",
        "default": true
      },
      "codeguard.ui.autoShowOutput": {
        "type": "boolean",
        "default": true
      },
      "codeguard.ui.progressLocation": {
        "type": "string",
        "enum": ["notification", "window"],
        "default": "notification"
      }
    }
  }
}
```

### Keybindings
Keyboard shortcuts are defined in `package.json`:

```json
{
  "keybindings": [
    {
      "command": "codeguard.runAnalysis",
      "key": "ctrl+shift+a"
    },
    {
      "command": "codeguard.runStaticAnalysis",
      "key": "ctrl+shift+s"
    },
    {
      "command": "codeguard.runDynamicAnalysis",
      "key": "ctrl+shift+d"
    },
    {
      "command": "codeguard.cancelAnalysis",
      "key": "ctrl+shift+x"
    }
  ]
}
```

## Data Types

### AnalysisResult
```typescript
interface AnalysisResult {
  success: boolean;
  staticResults?: StaticAnalysisResult;
  dynamicResults?: DynamicAnalysisResult;
  errors: string[];
  duration: number;
}
```

### StaticAnalysisResult
```typescript
interface StaticAnalysisResult {
  vulnerabilities: Vulnerability[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}
```

### DynamicAnalysisResult
```typescript
interface DynamicAnalysisResult {
  memoryLeaks: MemoryLeak[];
  crashes: CrashReport[];
  performance: PerformanceMetrics;
}
```

### Vulnerability
```typescript
interface Vulnerability {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cwe: string;
  file: string;
  line: number;
  column: number;
  message: string;
  description: string;
  fix?: string;
}
```

### MemoryLeak
```typescript
interface MemoryLeak {
  id: string;
  file: string;
  line: number;
  size: number;
  stackTrace: string[];
  description: string;
}
```

### CrashReport
```typescript
interface CrashReport {
  id: string;
  type: string;
  file: string;
  line: number;
  stackTrace: string[];
  description: string;
}
```

### PerformanceMetrics
```typescript
interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  fileSize: number;
}
```

### CodeGuardConfig
```typescript
interface CodeGuardConfig {
  ui: {
    showProgressNotifications: boolean;
    showStatusBar: boolean;
    autoShowOutput: boolean;
    progressLocation: 'notification' | 'window';
  };
}
```

## Error Handling

### Error Types
```typescript
enum CodeGuardError {
  DOCKER_NOT_AVAILABLE = 'DOCKER_NOT_AVAILABLE',
  ANALYSIS_FAILED = 'ANALYSIS_FAILED',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}
```

### Error Handler
Located in `src/shared/error-handler.ts`

```typescript
class ErrorHandler {
  static handleError(error: Error, context: string): void;
  static logError(error: Error, context: string): void;
  static showErrorMessage(message: string): void;
}
```

## Performance Monitoring

### Performance Monitor
Located in `src/shared/performance-monitor.ts`

```typescript
class PerformanceMonitor {
  static startTimer(name: string): void;
  static endTimer(name: string): number;
  static getMetrics(): PerformanceMetrics;
  static generateReport(): string;
}
```

## Testing APIs

### Test Utilities
Located in `src/test/`

```typescript
// Test setup utilities
export function setupTestEnvironment(): void;
export function cleanupTestEnvironment(): void;

// Mock utilities
export function createMockWorkspace(): vscode.WorkspaceFolder;
export function createMockFile(path: string): string;
```

This API documentation provides a comprehensive overview of the CodeGuard extension's internal structure and interfaces. For implementation details, refer to the source code in the respective files. 