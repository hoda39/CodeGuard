# Chapter 2: Analysis and Requirements (Part 3)

### 2.3.5 System Sequence Diagrams

#### Sequence Diagram 1: Run Static Analysis

```
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Developer│    │   VS Code   │    │  Extension  │    │   Docker    │    │   ML/AI     │
│         │    │     IDE     │    │             │    │   Engine    │    │   Models    │
└────┬────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
     │                │                  │                  │                  │
     │ 1. Open C file │                  │                  │                  │
     │ ──────────────>│                  │                  │                  │
     │                │                  │                  │                  │
     │ 2. Ctrl+Shift+S│                  │                  │                  │
     │ ──────────────>│                  │                  │                  │
     │                │ 3. Run Static    │                  │                  │
     │                │ Analysis         │                  │                  │
     │                │ ────────────────>│                  │                  │
     │                │                  │ 4. Validate      │                  │
     │                │                  │ Docker           │                  │
     │                │                  │ ────────────────>│                  │
     │                │                  │                  │ 5. Docker OK     │
     │                │                  │                  │ ────────────────>│
     │                │                  │ 6. Start Container│                  │
     │                │                  │ ────────────────>│                  │
     │                │                  │                  │ 7. Container     │
     │                │                  │                  │ Started          │
     │                │                  │                  │ ────────────────>│
     │                │                  │ 8. Upload Code   │                  │
     │                │                  │ ────────────────>│                  │
     │                │                  │                  │ 9. Analyze Code  │
     │                │                  │                  │ ────────────────>│
     │                │                  │                  │                  │ 10. Process
     │                │                  │                  │                  │ ──────────>
     │                │                  │                  │                  │ 11. Results
     │                │                  │                  │                  │ <──────────
     │                │                  │ 12. Get Results  │                  │
     │                │                  │ <────────────────│                  │
     │                │ 13. Display      │                  │                  │
     │                │ Results          │                  │                  │
     │                │ <────────────────│                  │                  │
     │ 14. View Issues│                  │                  │                  │
     │ <──────────────│                  │                  │                  │
```

#### Sequence Diagram 2: Run Combined Analysis

```
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Developer│    │   VS Code   │    │  Extension  │    │   Docker    │    │   ML/AI     │
│         │    │     IDE     │    │             │    │   Engine    │    │   Models    │
└────┬────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
     │                │                  │                  │                  │
     │ 1. Ctrl+Shift+A│                  │                  │                  │
     │ ──────────────>│                  │                  │                  │
     │                │ 2. Run Combined  │                  │                  │
     │                │ Analysis         │                  │                  │
     │                │ ────────────────>│                  │                  │
     │                │                  │ 3. Start Static  │                  │
     │                │                  │ Container        │                  │
     │                │                  │ ────────────────>│                  │
     │                │                  │ 4. Start Dynamic │                  │
     │                │                  │ Container        │                  │
     │                │                  │ ────────────────>│                  │
     │                │                  │                  │ 5. Static Analysis│
     │                │                  │                  │ ────────────────>│
     │                │                  │                  │                  │ 6. Process
     │                │                  │                  │                  │ ──────────>
     │                │                  │                  │                  │ 7. Static Results
     │                │                  │                  │                  │ <──────────
     │                │                  │ 8. Dynamic Analysis│
     │                │                  │                  │ ────────────────>│
     │                │                  │                  │                  │ 9. Process
     │                │                  │                  │                  │ ──────────>
     │                │                  │                  │                  │ 10. Dynamic Results
     │                │                  │                  │                  │ <──────────
     │                │                  │ 11. Aggregate    │                  │
     │                │                  │ Results          │                  │
     │                │                  │ ────────────────>│                  │
     │                │ 12. Display      │                  │                  │
     │                │ Combined Results │                  │                  │
     │                │ <────────────────│                  │                  │
     │ 13. View Report│                  │                  │                  │
     │ <──────────────│                  │                  │                  │
```

### 2.3.6 Class Diagram and Interface Specification

#### Overview Class Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CodeGuard Class Overview                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Extension  │    │  Analysis   │    │   Static    │     │
│  │             │    │  Manager    │    │  Analysis   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                   │                   │           │
│         │                   │                   │           │
│         ▼                   ▼                   ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Config    │    │  Dynamic    │    │   Docker    │     │
│  │  Manager    │    │  Analysis   │    │   Runner    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                   │                   │           │
│         │                   │                   │           │
│         ▼                   ▼                   ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ Diagnostic  │    │   Output    │    │  Progress   │     │
│  │  Manager    │    │  Manager    │    │  Manager    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                   │                   │           │
│         │                   │                   │           │
│         ▼                   ▼                   ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Status Bar │    │   Error     │    │ Performance │     │
│  │  Manager    │    │  Handler    │    │  Monitor    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ Vulnerability│    │   Memory    │    │   Crash     │     │
│  │   Fix       │    │    Leak     │    │   Report    │     │
│  │  Provider   │    │             │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Detailed Class Specifications

