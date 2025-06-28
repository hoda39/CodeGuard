# CodeGuard Architecture Documentation

## Overview

CodeGuard is designed as a modular, extensible security analysis platform that integrates static and dynamic analysis capabilities within the VS Code environment. This document provides a comprehensive overview of the system architecture, component interactions, and design decisions.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VS Code Extension                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Static        │  │   Dynamic       │  │   Unified       │  │
│  │   Analysis      │  │   Analysis      │  │   Interface     │  │
│  │   Engine        │  │   Engine        │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Analysis Orchestrator                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   ML Models     │  │   ASan          │  │   Custom        │  │
│  │   (Local/       │  │   Integration   │  │   Checkers      │  │
│  │   Remote)       │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Results Processing                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   SARIF         │  │   Diagnostics   │  │   Reports       │  │
│  │   Generation    │  │   Display       │  │   Export        │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Static Analysis Engine (AIBugHunter)

The static analysis engine is based on the AIBugHunter architecture, which uses transformer-based machine learning models for vulnerability prediction.

#### Core Components

- **Extension Core** (`StaticAnalysis/code/src/extension.ts`)
  - Manages VS Code integration
  - Handles file change events
  - Coordinates analysis workflows
  - Manages diagnostic display

- **Inference Engine** (`StaticAnalysis/code/src/inference.ts`)
  - Interfaces with ML models
  - Supports local and remote inference
  - Handles model loading and caching
  - Manages CUDA acceleration

- **Diagnostics Manager** (`StaticAnalysis/code/src/diagnostics.ts`)
  - Processes vulnerability results
  - Formats diagnostic messages
  - Manages severity highlighting
  - Handles user preferences

#### Data Flow

```
Source Code → Preprocessing → ML Model → Post-processing → Diagnostics
     │              │            │            │              │
     ▼              ▼            ▼            ▼              ▼
File Change → Tokenization → Inference → CWE Mapping → VS Code Display
```

#### Model Architecture

The static analysis uses two primary models:

1. **LineVul Model**: Transformer-based line-level vulnerability prediction
   - Input: Tokenized source code lines
   - Output: Vulnerability probability scores
   - Architecture: BERT-based transformer

2. **VulRepair Model**: T5-based vulnerability repair suggestion
   - Input: Vulnerable code snippets
   - Output: Suggested fixes
   - Architecture: T5 transformer

### 2. Dynamic Analysis Engine

The dynamic analysis engine provides runtime security analysis using AddressSanitizer and custom vulnerability checkers.

#### Core Components

- **Analysis Orchestrator** (`DynamicAnalysis/extension/src/core/orchestrator.ts`)
  - Coordinates multiple analysis tools
  - Manages analysis workflows
  - Handles result aggregation
  - Provides unified API

- **AddressSanitizer Integration** (`DynamicAnalysis/extension/src/core/asan.ts`)
  - Interfaces with ASan runtime
  - Processes ASan output
  - Maps ASan errors to CWE categories
  - Provides detailed error information

- **Custom Checkers** (`DynamicAnalysis/extension/src/core/checkers/`)
  - Memory leak detection
  - Use-after-free detection
  - Double-free detection
  - Heap overflow detection
  - Stack overflow detection
  - Use-after-return detection

#### Analysis Pipeline

```
Source Code → Compilation → Runtime Execution → Error Detection → Result Processing
     │            │              │                │                │
     ▼            ▼              ▼                ▼                ▼
C/C++ Files → ASan Flags → Instrumented Binary → ASan Runtime → SARIF Reports
```

### 3. API Layer

The API layer provides RESTful endpoints for remote analysis and result management.

#### API Components

- **Express Server** (`DynamicAnalysis/extension/src/api/server.ts`)
  - RESTful API endpoints
  - Authentication middleware
  - Rate limiting
  - CORS handling

- **Analysis Controllers** (`DynamicAnalysis/extension/src/api/controllers/`)
  - Static analysis endpoints
  - Dynamic analysis endpoints
  - Result retrieval endpoints
  - Health check endpoints

- **Authentication** (`DynamicAnalysis/extension/src/api/middleware/auth.ts`)
  - JWT token validation
  - User authentication
  - Role-based access control

#### API Endpoints

```typescript
// Static Analysis
POST /api/analysis/static
{
  "code": string,
  "language": "cpp" | "c",
  "options": {
    "inferenceMode": "local" | "remote",
    "useCUDA": boolean
  }
}

// Dynamic Analysis
POST /api/analysis/dynamic
{
  "sourceCode": string,
  "compilerFlags": string[],
  "checkers": string[]
}

// Results
GET /api/results/:id
GET /api/health
```

