# CodeGuard API Documentation

This document provides comprehensive API documentation for CodeGuard, covering both the VS Code extension API and the REST API endpoints for remote analysis services.

## Table of Contents

- [Overview](#overview)
- [REST API Reference](#rest-api-reference)
- [Extension API](#extension-api)
- [TypeScript Interfaces](#typescript-interfaces)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Overview

CodeGuard provides two main API interfaces:

1. **REST API**: For remote analysis services (static and dynamic analysis)
2. **Extension API**: For VS Code extension integration and local analysis

### Base URLs

- **Static Analysis API**: `http://localhost:5000` (containerized)
- **Dynamic Analysis API**: `http://localhost:3000` (containerized)
- **Local Extension API**: Available through VS Code extension host

## REST API Reference

### Authentication

All API endpoints require authentication using JWT tokens.

#### Authentication Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Get Authentication Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires": "2024-12-31T23:59:59Z",
  "user": {
    "id": "user123",
    "username": "your_username",
    "role": "developer"
  }
}
```

### Static Analysis API

#### Submit Code for Static Analysis

```http
POST /api/analysis/static
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "code": "void vulnerable_function() { char* buffer = malloc(10); strcpy(buffer, \"too long\"); }",
  "language": "cpp",
  "options": {
    "inferenceMode": "local",
    "useCUDA": false,
    "maxLines": 100
  }
}
```

**Response**:
```json
{
  "id": "analysis_123",
  "status": "completed",
  "vulnerabilities": [
    {
      "lineNumber": 1,
      "cweId": "CWE-119",
      "cweType": "Buffer Overflow",
      "cweSummary": "Buffer overflow in strcpy operation",
      "severityLevel": "High",
      "severityScore": 0.85,
      "confidenceScore": 0.92,
      "description": "Potential buffer overflow detected in strcpy operation",
      "remediation": "Use strncpy with proper bounds checking"
    }
  ],
  "processingTime": 1.23,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Get Static Analysis Results

```http
GET /api/analysis/static/{analysis_id}
Authorization: Bearer <jwt_token>
```

**Response**: Same as above

#### Batch Static Analysis

```http
POST /api/analysis/static/batch
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "files": [
    {
      "name": "main.cpp",
      "content": "void main() { ... }"
    },
    {
      "name": "utils.cpp",
      "content": "void utils() { ... }"
    }
  ],
  "options": {
    "inferenceMode": "remote",
    "useCUDA": true
  }
}
```

### Dynamic Analysis API

#### Submit Code for Fuzzing Analysis

```http
POST /api/analysis/dynamic
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "sourceCode": "void fuzz_target(char* input, size_t length) { char buffer[100]; if (length < 100) memcpy(buffer, input, length); }",
  "fuzzingOptions": {
    "timeout": 300,
    "fuzzerType": "aflplusplus",
    "sanitizers": ["address", "undefined", "leak"],
    "maxMemory": "2GB",
    "concolicExecution": true
  }
}
```

**Response**:
```json
{
  "id": "fuzzing_456",
  "status": "completed",
  "vulnerabilities": [
    {
      "lineNumber": 1,
      "type": "Buffer Overflow",
      "severity": "High",
      "description": "Buffer overflow detected by AddressSanitizer",
      "testCase": "input_123",
      "stackTrace": "stack trace information",
      "sanitizer": "AddressSanitizer"
    }
  ],
  "testCases": [
    {
      "id": "input_123",
      "input": "A" * 150,
      "coverage": 0.85,
      "crashType": "SIGSEGV",
      "stackTrace": "detailed stack trace"
    }
  ],
  "coverage": {
    "lineCoverage": 0.75,
    "branchCoverage": 0.60,
    "functionCoverage": 0.90,
    "uncoveredLines": [5, 8, 12]
  },
  "fuzzingStats": {
    "totalExecutions": 10000,
    "uniqueCrashes": 3,
    "timeouts": 0,
    "averageExecutionTime": 0.001
  },
  "processingTime": 180.5,
  "timestamp": "2024-01-15T10:35:00Z"
}
```

#### Get Dynamic Analysis Results

```http
GET /api/analysis/dynamic/{analysis_id}
Authorization: Bearer <jwt_token>
```

**Response**: Same as above

#### Get Fuzzing Statistics

```http
GET /api/analysis/dynamic/{analysis_id}/stats
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "executionStats": {
    "totalExecutions": 10000,
    "uniqueCrashes": 3,
    "timeouts": 0,
    "averageExecutionTime": 0.001
  },
  "coverageStats": {
    "lineCoverage": 0.75,
    "branchCoverage": 0.60,
    "functionCoverage": 0.90
  },
  "sanitizerStats": {
    "addressSanitizer": {
      "errors": 2,
      "types": ["buffer-overflow", "use-after-free"]
    },
    "undefinedBehaviorSanitizer": {
      "errors": 1,
      "types": ["integer-overflow"]
    }
  }
}
```

### Container Management API

#### Get Container Status

```http
GET /api/containers/status
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "staticAnalysis": {
    "status": "running",
    "url": "http://localhost:5000",
    "health": "healthy",
    "uptime": "2h 30m",
    "version": "1.0.0"
  },
  "dynamicAnalysis": {
    "status": "running",
    "url": "http://localhost:3000",
    "health": "healthy",
    "uptime": "2h 30m",
    "version": "1.0.0"
  }
}
```

#### Start Container

```http
POST /api/containers/start
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "service": "static-analysis",
  "options": {
    "port": 5000,
    "memory": "2GB",
    "cpu": "2"
  }
}
```

#### Stop Container

```http
POST /api/containers/stop
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "service": "static-analysis"
}
```

#### Get Container Logs

```http
GET /api/containers/{service}/logs
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "logs": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "level": "INFO",
      "message": "Static analysis service started"
    },
    {
      "timestamp": "2024-01-15T10:30:05Z",
      "level": "INFO",
      "message": "ML models loaded successfully"
    }
  ]
}
```

### Health Check API

#### Service Health Check

```http
GET /api/health
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "staticAnalysis": "healthy",
    "dynamicAnalysis": "healthy",
    "database": "healthy"
  },
  "version": "1.0.0"
}
```

#### Detailed Health Check

```http
GET /api/health/detailed
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "staticAnalysis": {
      "status": "healthy",
      "responseTime": 0.05,
      "memoryUsage": "512MB",
      "cpuUsage": "15%"
    },
    "dynamicAnalysis": {
      "status": "healthy",
      "responseTime": 0.08,
      "memoryUsage": "1GB",
      "cpuUsage": "25%"
    }
  },
  "system": {
    "uptime": "2h 30m",
    "totalMemory": "8GB",
    "availableMemory": "6GB",
    "cpuLoad": "30%"
  }
}
```

## Extension API

### VS Code Extension API

The CodeGuard extension provides APIs for integration with VS Code.

#### Register Analysis Provider

```typescript
import * as vscode from 'vscode';
import { CodeGuardProvider } from './codeguard-provider';

export function activate(context: vscode.ExtensionContext) {
    const provider = new CodeGuardProvider();
    
    // Register static analysis provider
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            { language: 'cpp' },
            provider,
            {
                providedCodeActionKinds: [
                    vscode.CodeActionKind.QuickFix
                ]
            }
        )
    );
}
```

#### Analysis Provider Implementation

```typescript
export class CodeGuardProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeAction[]> {
        const actions: vscode.CodeAction[] = [];
        
        // Add quick fix actions for vulnerabilities
        context.diagnostics.forEach(diagnostic => {
            if (diagnostic.source === 'CodeGuard') {
                const action = this.createQuickFix(diagnostic);
                if (action) {
                    actions.push(action);
                }
            }
        });
        
        return actions;
    }
    
    private createQuickFix(diagnostic: vscode.Diagnostic): vscode.CodeAction | undefined {
        // Implementation for creating quick fixes
    }
}
```

#### Command Registration

```typescript
// Register commands
context.subscriptions.push(
    vscode.commands.registerCommand('codeguard.runStaticAnalysis', () => {
        // Run static analysis
    }),
    
    vscode.commands.registerCommand('codeguard.runDynamicAnalysis', () => {
        // Run dynamic analysis
    }),
    
    vscode.commands.registerCommand('codeguard.showResults', () => {
        // Show analysis results
    })
);
```

### Analysis Engine API

#### Static Analysis Engine

```typescript
export class StaticAnalysisEngine {
    constructor(private config: StaticAnalysisConfig) {}
    
    async analyzeCode(
        code: string,
        language: 'cpp' | 'c',
        options?: AnalysisOptions
    ): Promise<VulnerabilityResult[]> {
        // Implementation for static analysis
    }
    
    async analyzeFile(
        filePath: string,
        options?: AnalysisOptions
    ): Promise<VulnerabilityResult[]> {
        // Implementation for file analysis
    }
    
    async analyzeBatch(
        files: string[],
        options?: AnalysisOptions
    ): Promise<BatchAnalysisResult> {
        // Implementation for batch analysis
    }
}
```

#### Dynamic Analysis Engine

```typescript
export class DynamicAnalysisEngine {
    constructor(private config: DynamicAnalysisConfig) {}
    
    async runFuzzingAnalysis(
        sourceCode: string,
        options: FuzzingOptions
    ): Promise<FuzzingResult> {
        // Implementation for fuzzing analysis
    }
    
    async runConcolicExecution(
        sourceCode: string,
        options: ConcolicOptions
    ): Promise<ConcolicResult> {
        // Implementation for concolic execution
    }
    
    async runSanitizerAnalysis(
        sourceCode: string,
        sanitizers: string[]
    ): Promise<SanitizerResult> {
        // Implementation for sanitizer analysis
    }
}
```

## TypeScript Interfaces

### Core Interfaces

```typescript
// Vulnerability result interface
interface VulnerabilityResult {
    id: string;
    lineNumber: number;
    columnNumber?: number;
    cweId: string;
    cweType: string;
    cweSummary: string;
    severityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    severityScore: number;
    confidenceScore: number;
    description: string;
    remediation?: string;
    source: 'static' | 'dynamic';
    tool: string;
    timestamp: Date;
}

// Static analysis result interface
interface StaticAnalysisResult {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    vulnerabilities: VulnerabilityResult[];
    processingTime: number;
    timestamp: Date;
    metadata?: {
        modelVersion: string;
        inferenceMode: 'local' | 'remote';
        useCUDA: boolean;
    };
}

// Fuzzing result interface
interface FuzzingResult {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    vulnerabilities: VulnerabilityResult[];
    testCases: TestCase[];
    coverage: CoverageInfo;
    fuzzingStats: FuzzingStats;
    processingTime: number;
    timestamp: Date;
}

// Test case interface
interface TestCase {
    id: string;
    input: string;
    coverage: number;
    crashType?: string;
    stackTrace?: string;
    sanitizerOutput?: string;
}

// Coverage information interface
interface CoverageInfo {
    lineCoverage: number;
    branchCoverage: number;
    functionCoverage: number;
    uncoveredLines: number[];
    coveredLines: number[];
}

// Fuzzing statistics interface
interface FuzzingStats {
    totalExecutions: number;
    uniqueCrashes: number;
    timeouts: number;
    averageExecutionTime: number;
    executionRate: number;
}

// Configuration interfaces
interface StaticAnalysisConfig {
    inferenceMode: 'local' | 'remote';
    useCUDA: boolean;
    delayBeforeAnalysis: number;
    maxNumberOfLines: number;
    apiUrl?: string;
}

interface DynamicAnalysisConfig {
    apiUrl: string;
    fuzzingTimeout: number;
    fuzzerType: 'aflplusplus' | 'eclipser';
    sanitizers: string[];
    maxMemory: string;
    enableConcolicExecution: boolean;
}

interface ContainerConfig {
    useContainers: boolean;
    staticAnalysisUrl: string;
    dynamicAnalysisUrl: string;
    autoStart: boolean;
    dockerComposePath?: string;
}

// Analysis options interfaces
interface AnalysisOptions {
    inferenceMode?: 'local' | 'remote';
    useCUDA?: boolean;
    maxLines?: number;
    timeout?: number;
}

interface FuzzingOptions {
    timeout: number;
    fuzzerType: 'aflplusplus' | 'eclipser';
    sanitizers: string[];
    maxMemory: string;
    concolicExecution: boolean;
    seedInputs?: string[];
}

interface ConcolicOptions {
    timeout: number;
    maxDepth: number;
    maxPaths: number;
    symbolicVariables: string[];
}
```

### API Request/Response Interfaces

```typescript
// API request interfaces
interface StaticAnalysisRequest {
    code: string;
    language: 'cpp' | 'c';
    options?: AnalysisOptions;
}

interface DynamicAnalysisRequest {
    sourceCode: string;
    fuzzingOptions: FuzzingOptions;
}

interface BatchAnalysisRequest {
    files: Array<{
        name: string;
        content: string;
    }>;
    options?: AnalysisOptions;
}

// API response interfaces
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: Date;
}

interface ContainerStatusResponse {
    staticAnalysis: ContainerInfo;
    dynamicAnalysis: ContainerInfo;
}

interface ContainerInfo {
    status: 'running' | 'stopped' | 'error';
    url: string;
    health: 'healthy' | 'unhealthy' | 'unknown';
    uptime: string;
    version: string;
}

interface HealthResponse {
    status: 'healthy' | 'unhealthy';
    timestamp: Date;
    services: Record<string, string | ServiceHealth>;
    version: string;
}

interface ServiceHealth {
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    memoryUsage: string;
    cpuUsage: string;
}
```

## Authentication

### JWT Token Management

```typescript
export class AuthManager {
    private token: string | null = null;
    private tokenExpiry: Date | null = null;
    
    async authenticate(username: string, password: string): Promise<boolean> {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.token = data.token;
                this.tokenExpiry = new Date(data.expires);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Authentication failed:', error);
            return false;
        }
    }
    
    getAuthHeaders(): Record<string, string> {
        if (!this.token || this.isTokenExpired()) {
            throw new Error('No valid authentication token');
        }
        
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
    
    private isTokenExpired(): boolean {
        return this.tokenExpiry ? this.tokenExpiry <= new Date() : true;
    }
    
    logout(): void {
        this.token = null;
        this.tokenExpiry = null;
    }
}
```

### API Client with Authentication

```typescript
export class CodeGuardApiClient {
    constructor(
        private baseUrl: string,
        private authManager: AuthManager
    ) {}
    
    async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers = {
            ...this.authManager.getAuthHeaders(),
            ...options.headers
        };
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        
        return response.json();
    }
    
    async runStaticAnalysis(request: StaticAnalysisRequest): Promise<StaticAnalysisResult> {
        return this.request<StaticAnalysisResult>('/api/analysis/static', {
            method: 'POST',
            body: JSON.stringify(request)
        });
    }
    
    async runDynamicAnalysis(request: DynamicAnalysisRequest): Promise<FuzzingResult> {
        return this.request<FuzzingResult>('/api/analysis/dynamic', {
            method: 'POST',
            body: JSON.stringify(request)
        });
    }
    
    async getAnalysisResults(analysisId: string): Promise<StaticAnalysisResult | FuzzingResult> {
        return this.request(`/api/analysis/${analysisId}`);
    }
}
```

## Error Handling

### Error Types

```typescript
export enum CodeGuardErrorType {
    AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
    INVALID_REQUEST = 'INVALID_REQUEST',
    ANALYSIS_FAILED = 'ANALYSIS_FAILED',
    TIMEOUT = 'TIMEOUT',
    CONTAINER_ERROR = 'CONTAINER_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class CodeGuardError extends Error {
    constructor(
        public type: CodeGuardErrorType,
        message: string,
        public statusCode?: number,
        public details?: any
    ) {
        super(message);
        this.name = 'CodeGuardError';
    }
}
```

### Error Handling Utilities

```typescript
export class ErrorHandler {
    static handleApiError(error: any): CodeGuardError {
        if (error instanceof CodeGuardError) {
            return error;
        }
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return new CodeGuardError(
                CodeGuardErrorType.NETWORK_ERROR,
                'Network connection failed',
                0,
                error
            );
        }
        
        if (error.status === 401) {
            return new CodeGuardError(
                CodeGuardErrorType.AUTHENTICATION_FAILED,
                'Authentication failed',
                401,
                error
            );
        }
        
        if (error.status === 400) {
            return new CodeGuardError(
                CodeGuardErrorType.INVALID_REQUEST,
                'Invalid request parameters',
                400,
                error
            );
        }
        
        if (error.status === 408 || error.message.includes('timeout')) {
            return new CodeGuardError(
                CodeGuardErrorType.TIMEOUT,
                'Request timed out',
                408,
                error
            );
        }
        
        return new CodeGuardError(
            CodeGuardErrorType.UNKNOWN_ERROR,
            'An unexpected error occurred',
            error.status,
            error
        );
    }
    
    static async retryWithBackoff<T>(
        operation: () => Promise<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000
    ): Promise<T> {
        let lastError: Error;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                if (attempt === maxRetries) {
                    throw error;
                }
                
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw lastError!;
    }
}
```

## Examples

### Complete Static Analysis Example

```typescript
import { CodeGuardApiClient, AuthManager } from './codeguard-api';

async function runStaticAnalysis() {
    // Initialize authentication
    const authManager = new AuthManager();
    const authenticated = await authManager.authenticate('username', 'password');
    
    if (!authenticated) {
        throw new Error('Authentication failed');
    }
    
    // Initialize API client
    const client = new CodeGuardApiClient('http://localhost:5000', authManager);
    
    // Prepare analysis request
    const request: StaticAnalysisRequest = {
        code: `
            void vulnerable_function() {
                char* buffer = (char*)malloc(10);
                strcpy(buffer, "This string is too long for the buffer");
                free(buffer);
                free(buffer);
            }
        `,
        language: 'cpp',
        options: {
            inferenceMode: 'local',
            useCUDA: false,
            maxLines: 100
        }
    };
    
    try {
        // Run analysis
        const result = await client.runStaticAnalysis(request);
        
        // Process results
        console.log(`Analysis completed in ${result.processingTime}ms`);
        console.log(`Found ${result.vulnerabilities.length} vulnerabilities`);
        
        result.vulnerabilities.forEach(vuln => {
            console.log(`Line ${vuln.lineNumber}: ${vuln.cweType} (${vuln.severityLevel})`);
        });
        
    } catch (error) {
        console.error('Analysis failed:', error);
    }
}
```

### Complete Dynamic Analysis Example

```typescript
async function runDynamicAnalysis() {
    const authManager = new AuthManager();
    await authManager.authenticate('username', 'password');
    
    const client = new CodeGuardApiClient('http://localhost:3000', authManager);
    
    const request: DynamicAnalysisRequest = {
        sourceCode: `
            void fuzz_target(char* input, size_t length) {
                char buffer[100];
                if (length < 100) {
                    memcpy(buffer, input, length);
                }
            }
        `,
        fuzzingOptions: {
            timeout: 300,
            fuzzerType: 'aflplusplus',
            sanitizers: ['address', 'undefined', 'leak'],
            maxMemory: '2GB',
            concolicExecution: true
        }
    };
    
    try {
        const result = await client.runDynamicAnalysis(request);
        
        console.log(`Fuzzing completed in ${result.processingTime}ms`);
        console.log(`Coverage: ${result.coverage.lineCoverage * 100}%`);
        console.log(`Unique crashes: ${result.fuzzingStats.uniqueCrashes}`);
        
        result.vulnerabilities.forEach(vuln => {
            console.log(`Vulnerability: ${vuln.type} at line ${vuln.lineNumber}`);
        });
        
    } catch (error) {
        console.error('Fuzzing failed:', error);
    }
}
```

### Container Management Example

```typescript
async function manageContainers() {
    const authManager = new AuthManager();
    await authManager.authenticate('username', 'password');
    
    const client = new CodeGuardApiClient('http://localhost:3000', authManager);
    
    try {
        // Check container status
        const status = await client.request<ContainerStatusResponse>('/api/containers/status');
        
        console.log('Static Analysis:', status.staticAnalysis.status);
        console.log('Dynamic Analysis:', status.dynamicAnalysis.status);
        
        // Start containers if needed
        if (status.staticAnalysis.status !== 'running') {
            await client.request('/api/containers/start', {
                method: 'POST',
                body: JSON.stringify({ service: 'static-analysis' })
            });
        }
        
        if (status.dynamicAnalysis.status !== 'running') {
            await client.request('/api/containers/start', {
                method: 'POST',
                body: JSON.stringify({ service: 'dynamic-analysis' })
            });
        }
        
    } catch (error) {
        console.error('Container management failed:', error);
    }
}
```

### VS Code Extension Integration Example

```typescript
import * as vscode from 'vscode';
import { CodeGuardApiClient, AuthManager } from './codeguard-api';

export class CodeGuardExtension {
    private apiClient: CodeGuardApiClient;
    private authManager: AuthManager;
    
    constructor() {
        this.authManager = new AuthManager();
        this.apiClient = new CodeGuardApiClient('http://localhost:5000', this.authManager);
    }
    
    async activate(context: vscode.ExtensionContext) {
        // Register commands
        context.subscriptions.push(
            vscode.commands.registerCommand('codeguard.runStaticAnalysis', () => {
                this.runStaticAnalysis();
            }),
            
            vscode.commands.registerCommand('codeguard.runDynamicAnalysis', () => {
                this.runDynamicAnalysis();
            })
        );
        
        // Set up file change listener
        const fileChangeListener = vscode.workspace.onDidSaveTextDocument((document) => {
            if (document.languageId === 'cpp' || document.languageId === 'c') {
                this.analyzeFile(document);
            }
        });
        
        context.subscriptions.push(fileChangeListener);
    }
    
    private async analyzeFile(document: vscode.TextDocument) {
        try {
            const request: StaticAnalysisRequest = {
                code: document.getText(),
                language: document.languageId as 'cpp' | 'c'
            };
            
            const result = await this.apiClient.runStaticAnalysis(request);
            
            // Display results in VS Code
            this.displayResults(result.vulnerabilities, document);
            
        } catch (error) {
            vscode.window.showErrorMessage(`Analysis failed: ${error.message}`);
        }
    }
    
    private displayResults(vulnerabilities: VulnerabilityResult[], document: vscode.TextDocument) {
        const diagnostics: vscode.Diagnostic[] = vulnerabilities.map(vuln => {
            const range = new vscode.Range(
                vuln.lineNumber - 1, 0,
                vuln.lineNumber - 1, 1000
            );
            
            return new vscode.Diagnostic(
                range,
                `${vuln.cweType}: ${vuln.description}`,
                this.getSeverity(vuln.severityLevel)
            );
        });
        
        vscode.languages.createDiagnosticCollection('CodeGuard').set(document.uri, diagnostics);
    }
    
    private getSeverity(level: string): vscode.DiagnosticSeverity {
        switch (level) {
            case 'Critical':
            case 'High':
                return vscode.DiagnosticSeverity.Error;
            case 'Medium':
                return vscode.DiagnosticSeverity.Warning;
            case 'Low':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Warning;
        }
    }
}
```

## Conclusion

This API documentation provides comprehensive coverage of CodeGuard's REST API and extension integration capabilities. The APIs are designed to be flexible, secure, and easy to integrate into existing development workflows.

Key features include:
- **RESTful API design** for remote analysis services
- **JWT authentication** for secure access
- **Comprehensive error handling** with detailed error types
- **TypeScript interfaces** for type-safe integration
- **Container management** APIs for deployment
- **VS Code extension integration** for seamless development experience

For additional information, refer to the [Architecture Documentation](ARCHITECTURE.md) and [Usage Guide](USAGE.md). 