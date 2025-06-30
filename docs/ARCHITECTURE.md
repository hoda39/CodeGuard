# CodeGuard Architecture Documentation

This document describes the architecture, design patterns, and system components of the CodeGuard extension.

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Docker Integration](#docker-integration)
6. [Security Considerations](#security-considerations)
7. [Performance Considerations](#performance-considerations)
8. [Scalability](#scalability)

## System Overview

CodeGuard is a VS Code extension that provides comprehensive security analysis for C/C++ code through a unified interface. The system combines static and dynamic analysis capabilities, running analysis in isolated Docker containers for security and consistency.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VS Code Extension                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   UI Layer  │  │ Analysis    │  │  Config     │         │
│  │             │  │  Manager    │  │  Manager    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    Shared Services                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Docker    │  │ Diagnostic  │  │   Error     │         │
│  │   Runner    │  │  Manager    │  │  Handler    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    Analysis Engines                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Static    │  │  Dynamic    │  │ Combined    │         │
│  │  Analysis   │  │  Analysis   │  │  Analysis   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Docker Containers                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐                    ┌─────────────┐         │
│  │   Static    │                    │  Dynamic    │         │
│  │  Analysis   │                    │  Analysis   │         │
│  │  Container  │                    │  Container  │         │
│  └─────────────┘                    └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Architecture Patterns

### 1. Manager Pattern
Each major component is managed by a dedicated manager class that encapsulates related functionality:

- **AnalysisManager**: Orchestrates analysis execution
- **ConfigManager**: Manages configuration and settings
- **DiagnosticManager**: Handles result display and diagnostics
- **OutputManager**: Manages output panel and logging
- **ProgressManager**: Handles progress tracking and UI updates
- **StatusBarManager**: Manages status bar display

### 2. Dependency Injection
Managers are injected into components that need them, promoting loose coupling and testability:

```typescript
class AnalysisManager {
  constructor(
    private configManager: ConfigManager,
    private diagnosticManager: DiagnosticManager,
    private outputManager: OutputManager,
    private progressManager: ProgressManager
  ) {}
}
```

### 3. Command Pattern
Analysis operations are implemented as commands that can be executed, cancelled, and queued:

```typescript
interface AnalysisCommand {
  execute(): Promise<AnalysisResult>;
  cancel(): Promise<void>;
  getStatus(): AnalysisStatus;
}
```

### 4. Observer Pattern
UI components observe analysis progress and status changes:

```typescript
interface ProgressObserver {
  onProgressUpdate(progress: ProgressInfo): void;
  onAnalysisComplete(result: AnalysisResult): void;
  onAnalysisError(error: Error): void;
}
```

## Component Architecture

### 1. Extension Entry Point (`src/extension.ts`)

**Responsibilities**:
- Extension activation and deactivation
- Command registration
- Manager initialization
- Event listener setup

**Key Methods**:
```typescript
export function activate(context: vscode.ExtensionContext): void
export function deactivate(): void
```

### 2. Analysis Manager (`src/analysis/analysis-manager.ts`)

**Responsibilities**:
- Orchestrates analysis execution
- Manages analysis lifecycle
- Handles concurrent analysis
- Aggregates results

**Key Methods**:
```typescript
async runAnalysis(type: AnalysisType, workspace: WorkspaceFolder, files: string[]): Promise<AnalysisResult>
async cancelAnalysis(): Promise<void>
getAnalysisStatus(): AnalysisStatus
```

### 3. Static Analysis (`src/static/static-analysis.ts`)

**Responsibilities**:
- Executes static analysis
- Integrates with AI models
- Processes vulnerability results
- Maps to CWE classifications

**Key Methods**:
```typescript
async analyze(workspace: WorkspaceFolder, files: string[]): Promise<StaticAnalysisResult>
private processResults(rawResults: any): Vulnerability[]
private mapToCWE(vulnerability: any): string
```

### 4. Dynamic Analysis (`src/dynamic/dynamic-analysis.ts`)

**Responsibilities**:
- Executes dynamic analysis
- Manages runtime testing
- Detects memory leaks
- Generates crash reports

**Key Methods**:
```typescript
async analyze(workspace: WorkspaceFolder, files: string[]): Promise<DynamicAnalysisResult>
private detectMemoryLeaks(output: string): MemoryLeak[]
private generateCrashReport(output: string): CrashReport[]
```

### 5. Docker Runner (`src/shared/docker-runner.ts`)

**Responsibilities**:
- Manages Docker container lifecycle
- Handles volume mounting
- Executes commands in containers
- Manages container resources

**Key Methods**:
```typescript
async runStaticAnalysis(workspacePath: string, files: string[]): Promise<StaticAnalysisResult>
async runDynamicAnalysis(workspacePath: string, files: string[]): Promise<DynamicAnalysisResult>
private buildImage(imageName: string, dockerfilePath: string): Promise<void>
private runContainer(imageName: string, command: string[], volumes: string[]): Promise<string>
```

### 6. UI Components

#### Output Manager (`src/ui/output-manager.ts`)
- Manages output panel display
- Formats analysis results
- Handles output clearing and navigation

#### Progress Manager (`src/ui/progress-manager.ts`)
- Shows progress notifications
- Updates progress bars
- Handles progress cancellation

#### Status Bar Manager (`src/ui/status-bar-manager.ts`)
- Displays current status
- Shows analysis progress
- Provides quick access to commands

### 7. Configuration Manager (`src/config/config-manager.ts`)

**Responsibilities**:
- Loads VS Code settings
- Manages configuration updates
- Provides default values
- Validates configuration

**Key Methods**:
```typescript
getConfig(): CodeGuardConfig
updateConfig(updates: Partial<CodeGuardConfig>): void
getSetting<T>(key: string, defaultValue: T): T
```

### 8. Diagnostic Manager (`src/diagnostics/diagnostic-manager.ts`)

**Responsibilities**:
- Manages VS Code diagnostics
- Displays analysis results
- Handles diagnostic updates
- Provides navigation to issues

**Key Methods**:
```typescript
updateDiagnostics(results: AnalysisResult): void
clearDiagnostics(): void
showDiagnostics(): void
```

## Data Flow

### 1. Analysis Request Flow

```
User Command → Extension → Analysis Manager → Docker Runner → Container → Results → UI Update
```

**Detailed Flow**:
1. User triggers analysis command
2. Extension validates input and workspace
3. Analysis Manager creates analysis task
4. Docker Runner builds/uses container
5. Analysis executes in container
6. Results are processed and formatted
7. UI components display results
8. Diagnostics are updated

### 2. Progress Update Flow

```
Analysis Progress → Progress Manager → UI Components → User Feedback
```

**Detailed Flow**:
1. Analysis reports progress
2. Progress Manager updates progress
3. UI components reflect changes
4. User sees real-time updates

### 3. Error Handling Flow

```
Error Occurrence → Error Handler → Logging → User Notification → Recovery
```

**Detailed Flow**:
1. Error occurs in any component
2. Error Handler captures and processes error
3. Error is logged for debugging
4. User is notified appropriately
5. System attempts recovery if possible

## Docker Integration

### Container Architecture

#### Static Analysis Container
```
┌─────────────────────────────────────────────────────────────┐
│                Static Analysis Container                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Python    │  │   ML Models │  │   Analysis  │         │
│  │  Runtime    │  │             │  │   Engine    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Input     │  │   Output    │  │   Logs      │         │
│  │   Volume    │  │   Volume    │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

#### Dynamic Analysis Container
```
┌─────────────────────────────────────────────────────────────┐
│                Dynamic Analysis Container                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   C/C++     │  │   CASR      │  │   Memory    │         │
│  │  Compiler   │  │   Tools     │  │   Monitor   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Source    │  │   Results   │  │   Reports   │         │
│  │   Volume    │  │   Volume    │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Volume Management
- **Source Volume**: Mounts workspace files for analysis
- **Results Volume**: Stores analysis results
- **Models Volume**: Contains ML models for static analysis
- **Logs Volume**: Stores execution logs

### Container Lifecycle
1. **Build Phase**: Build container images if not exists
2. **Start Phase**: Start container with mounted volumes
3. **Execution Phase**: Run analysis commands
4. **Collection Phase**: Collect results from volumes
5. **Cleanup Phase**: Stop and remove containers

## Security Considerations

### 1. Container Isolation
- Analysis runs in isolated Docker containers
- No direct access to host system
- Limited resource allocation
- Network isolation

### 2. Input Validation
- All user inputs are validated
- File path sanitization
- Command injection prevention
- Resource limit enforcement

### 3. Error Handling
- Secure error messages (no sensitive data)
- Proper exception handling
- Graceful degradation
- Audit logging

### 4. Configuration Security
- Secure default settings
- Configuration validation
- No hardcoded secrets
- Environment variable usage

## Performance Considerations

### 1. Resource Management
- Docker container resource limits
- Memory usage monitoring
- CPU usage optimization
- Disk space management

### 2. Caching Strategy
- Docker image caching
- Analysis result caching
- Configuration caching
- Model caching

### 3. Concurrency
- Concurrent analysis support
- Async/await patterns
- Non-blocking UI updates
- Background processing

### 4. Optimization Techniques
- Lazy loading of components
- Efficient data structures
- Minimal memory footprint
- Fast startup times

## Scalability

### 1. Horizontal Scaling
- Multiple analysis containers
- Load balancing capabilities
- Distributed processing
- Resource pooling

### 2. Vertical Scaling
- Resource allocation adjustment
- Performance tuning
- Memory optimization
- CPU optimization

### 3. Extensibility
- Plugin architecture support
- Custom analysis engines
- Configurable workflows
- Modular design

### 4. Future Enhancements
- Cloud-based analysis
- Distributed processing
- Real-time collaboration
- Advanced reporting

## Design Principles

### 1. Separation of Concerns
- Each component has a single responsibility
- Clear interfaces between components
- Minimal coupling between modules
- High cohesion within modules

### 2. Dependency Inversion
- High-level modules don't depend on low-level modules
- Abstractions don't depend on details
- Details depend on abstractions
- Inversion of control

### 3. Open/Closed Principle
- Open for extension
- Closed for modification
- Plugin architecture support
- Configurable behavior

### 4. Single Responsibility
- Each class has one reason to change
- Focused functionality
- Clear purpose
- Maintainable code

This architecture documentation provides a comprehensive overview of the CodeGuard extension's design and implementation. The modular, containerized approach ensures security, scalability, and maintainability while providing a seamless user experience. 