##### Extension Class
```typescript
class Extension {
  // Private fields
  private analysisManager: AnalysisManager;
  private configManager: ConfigManager;
  private diagnosticManager: DiagnosticManager;
  private outputManager: OutputManager;
  private progressManager: ProgressManager;
  private statusBarManager: StatusBarManager;
  private errorHandler: ErrorHandler;
  private performanceMonitor: PerformanceMonitor;

  // Public methods
  activate(context: vscode.ExtensionContext): void;
  deactivate(): void;
  registerCommands(context: vscode.ExtensionContext): void;
  registerProviders(context: vscode.ExtensionContext): void;
}
```

##### AnalysisManager Class
```typescript
class AnalysisManager {
  // Private fields
  private configManager: ConfigManager;
  private diagnosticManager: DiagnosticManager;
  private outputManager: OutputManager;
  private progressManager: ProgressManager;
  private staticAnalysis: StaticAnalysis;
  private dynamicAnalysis: DynamicAnalysis;
  private dockerRunner: DockerRunner;

  // Public methods
  async runAnalysis(type: AnalysisType, workspace: WorkspaceFolder, files: string[]): Promise<AnalysisResult>;
  async cancelAnalysis(): Promise<void>;
  getAnalysisStatus(): AnalysisStatus;
  getAnalysisProgress(): ProgressInfo;

  // Private methods
  private validateInputs(workspace: WorkspaceFolder, files: string[]): void;
  private aggregateResults(staticResult: StaticAnalysisResult, dynamicResult: DynamicAnalysisResult): AnalysisResult;
}
```

##### StaticAnalysis Class
```typescript
class StaticAnalysis {
  // Private fields
  private dockerRunner: DockerRunner;
  private configManager: ConfigManager;
  private diagnosticManager: DiagnosticManager;

  // Public methods
  async analyze(workspace: WorkspaceFolder, files: string[]): Promise<StaticAnalysisResult>;
  
  // Private methods
  private processResults(rawResults: any): Vulnerability[];
  private mapToCWE(vulnerability: any): string;
  private assessSeverity(vulnerability: any): SeverityLevel;
  private generateFixSuggestion(vulnerability: any): string;
}
```

##### DynamicAnalysis Class
```typescript
class DynamicAnalysis {
  // Private fields
  private dockerRunner: DockerRunner;
  private diagnosticManager: DiagnosticManager;

  // Public methods
  async analyze(workspace: WorkspaceFolder, files: string[]): Promise<DynamicAnalysisResult>;
  
  // Private methods
  private detectMemoryLeaks(output: string): MemoryLeak[];
  private generateCrashReport(output: string): CrashReport[];
  private monitorPerformance(): PerformanceMetrics;
  private compileCode(sourcePath: string): Promise<string>;
}
```

##### DockerRunner Class
```typescript
class DockerRunner {
  // Public methods
  async runStaticAnalysis(workspacePath: string, files: string[]): Promise<StaticAnalysisResult>;
  async runDynamicAnalysis(workspacePath: string, files: string[]): Promise<DynamicAnalysisResult>;
  async buildImage(imageName: string, dockerfilePath: string): Promise<void>;
  async runContainer(imageName: string, command: string[], volumes: string[], environment?: Record<string, string>): Promise<string>;
  async stopContainer(containerId: string): Promise<void>;
  async cleanupContainers(): Promise<void>;

  // Private methods
  private validateDockerAvailability(): Promise<boolean>;
  private createVolumeMounts(workspacePath: string, files: string[]): string[];
  private parseContainerOutput(output: string): any;
}
```

##### ConfigManager Class
```typescript
class ConfigManager {
  // Public methods
  getConfig(): CodeGuardConfig;
  updateConfig(updates: Partial<CodeGuardConfig>): void;
  getSetting<T>(key: string, defaultValue: T): T;
  validateConfig(config: CodeGuardConfig): boolean;

  // Private methods
  private loadConfig(): CodeGuardConfig;
  private saveConfig(config: CodeGuardConfig): void;
  private getDefaultConfig(): CodeGuardConfig;
}
```

##### DiagnosticManager Class
```typescript
class DiagnosticManager {
  // Private fields
  private diagnosticCollection: vscode.DiagnosticCollection;

  // Public methods
  updateDiagnostics(results: AnalysisResult): void;
  clearDiagnostics(): void;
  showDiagnostics(): void;
  getDiagnostics(): vscode.Diagnostic[];

  // Private methods
  private createDiagnostic(vulnerability: Vulnerability): vscode.Diagnostic;
  private createDiagnosticFromMemoryLeak(leak: MemoryLeak): vscode.Diagnostic;
  private createDiagnosticFromCrashReport(crash: CrashReport): vscode.Diagnostic;
}
```

