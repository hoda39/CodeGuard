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
│  │   ML Models     │  │   Fuzzing       │  │   Sanitizers    │  │
│  │   (Local/       │  │   Engine        │  │   Integration   │  │
│  │   Remote)       │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Results Processing                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Diagnostics   │  │   Fuzzing       │  │   Reports       │  │
│  │   Display       │  │   Results       │  │   Export        │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Static Analysis Engine

The static analysis engine uses transformer-based machine learning models for vulnerability prediction.

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

The dynamic analysis engine provides grey box concolic execution fuzzing with sanitizer-based vulnerability detection.

#### Core Components

- **Fuzzing Orchestrator** (`DynamicAnalysis/extension/src/core/orchestrator.ts`)
  - Coordinates multiple fuzzing tools
  - Manages fuzzing workflows
  - Handles result aggregation
  - Provides unified API

- **Grey Box Concolic Engine** (`DynamicAnalysis/extension/src/core/concolic/`)
  - Implements concolic execution
  - Manages symbolic and concrete execution
  - Generates test cases
  - Optimizes exploration strategies

- **Fuzzing Engine** (`DynamicAnalysis/extension/src/core/fuzzing/`)
  - AFL++ integration
  - Eclipser integration
  - Test case generation
  - Coverage tracking

- **Sanitizer Integration** (`DynamicAnalysis/extension/src/core/sanitizers/`)
  - AddressSanitizer integration
  - UndefinedBehaviorSanitizer integration
  - LeakSanitizer integration
  - ThreadSanitizer integration

#### Analysis Pipeline

```
Source Code → Compilation → Fuzzing → Sanitizer Detection → Result Processing
     │            │            │            │                │
     ▼            ▼            ▼            ▼                ▼
C/C++ Files → Sanitizer Flags → Concolic Execution → Runtime Detection → Fuzzing Reports
```

### 3. Containerization Layer

Both analysis engines are containerized for consistent deployment and isolation.

#### Static Analysis Container

```dockerfile
# StaticAnalysis/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Expose API port
EXPOSE 5000

# Start inference server
CMD ["python", "remote-inference-py/server.py"]
```

#### Dynamic Analysis Container

```dockerfile
# DynamicAnalysis/Dockerfile
FROM ubuntu:20.04

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    clang \
    llvm \
    afl++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Copy application code
COPY . .

# Install Node.js dependencies
RUN npm install

# Expose API port
EXPOSE 3000

# Start analysis server
CMD ["npm", "start"]
```

#### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  static-analysis:
    build: ./StaticAnalysis
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MODEL_PATH=/app/models
    volumes:
      - static-models:/app/models
      - static-cache:/app/cache
    restart: unless-stopped

  dynamic-analysis:
    build: ./DynamicAnalysis
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FUZZING_TIMEOUT=300
      - MAX_MEMORY=2GB
    volumes:
      - dynamic-results:/app/results
      - dynamic-cache:/app/cache
    restart: unless-stopped

volumes:
  static-models:
  static-cache:
  dynamic-results:
  dynamic-cache:
```

### 4. API Layer

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
  "fuzzingOptions": {
    "timeout": number,
    "fuzzerType": "aflplusplus" | "eclipser",
    "sanitizers": string[]
  }
}

// Results
GET /api/results/:id
GET /api/health
```

### 5. Extension Integration

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

### Fuzzing Result

```typescript
interface FuzzingResult {
  id: string;
  vulnerabilities: VulnerabilityResult[];
  testCases: TestCase[];
  coverage: CoverageInfo;
  fuzzingStats: FuzzingStats;
  processingTime: number;
  timestamp: Date;
}

interface TestCase {
  id: string;
  input: string;
  coverage: number;
  crashType?: string;
  stackTrace?: string;
}

interface CoverageInfo {
  lineCoverage: number;
  branchCoverage: number;
  functionCoverage: number;
  uncoveredLines: number[];
}

interface FuzzingStats {
  totalExecutions: number;
  uniqueCrashes: number;
  timeouts: number;
  averageExecutionTime: number;
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
    fuzzingTimeout: number;
    fuzzerType: 'aflplusplus' | 'eclipser';
    sanitizers: string[];
    maxMemory: string;
  };
  containers: {
    useContainers: boolean;
    staticAnalysisUrl: string;
    dynamicAnalysisUrl: string;
    autoStart: boolean;
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

### Container Security

- **Isolation**: Each analysis runs in isolated containers
- **Resource Limits**: Memory and CPU limits prevent resource exhaustion
- **Network Isolation**: Containers communicate only through defined APIs
- **Image Security**: Base images are regularly updated for security patches

## Performance Considerations

### Static Analysis Performance

- **Model Caching**: ML models are cached in memory
- **Incremental Analysis**: Only modified functions are re-analyzed
- **Background Processing**: Analysis runs in background threads
- **Result Caching**: Previous results are cached to avoid redundant analysis

### Dynamic Analysis Performance

- **Parallel Fuzzing**: Multiple fuzzing instances run in parallel
- **Timeout Management**: Analysis is bounded by configurable timeouts
- **Resource Monitoring**: System resources are monitored during analysis
- **Graceful Degradation**: System continues to function even if some components fail

### Container Performance

- **Resource Optimization**: Efficient memory and CPU usage
- **Caching Strategies**: Multi-level caching for improved performance
- **Async Processing**: Non-blocking operations for better responsiveness
- **Batch Processing**: Support for batch analysis of multiple files

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

### Container Scaling

- **Auto-scaling**: Containers can be auto-scaled based on load
- **Resource Limits**: Individual container resource limits
- **Health Checks**: Automated health monitoring and restart
- **Load Distribution**: Intelligent load distribution across containers

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

### Container Monitoring

- **Health Checks**: Regular health check endpoints
- **Resource Monitoring**: CPU, memory, and network usage
- **Log Monitoring**: Centralized log collection
- **Alerting**: Automated alerts for issues

## Future Enhancements

### Planned Features

1. **Integration with CI/CD**: Automated analysis in build pipelines
2. **Custom Rule Engine**: User-defined vulnerability detection rules
3. **Advanced Fuzzing**: Integration with additional fuzzing tools
4. **Cloud Deployment**: SaaS version with cloud-based analysis
5. **Multi-language Support**: Extension to other programming languages

### Technical Improvements

1. **Model Optimization**: Improved ML model performance and accuracy
2. **Real-time Collaboration**: Multi-user analysis and result sharing
3. **Advanced Reporting**: Enhanced visualization and reporting capabilities
4. **Plugin Architecture**: Extensible plugin system for custom analyzers

### Container Improvements

1. **Kubernetes Deployment**: Native Kubernetes support
2. **Service Mesh**: Istio integration for advanced networking
3. **Auto-scaling**: Intelligent auto-scaling based on demand
4. **Multi-region**: Global deployment with regional optimization

## Conclusion

The CodeGuard architecture is designed to be modular, scalable, and maintainable. The separation of concerns between static and dynamic analysis allows for independent development and optimization of each component. The containerization layer provides consistent deployment and isolation, while the API layer provides flexibility for integration with other tools and systems.

The architecture supports both local and remote deployment models, making it suitable for individual developers, development teams, and enterprise environments. The focus on security, performance, and scalability ensures that CodeGuard can grow with the needs of its users while maintaining high standards of code quality and security analysis. 