### 4. Extension Integration

The VS Code extension provides the user interface and integrates all analysis components.

#### Extension Components

- **Command Registration** (`DynamicAnalysis/extension/src/extension/extension.ts`)
  - Registers VS Code commands
  - Handles command execution
  - Manages extension lifecycle

- **Status Bar Integration**
  - Shows analysis status
  - Displays progress indicators
  - Provides quick access to results

- **Output Channels**
  - Analysis logs
  - Error messages
  - Debug information

## Data Models

### Vulnerability Result

```typescript
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
```

### Analysis Configuration

```typescript
interface AnalysisConfig {
  static: {
    inferenceMode: 'local' | 'remote';
    useCUDA: boolean;
    delayBeforeAnalysis: number;
    maxNumberOfLines: number;
  };
  dynamic: {
    enableASan: boolean;
    customCheckers: string[];
    outputFormat: 'sarif' | 'json';
    timeout: number;
  };
  general: {
    enableRealTimeAnalysis: boolean;
    sarifOutputPath: string;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}
```

## Security Considerations

### Data Privacy

- **Local Processing**: Static analysis can run entirely locally
- **Secure Communication**: API endpoints use HTTPS and JWT authentication
- **Data Minimization**: Only necessary code snippets are sent for analysis
- **Audit Logging**: All analysis requests are logged for security auditing

### Access Control

- **User Authentication**: JWT-based authentication for API access
- **Rate Limiting**: Prevents abuse of analysis endpoints
- **Input Validation**: Comprehensive validation of all inputs
- **Output Sanitization**: All outputs are sanitized to prevent injection attacks

## Performance Considerations

### Static Analysis Performance

- **Model Caching**: ML models are cached in memory
- **Incremental Analysis**: Only modified functions are re-analyzed
- **Background Processing**: Analysis runs in background threads
- **Result Caching**: Previous results are cached to avoid redundant analysis

### Dynamic Analysis Performance

- **Parallel Execution**: Multiple checkers run in parallel
- **Timeout Management**: Analysis is bounded by configurable timeouts
- **Resource Monitoring**: System resources are monitored during analysis
- **Graceful Degradation**: System continues to function even if some components fail

## Scalability

### Horizontal Scaling

- **Stateless Design**: API endpoints are stateless for easy scaling
- **Load Balancing**: Multiple instances can be load balanced
- **Database Separation**: Results can be stored in external databases
- **Microservices**: Components can be deployed as separate services

### Vertical Scaling

- **Resource Optimization**: Efficient memory and CPU usage
- **Caching Strategies**: Multi-level caching for improved performance
- **Async Processing**: Non-blocking operations for better responsiveness
- **Batch Processing**: Support for batch analysis of multiple files

## Monitoring and Observability

### Logging

- **Structured Logging**: JSON-formatted logs for easy parsing
- **Log Levels**: Configurable log levels for different environments
- **Log Aggregation**: Centralized log collection and analysis
- **Performance Metrics**: Detailed timing and resource usage metrics

### Metrics

- **Analysis Metrics**: Success rates, processing times, error rates
- **User Metrics**: Usage patterns, feature adoption
- **System Metrics**: Resource utilization, performance bottlenecks
- **Security Metrics**: Authentication attempts, rate limit violations

## Future Enhancements

### Planned Features

1. **Integration with CI/CD**: Automated analysis in build pipelines
2. **Custom Rule Engine**: User-defined vulnerability detection rules
3. **Advanced Fuzzing**: Integration with AFL++ and other fuzzing tools
4. **Cloud Deployment**: SaaS version with cloud-based analysis
5. **Multi-language Support**: Extension to other programming languages

### Technical Improvements

1. **Model Optimization**: Improved ML model performance and accuracy
2. **Real-time Collaboration**: Multi-user analysis and result sharing
3. **Advanced Reporting**: Enhanced visualization and reporting capabilities
4. **Plugin Architecture**: Extensible plugin system for custom analyzers

## Conclusion

The CodeGuard architecture is designed to be modular, scalable, and maintainable. The separation of concerns between static and dynamic analysis allows for independent development and optimization of each component. The API layer provides flexibility for integration with other tools and systems, while the VS Code extension provides a seamless user experience for developers.

The architecture supports both local and remote deployment models, making it suitable for individual developers, development teams, and enterprise environments. The focus on security, performance, and scalability ensures that CodeGuard can grow with the needs of its users while maintaining high standards of code quality and security analysis. 