##### OutputManager Class
```typescript
class OutputManager {
  // Private fields
  private outputChannel: vscode.OutputChannel;

  // Public methods
  showOutput(): void;
  appendLine(message: string): void;
  appendResults(results: AnalysisResult): void;
  clear(): void;
  hide(): void;

  // Private methods
  private formatResults(results: AnalysisResult): string;
  private formatVulnerability(vulnerability: Vulnerability): string;
  private formatMemoryLeak(leak: MemoryLeak): string;
}
```

##### ProgressManager Class
```typescript
class ProgressManager {
  // Private fields
  private configManager: ConfigManager;
  private currentProgress?: vscode.Progress<ProgressInfo>;

  // Public methods
  async showProgress<T>(title: string, task: (progress: vscode.Progress<ProgressInfo>) => Promise<T>): Promise<T>;
  updateProgress(message: string, increment?: number): void;
  hideProgress(): void;

  // Private methods
  private createProgressNotification(title: string): vscode.Progress<ProgressInfo>;
  private createProgressWindow(title: string): vscode.Progress<ProgressInfo>;
}
```

##### StatusBarManager Class
```typescript
class StatusBarManager {
  // Private fields
  private statusBarItem: vscode.StatusBarItem;

  // Public methods
  updateStatus(text: string, tooltip?: string): void;
  show(): void;
  hide(): void;
  setBusy(): void;
  setReady(): void;
  setError(): void;

  // Private methods
  private createStatusBarItem(): vscode.StatusBarItem;
}
```

##### ErrorHandler Class
```typescript
class ErrorHandler {
  // Public methods
  static handleError(error: Error, context: string): void;
  static logError(error: Error, context: string): void;
  static showErrorMessage(message: string): void;
  static showWarningMessage(message: string): void;
  static showInfoMessage(message: string): void;

  // Private methods
  private static formatError(error: Error): string;
  private static getErrorContext(context: string): string;
}
```

##### PerformanceMonitor Class
```typescript
class PerformanceMonitor {
  // Private fields
  private timers: Map<string, number>;
  private metrics: Map<string, PerformanceMetrics>;

  // Public methods
  static startTimer(name: string): void;
  static endTimer(name: string): number;
  static getMetrics(): PerformanceMetrics;
  static generateReport(): string;
  static reset(): void;

  // Private methods
  private static formatDuration(milliseconds: number): string;
  private static calculateAverage(metrics: number[]): number;
}
```

##### VulnerabilityFixProvider Class
```typescript
class VulnerabilityFixProvider {
  // Public methods
  provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext): vscode.CodeAction[];
  resolveCodeAction(codeAction: vscode.CodeAction): vscode.CodeAction;

  // Private methods
  private createFixAction(vulnerability: Vulnerability): vscode.CodeAction;
  private applyFix(document: vscode.TextDocument, vulnerability: Vulnerability, fix: string): vscode.WorkspaceEdit;
  private validateFix(document: vscode.TextDocument, edit: vscode.WorkspaceEdit): boolean;
}
```

## 2.4 Requirements Elicitation and Analysis Process

### 2.4.1 Requirements Elicitation Methods

The requirements for the CodeGuard extension were gathered through multiple elicitation techniques:

1. **Literature Review**: Analysis of existing security analysis tools and VS Code extensions
2. **Competitive Analysis**: Study of similar tools like SonarQube, CodeQL, and Semgrep
3. **User Research**: Interviews with developers and security engineers
4. **Prototype Testing**: Early prototype evaluation with potential users
5. **Expert Consultation**: Discussions with security and development experts

### 2.4.2 Analysis Process

The analysis process followed these steps:

1. **Problem Identification**: Identified gaps in current development workflows
2. **Stakeholder Analysis**: Identified all parties affected by the solution
3. **Use Case Development**: Created comprehensive use cases based on user needs
4. **Requirements Prioritization**: Ranked requirements by importance and feasibility
5. **Architecture Design**: Designed system architecture to meet requirements
6. **Validation**: Validated requirements through prototyping and user feedback

### 2.4.3 Requirements Validation

Requirements were validated through:

1. **User Acceptance Testing**: Early prototypes tested with target users
2. **Technical Feasibility**: Verified technical implementation possibilities
3. **Performance Testing**: Validated performance requirements
4. **Security Review**: Ensured security requirements were met
5. **Usability Testing**: Confirmed usability requirements

This comprehensive analysis and requirements specification provides a solid foundation for the CodeGuard extension development, ensuring that all stakeholder needs are addressed and the system architecture supports the required functionality. 