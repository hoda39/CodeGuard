# CodeGuard API Reference

This document provides comprehensive API reference for CodeGuard, including REST API endpoints, TypeScript interfaces, and integration examples.

## Table of Contents

- [Overview](#overview)
- [REST API](#rest-api)
- [TypeScript Interfaces](#typescript-interfaces)
- [Extension API](#extension-api)
- [Analysis Engine API](#analysis-engine-api)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Overview

CodeGuard provides multiple API layers:

1. **REST API**: HTTP endpoints for remote analysis and result management
2. **Extension API**: VS Code extension integration interfaces
3. **Analysis Engine API**: Core analysis functionality
4. **TypeScript Interfaces**: Type definitions for all components

## REST API

### Base URL
```
http://localhost:3000/api
```

### Authentication
All API endpoints require authentication using JWT tokens.

```http
Authorization: Bearer <jwt_token>
```

### Endpoints

#### 1. Authentication

##### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `201`: User created successfully
- `400`: Invalid input data
- `409`: User already exists

##### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string"
    }
  }
}
```

**Status Codes:**
- `200`: Login successful
- `401`: Invalid credentials
- `400`: Invalid input data

#### 2. Static Analysis

##### POST /api/analysis/static
Submit code for static analysis.

**Request Body:**
```json
{
  "code": "string",
  "language": "cpp" | "c",
  "options": {
    "inferenceMode": "local" | "remote",
    "useCUDA": boolean,
    "maxLines": number,
    "severityThreshold": "low" | "medium" | "high" | "critical"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "uuid",
    "status": "completed",
    "results": [
      {
        "lineNumber": number,
        "cweId": "string",
        "cweType": "string",
        "cweSummary": "string",
        "severityLevel": "low" | "medium" | "high" | "critical",
        "severityScore": number,
        "confidenceScore": number,
        "description": "string",
        "remediation": "string"
      }
    ],
    "summary": {
      "totalIssues": number,
      "criticalIssues": number,
      "highIssues": number,
      "mediumIssues": number,
      "lowIssues": number
    },
    "processingTime": number,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `200`: Analysis completed successfully
- `400`: Invalid input data
- `500`: Analysis failed

##### GET /api/analysis/static/:id
Retrieve static analysis results by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "uuid",
    "status": "completed" | "processing" | "failed",
    "results": [...],
    "summary": {...},
    "processingTime": number,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 3. Dynamic Analysis

##### POST /api/analysis/dynamic
Submit code for dynamic analysis.

**Request Body:**
```json
{
  "sourceCode": "string",
  "language": "cpp" | "c",
  "compilerFlags": ["string"],
  "checkers": ["memory_leak", "use_after_free", "double_free"],
  "options": {
    "timeout": number,
    "outputFormat": "sarif" | "json",
    "enableASan": boolean
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "uuid",
    "status": "completed",
    "results": [
      {
        "ruleId": "string",
        "level": "error" | "warning" | "info",
        "message": {
          "text": "string"
        },
        "locations": [
          {
            "physicalLocation": {
              "artifactLocation": {
                "uri": "string"
              },
              "region": {
                "startLine": number,
                "startColumn": number,
                "endLine": number,
                "endColumn": number
              }
            }
          }
        ],
        "properties": {
          "cweId": "string",
          "severity": "string",
          "confidence": number
        }
      }
    ],
    "sarifReport": "string",
    "summary": {
      "totalIssues": number,
      "criticalIssues": number,
      "highIssues": number,
      "mediumIssues": number,
      "lowIssues": number
    },
    "processingTime": number,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

##### GET /api/analysis/dynamic/:id
Retrieve dynamic analysis results by ID.

#### 4. Results Management

##### GET /api/results
List all analysis results for the authenticated user.

**Query Parameters:**
- `type`: `static` | `dynamic` | `all`
- `status`: `completed` | `processing` | `failed`
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "uuid",
        "type": "static" | "dynamic",
        "status": "completed" | "processing" | "failed",
        "summary": {...},
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": number,
      "limit": number,
      "offset": number,
      "hasMore": boolean
    }
  }
}
```

##### DELETE /api/results/:id
Delete analysis result by ID.

**Response:**
```json
{
  "success": true,
  "message": "Result deleted successfully"
}
```

#### 5. Health and Status

##### GET /api/health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "analysis": "healthy",
    "ml": "healthy"
  }
}
```

##### GET /api/status
Get detailed system status.

**Response:**
```json
{
  "status": "operational",
  "uptime": number,
  "memory": {
    "used": number,
    "total": number,
    "percentage": number
  },
  "cpu": {
    "usage": number,
    "cores": number
  },
  "activeAnalyses": number,
  "queueLength": number
}
```

## TypeScript Interfaces

### Core Types

```typescript
// Analysis Types
export type AnalysisType = 'static' | 'dynamic';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type Language = 'cpp' | 'c';

// Vulnerability Types
export interface VulnerabilityResult {
  id: string;
  lineNumber: number;
  columnNumber?: number;
  cweId: string;
  cweType: string;
  cweSummary: string;
  severityLevel: SeverityLevel;
  severityScore: number;
  confidenceScore: number;
  description: string;
  remediation?: string;
  source: AnalysisType;
  tool: string;
  timestamp: Date;
}

// Analysis Results
export interface AnalysisResult {
  id: string;
  type: AnalysisType;
  status: AnalysisStatus;
  results: VulnerabilityResult[];
  summary: AnalysisSummary;
  processingTime: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AnalysisSummary {
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
}

// Configuration Types
export interface AnalysisConfig {
  static: StaticAnalysisConfig;
  dynamic: DynamicAnalysisConfig;
  general: GeneralConfig;
}

export interface StaticAnalysisConfig {
  inferenceMode: 'local' | 'remote';
  useCUDA: boolean;
  delayBeforeAnalysis: number;
  maxNumberOfLines: number;
  severityThreshold: SeverityLevel;
}

export interface DynamicAnalysisConfig {
  enableASan: boolean;
  customCheckers: string[];
  outputFormat: 'sarif' | 'json';
  timeout: number;
  compilerFlags: string[];
}

export interface GeneralConfig {
  enableRealTimeAnalysis: boolean;
  sarifOutputPath: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
```

### API Client Types

```typescript
// API Client Interface
export interface CodeGuardAPIClient {
  // Authentication
  register(userData: RegisterRequest): Promise<RegisterResponse>;
  login(credentials: LoginRequest): Promise<LoginResponse>;
  
  // Analysis
  runStaticAnalysis(request: StaticAnalysisRequest): Promise<AnalysisResult>;
  runDynamicAnalysis(request: DynamicAnalysisRequest): Promise<AnalysisResult>;
  
  // Results
  getAnalysisResult(id: string): Promise<AnalysisResult>;
  listResults(filters?: ResultFilters): Promise<PaginatedResults>;
  deleteResult(id: string): Promise<void>;
  
  // System
  getHealth(): Promise<HealthStatus>;
  getStatus(): Promise<SystemStatus>;
}

// Request/Response Types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    username: string;
    email: string;
    createdAt: Date;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
}

export interface StaticAnalysisRequest {
  code: string;
  language: Language;
  options?: Partial<StaticAnalysisConfig>;
}

export interface DynamicAnalysisRequest {
  sourceCode: string;
  language: Language;
  compilerFlags?: string[];
  checkers?: string[];
  options?: Partial<DynamicAnalysisConfig>;
}

export interface ResultFilters {
  type?: AnalysisType;
  status?: AnalysisStatus;
  limit?: number;
  offset?: number;
}

export interface PaginatedResults {
  results: AnalysisResult[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

## Extension API

### VS Code Extension Integration

```typescript
// Extension Activation
export function activate(context: vscode.ExtensionContext): void {
  // Register commands
  const runAnalysisCommand = vscode.commands.registerCommand(
    'secure-code-analyzer.runAnalysis',
    runDynamicAnalysis
  );
  
  const cancelAnalysisCommand = vscode.commands.registerCommand(
    'secure-code-analyzer.cancelAnalysis',
    cancelAnalysis
  );
  
  context.subscriptions.push(runAnalysisCommand, cancelAnalysisCommand);
  
  // Register diagnostics collection
  const diagnosticsCollection = vscode.languages.createDiagnosticCollection('codeguard');
  context.subscriptions.push(diagnosticsCollection);
  
  // Set up file change listeners
  const fileChangeListener = vscode.workspace.onDidChangeTextDocument(
    handleFileChange
  );
  context.subscriptions.push(fileChangeListener);
}

// Analysis Functions
async function runDynamicAnalysis(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }
  
  const document = editor.document;
  if (document.languageId !== 'cpp' && document.languageId !== 'c') {
    vscode.window.showErrorMessage('Only C/C++ files are supported');
    return;
  }
  
  try {
    vscode.window.showInformationMessage('Starting dynamic analysis...');
    
    const result = await apiClient.runDynamicAnalysis({
      sourceCode: document.getText(),
      language: document.languageId as Language,
      options: {
        timeout: 30000,
        outputFormat: 'sarif'
      }
    });
    
    displayResults(result);
  } catch (error) {
    vscode.window.showErrorMessage(`Analysis failed: ${error.message}`);
  }
}

// Diagnostics Display
function displayResults(result: AnalysisResult): void {
  const diagnostics: vscode.Diagnostic[] = [];
  
  result.results.forEach(vulnerability => {
    const range = new vscode.Range(
      vulnerability.lineNumber - 1,
      vulnerability.columnNumber || 0,
      vulnerability.lineNumber - 1,
      vulnerability.columnNumber || 1000
    );
    
    const diagnostic = new vscode.Diagnostic(
      range,
      `${vulnerability.cweType}: ${vulnerability.description}`,
      getSeverity(vulnerability.severityLevel)
    );
    
    diagnostic.source = 'CodeGuard';
    diagnostic.code = vulnerability.cweId;
    
    diagnostics.push(diagnostic);
  });
  
  diagnosticsCollection.set(vscode.Uri.file(document.fileName), diagnostics);
}

// Utility Functions
function getSeverity(level: SeverityLevel): vscode.DiagnosticSeverity {
  switch (level) {
    case 'critical':
    case 'high':
      return vscode.DiagnosticSeverity.Error;
    case 'medium':
      return vscode.DiagnosticSeverity.Warning;
    case 'low':
      return vscode.DiagnosticSeverity.Information;
    default:
      return vscode.DiagnosticSeverity.Hint;
  }
}
```

## Analysis Engine API

### Core Analysis Engine

```typescript
// Analysis Engine Interface
export interface AnalysisEngine {
  // Static Analysis
  runStaticAnalysis(config: StaticAnalysisConfig): Promise<StaticAnalysisResult>;
  
  // Dynamic Analysis
  runDynamicAnalysis(config: DynamicAnalysisConfig): Promise<DynamicAnalysisResult>;
  
  // Utility
  validateConfig(config: AnalysisConfig): ValidationResult;
  getSupportedLanguages(): Language[];
  getSupportedCheckers(): string[];
}

// Analysis Engine Implementation
export class CodeGuardAnalysisEngine implements AnalysisEngine {
  private staticAnalysisEngine: StaticAnalysisEngine;
  private dynamicAnalysisEngine: DynamicAnalysisEngine;
  
  constructor(config: AnalysisConfig) {
    this.staticAnalysisEngine = new StaticAnalysisEngine(config.static);
    this.dynamicAnalysisEngine = new DynamicAnalysisEngine(config.dynamic);
  }
  
  async runStaticAnalysis(config: StaticAnalysisConfig): Promise<StaticAnalysisResult> {
    return this.staticAnalysisEngine.analyze(config);
  }
  
  async runDynamicAnalysis(config: DynamicAnalysisConfig): Promise<DynamicAnalysisResult> {
    return this.dynamicAnalysisEngine.analyze(config);
  }
  
  validateConfig(config: AnalysisConfig): ValidationResult {
    const errors: string[] = [];
    
    // Validate static analysis config
    if (config.static.inferenceMode === 'remote' && !config.static.serverUrl) {
      errors.push('Remote inference mode requires server URL');
    }
    
    // Validate dynamic analysis config
    if (config.dynamic.timeout <= 0) {
      errors.push('Timeout must be positive');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  getSupportedLanguages(): Language[] {
    return ['cpp', 'c'];
  }
  
  getSupportedCheckers(): string[] {
    return [
      'memory_leak',
      'use_after_free',
      'double_free',
      'heap_overflow',
      'stack_overflow',
      'use_after_return'
    ];
  }
}
```

### Vulnerability Checkers

```typescript
// Checker Interface
export interface VulnerabilityChecker {
  name: string;
  description: string;
  supportedLanguages: Language[];
  
  check(code: string, config: CheckerConfig): Promise<CheckerResult>;
}

// Checker Implementation Example
export class MemoryLeakChecker implements VulnerabilityChecker {
  name = 'memory_leak';
  description = 'Detects unreleased allocated memory';
  supportedLanguages = ['cpp', 'c'];
  
  async check(code: string, config: CheckerConfig): Promise<CheckerResult> {
    const results: VulnerabilityResult[] = [];
    
    // Parse code and identify potential memory leaks
    const ast = this.parseCode(code);
    const allocations = this.findMemoryAllocations(ast);
    const deallocations = this.findMemoryDeallocations(ast);
    
    // Find leaks (allocations without corresponding deallocations)
    const leaks = this.identifyLeaks(allocations, deallocations);
    
    leaks.forEach(leak => {
      results.push({
        id: generateId(),
        lineNumber: leak.line,
        cweId: 'CWE-401',
        cweType: 'Memory Leak',
        cweSummary: 'Memory allocated but not released',
        severityLevel: 'medium',
        severityScore: 0.7,
        confidenceScore: 0.8,
        description: `Memory allocated at line ${leak.line} is not released`,
        remediation: 'Add appropriate free() or delete statement',
        source: 'dynamic',
        tool: this.name,
        timestamp: new Date()
      });
    });
    
    return {
      checker: this.name,
      results,
      processingTime: Date.now() - config.startTime
    };
  }
  
  private parseCode(code: string): any {
    // Implementation for parsing C/C++ code
  }
  
  private findMemoryAllocations(ast: any): any[] {
    // Implementation for finding malloc/new calls
  }
  
  private findMemoryDeallocations(ast: any): any[] {
    // Implementation for finding free/delete calls
  }
  
  private identifyLeaks(allocations: any[], deallocations: any[]): any[] {
    // Implementation for identifying memory leaks
  }
}
```

## Authentication

### JWT Authentication

```typescript
// JWT Service
export class JWTAuthService {
  private secret: string;
  private expiresIn: string;
  
  constructor(secret: string, expiresIn: string = '24h') {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }
  
  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }
  
  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
  
  decodeToken(token: string): TokenPayload {
    return jwt.decode(token) as TokenPayload;
  }
}

// Authentication Middleware
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = jwtAuthService.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

## Error Handling

### Error Types

```typescript
// Custom Error Classes
export class CodeGuardError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'CodeGuardError';
  }
}

export class AnalysisError extends CodeGuardError {
  constructor(message: string, public analysisId?: string) {
    super(message, 'ANALYSIS_ERROR', 500);
    this.name = 'AnalysisError';
  }
}

export class ValidationError extends CodeGuardError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends CodeGuardError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

// Error Handler
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof CodeGuardError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    });
  } else {
    console.error('Unhandled error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}
```

## Examples

### Complete Analysis Workflow

```typescript
// Example: Complete analysis workflow
async function runCompleteAnalysis(sourceCode: string): Promise<AnalysisResult[]> {
  const apiClient = new CodeGuardAPIClient('http://localhost:3000');
  
  try {
    // Login
    const loginResponse = await apiClient.login({
      email: 'user@example.com',
      password: 'password'
    });
    
    apiClient.setToken(loginResponse.data.token);
    
    // Run static analysis
    const staticResult = await apiClient.runStaticAnalysis({
      code: sourceCode,
      language: 'cpp',
      options: {
        inferenceMode: 'local',
        useCUDA: false,
        severityThreshold: 'medium'
      }
    });
    
    // Run dynamic analysis
    const dynamicResult = await apiClient.runDynamicAnalysis({
      sourceCode,
      language: 'cpp',
      compilerFlags: ['-fsanitize=address', '-g'],
      checkers: ['memory_leak', 'use_after_free'],
      options: {
        timeout: 30000,
        outputFormat: 'sarif'
      }
    });
    
    return [staticResult, dynamicResult];
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

// Example: VS Code extension integration
export class CodeGuardExtension {
  private apiClient: CodeGuardAPIClient;
  private diagnosticsCollection: vscode.DiagnosticCollection;
  
  constructor() {
    this.apiClient = new CodeGuardAPIClient('http://localhost:3000');
    this.diagnosticsCollection = vscode.languages.createDiagnosticCollection('codeguard');
  }
  
  async analyzeDocument(document: vscode.TextDocument): Promise<void> {
    if (document.languageId !== 'cpp' && document.languageId !== 'c') {
      return;
    }
    
    try {
      const results = await runCompleteAnalysis(document.getText());
      
      // Display results
      this.displayResults(document, results);
      
      // Show summary
      this.showSummary(results);
    } catch (error) {
      vscode.window.showErrorMessage(`Analysis failed: ${error.message}`);
    }
  }
  
  private displayResults(document: vscode.TextDocument, results: AnalysisResult[]): void {
    const diagnostics: vscode.Diagnostic[] = [];
    
    results.forEach(result => {
      result.results.forEach(vulnerability => {
        const range = new vscode.Range(
          vulnerability.lineNumber - 1,
          vulnerability.columnNumber || 0,
          vulnerability.lineNumber - 1,
          vulnerability.columnNumber || 1000
        );
        
        const diagnostic = new vscode.Diagnostic(
          range,
          `${vulnerability.cweType}: ${vulnerability.description}`,
          this.getSeverity(vulnerability.severityLevel)
        );
        
        diagnostic.source = 'CodeGuard';
        diagnostic.code = vulnerability.cweId;
        
        if (vulnerability.remediation) {
          diagnostic.relatedInformation = [
            new vscode.DiagnosticRelatedInformation(
              new vscode.Location(document.uri, range),
              `Fix: ${vulnerability.remediation}`
            )
          ];
        }
        
        diagnostics.push(diagnostic);
      });
    });
    
    this.diagnosticsCollection.set(document.uri, diagnostics);
  }
  
  private showSummary(results: AnalysisResult[]): void {
    const totalIssues = results.reduce((sum, result) => sum + result.summary.totalIssues, 0);
    const criticalIssues = results.reduce((sum, result) => sum + result.summary.criticalIssues, 0);
    
    if (criticalIssues > 0) {
      vscode.window.showWarningMessage(
        `CodeGuard found ${totalIssues} issues (${criticalIssues} critical)`
      );
    } else if (totalIssues > 0) {
      vscode.window.showInformationMessage(
        `CodeGuard found ${totalIssues} issues`
      );
    } else {
      vscode.window.showInformationMessage('CodeGuard: No issues found');
    }
  }
  
  private getSeverity(level: SeverityLevel): vscode.DiagnosticSeverity {
    switch (level) {
      case 'critical':
      case 'high':
        return vscode.DiagnosticSeverity.Error;
      case 'medium':
        return vscode.DiagnosticSeverity.Warning;
      case 'low':
        return vscode.DiagnosticSeverity.Information;
      default:
        return vscode.DiagnosticSeverity.Hint;
    }
  }
}
```

### Integration Examples

```typescript
// Example: CI/CD Integration
export class CICDIntegration {
  private apiClient: CodeGuardAPIClient;
  
  constructor(apiUrl: string, token: string) {
    this.apiClient = new CodeGuardAPIClient(apiUrl);
    this.apiClient.setToken(token);
  }
  
  async analyzePullRequest(prNumber: number, files: string[]): Promise<AnalysisReport> {
    const results: AnalysisResult[] = [];
    
    for (const file of files) {
      if (file.endsWith('.cpp') || file.endsWith('.c')) {
        const content = await this.readFile(file);
        
        const staticResult = await this.apiClient.runStaticAnalysis({
          code: content,
          language: file.endsWith('.cpp') ? 'cpp' : 'c'
        });
        
        results.push(staticResult);
      }
    }
    
    return this.generateReport(results);
  }
  
  private generateReport(results: AnalysisResult[]): AnalysisReport {
    const totalIssues = results.reduce((sum, result) => sum + result.summary.totalIssues, 0);
    const criticalIssues = results.reduce((sum, result) => sum + result.summary.criticalIssues, 0);
    
    return {
      summary: {
        totalFiles: results.length,
        totalIssues,
        criticalIssues,
        highIssues: results.reduce((sum, result) => sum + result.summary.highIssues, 0),
        mediumIssues: results.reduce((sum, result) => sum + result.summary.mediumIssues, 0),
        lowIssues: results.reduce((sum, result) => sum + result.summary.lowIssues, 0)
      },
      results,
      recommendations: this.generateRecommendations(results)
    };
  }
  
  private generateRecommendations(results: AnalysisResult[]): string[] {
    const recommendations: string[] = [];
    
    const criticalCount = results.reduce((sum, result) => sum + result.summary.criticalIssues, 0);
    if (criticalCount > 0) {
      recommendations.push(`Fix ${criticalCount} critical security vulnerabilities before merging`);
    }
    
    const highCount = results.reduce((sum, result) => sum + result.summary.highIssues, 0);
    if (highCount > 0) {
      recommendations.push(`Address ${highCount} high-severity issues`);
    }
    
    return recommendations;
  }
}
```

This API reference provides comprehensive documentation for integrating with CodeGuard. For additional examples and use cases, refer to the [Examples](docs/EXAMPLES.md) documentation. 