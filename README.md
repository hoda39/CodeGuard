# CodeGuard: Advanced C/C++ Security Analysis Extension

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visual-studio-code)](https://marketplace.visualstudio.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green?logo=node.js)](https://nodejs.org/)

**CodeGuard** is a comprehensive VS Code extension that provides advanced static and dynamic security analysis for C/C++ code. It combines AI-powered vulnerability detection with runtime memory analysis to help security engineers and developers identify and remediate security vulnerabilities early in the development lifecycle.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [Security Analysis Types](#security-analysis-types)
- [API Reference](#api-reference)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

CodeGuard integrates two powerful analysis engines:

1. **Static Analysis (AIBugHunter)**: AI-driven vulnerability prediction using machine learning models trained on the National Vulnerability Database (NVD)
2. **Dynamic Analysis**: Runtime memory analysis using AddressSanitizer (ASan) and custom vulnerability checkers

The extension provides real-time analysis, detailed vulnerability reports, and actionable remediation guidance directly within your VS Code environment.

## ✨ Features

### Static Analysis Features
- **Real-time Vulnerability Detection**: AI-powered analysis that runs automatically as you type
- **CWE Classification**: Identifies Common Weakness Enumeration (CWE) types and IDs
- **Severity Assessment**: Provides severity scores and confidence levels for detected vulnerabilities
- **Multi-Model Support**: Local and remote inference modes for flexibility
- **CUDA Acceleration**: GPU-accelerated inference for improved performance

### Dynamic Analysis Features
- **AddressSanitizer Integration**: Comprehensive memory error detection
- **Custom Vulnerability Checkers**: Specialized detection for:
  - Memory leaks
  - Use-after-free vulnerabilities
  - Double-free errors
  - Heap overflow detection
  - Stack overflow detection
  - Use-after-return vulnerabilities
- **SARIF Report Generation**: Standardized security analysis results
- **Real-time Analysis**: Continuous monitoring during development

### General Features
- **Unified Interface**: Single extension providing both static and dynamic analysis
- **Professional Diagnostics**: Detailed vulnerability information with remediation suggestions
- **Configurable Analysis**: Customizable analysis parameters and thresholds
- **Integration Ready**: Compatible with CI/CD pipelines and security workflows

## 🏗️ Architecture

```
CodeGuard/
├── StaticAnalysis/          # AI-powered static analysis
│   ├── code/               # VS Code extension core
│   └── remote-inference-py/ # Remote inference server
├── DynamicAnalysis/         # Runtime analysis engine
│   ├── extension/          # VS Code extension
│   ├── src/               # Analysis tools and fuzzers
│   └── vulnerable_code/    # Test cases and examples
└── docs/                   # Documentation
```

### Component Overview

- **Static Analysis Engine**: Uses transformer-based models for line-level vulnerability prediction
- **Dynamic Analysis Engine**: Leverages AddressSanitizer and custom checkers for runtime detection
- **API Layer**: RESTful API for remote analysis and result management
- **Extension Core**: VS Code integration and user interface

## 🚀 Installation

### Prerequisites

- **VS Code**: Version 1.69.0 or higher
- **Node.js**: Version 16.x or higher
- **Python**: Version 3.8+ (for local inference)
- **C/C++ Compiler**: GCC/Clang with AddressSanitizer support
- **Docker**: Optional, for containerized deployment

### Extension Installation

1. **From VS Code Marketplace** (Recommended):
   ```bash
   # Open VS Code and search for "CodeGuard" in the Extensions marketplace
   # Or install via command line:
   code --install-extension CodeGuard.secure-code-analyzer
   ```

2. **From Source**:
   ```bash
   git clone https://github.com/hoda39/CodeGuard.git
   cd CodeGuard
   
   # Install static analysis dependencies
   cd StaticAnalysis/code
   npm install
   npm run compile
   
   # Install dynamic analysis dependencies
   cd ../../DynamicAnalysis/extension
   npm install
   npm run compile
   ```

### Python Dependencies (Static Analysis)

For local inference mode:

```bash
pip install numpy onnxruntime torch transformers
# For GPU acceleration (NVIDIA GPUs only):
pip install onnxruntime-gpu
```

## ⚡ Quick Start

1. **Open a C/C++ Project**:
   ```bash
   code your-cpp-project/
   ```

2. **Enable CodeGuard**:
   - The extension activates automatically for `.c` and `.cpp` files
   - Static analysis begins immediately
   - Dynamic analysis is available via command palette

3. **Run Dynamic Analysis**:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
   - Select "Run AddressSanitizer"
   - View results in the Problems panel

4. **View Vulnerability Reports**:
   - Static analysis results appear as inline diagnostics
   - Dynamic analysis results are available in the SARIF viewer
   - Detailed reports in the Output panel

## ⚙️ Configuration

### Static Analysis Settings

```json
{
  "AiBugHunter.inference.inferenceMode": "Local",
  "AiBugHunter.inference.useCUDA": false,
  "AiBugHunter.diagnostics.delayBeforeAnalysis": 1500,
  "AiBugHunter.diagnostics.maxNumberOfLines": 1,
  "AiBugHunter.diagnostics.highlightSeverityType": "Error"
}
```

### Dynamic Analysis Settings

```json
{
  "secure-code-analyzer.apiUrl": "http://localhost:3000",
  "secure-code-analyzer.enableRealTimeAnalysis": true,
  "secure-code-analyzer.sarifOutputPath": "./analysis-results"
}
```

## 📖 Usage

### Static Analysis Workflow

1. **Automatic Analysis**: The extension analyzes your code in real-time as you type
2. **Vulnerability Highlighting**: Detected issues are highlighted with severity-based colors
3. **Detailed Information**: Hover over highlights for CWE details and severity scores
4. **Configuration**: Adjust analysis sensitivity and display options in settings

### Dynamic Analysis Workflow

1. **Manual Analysis**: Use command palette to run AddressSanitizer analysis
2. **Build Integration**: Configure your build system to include ASan flags
3. **Result Review**: View detailed reports in the SARIF viewer
4. **Continuous Monitoring**: Enable real-time analysis for ongoing security monitoring

### Example Analysis Session

```cpp
// Example vulnerable code
void vulnerable_function() {
    char* buffer = (char*)malloc(10);
    strcpy(buffer, "This string is too long for the buffer"); // Buffer overflow
    free(buffer);
    free(buffer); // Double free
}
```

**Static Analysis Output**:
- Line 3: CWE-119 (Buffer Overflow) - High Severity
- Line 5: CWE-415 (Double Free) - Critical Severity

**Dynamic Analysis Output**:
- AddressSanitizer detects buffer overflow at runtime
- Custom checker identifies double free vulnerability

## 🔍 Security Analysis Types

### Static Analysis Vulnerabilities

| CWE ID | Vulnerability Type | Description |
|--------|-------------------|-------------|
| CWE-119 | Buffer Overflow | Memory access outside allocated bounds |
| CWE-120 | Buffer Copy without Checking Size | Unsafe memory operations |
| CWE-125 | Out-of-bounds Read | Reading beyond buffer boundaries |
| CWE-190 | Integer Overflow | Arithmetic overflow conditions |
| CWE-191 | Integer Underflow | Arithmetic underflow conditions |
| CWE-215 | Information Exposure Through Debug Information | Debug information leakage |
| CWE-243 | Creation of chroot Jail Without Changing Working Directory | Insecure jail configuration |
| CWE-332 | Insufficient Entropy in PRNG | Weak random number generation |
| CWE-367 | Time-of-check Time-of-use (TOCTOU) Race Condition | Race condition vulnerabilities |
| CWE-426 | Untrusted Search Path | Path traversal vulnerabilities |
| CWE-434 | Unrestricted Upload of File with Dangerous Type | File upload vulnerabilities |
| CWE-502 | Deserialization of Untrusted Data | Unsafe deserialization |
| CWE-522 | Insufficiently Protected Credentials | Credential exposure |
| CWE-732 | Incorrect Permission Assignment for Critical Resource | Permission vulnerabilities |
| CWE-787 | Out-of-bounds Write | Writing beyond buffer boundaries |
| CWE-908 | Use of Uninitialized Resource | Uninitialized resource usage |

### Dynamic Analysis Vulnerabilities

| Vulnerability Type | Detection Method | Description |
|-------------------|------------------|-------------|
| Memory Leak | Custom Checker | Unreleased allocated memory |
| Use-after-Free | AddressSanitizer | Accessing freed memory |
| Double Free | AddressSanitizer | Multiple deallocations |
| Heap Overflow | AddressSanitizer | Writing beyond heap boundaries |
| Stack Overflow | AddressSanitizer | Stack buffer overflow |
| Use-after-Return | AddressSanitizer | Accessing stack after function return |

## 🔌 API Reference

### Static Analysis API

```typescript
interface VulnerabilityResult {
  lineNumber: number;
  cweId: string;
  cweType: string;
  cweSummary: string;
  severityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  severityScore: number;
  confidenceScore: number;
}
```

### Dynamic Analysis API

```typescript
interface AnalysisResult {
  tool: string;
  results: SarifResult[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
  };
}
```

### REST API Endpoints

- `POST /api/analysis/static` - Submit code for static analysis
- `POST /api/analysis/dynamic` - Submit code for dynamic analysis
- `GET /api/results/:id` - Retrieve analysis results
- `GET /api/health` - Health check endpoint

## 🛠️ Development

### Project Structure

```
CodeGuard/
├── StaticAnalysis/
│   ├── code/                    # VS Code extension
│   │   ├── src/
│   │   │   ├── extension.ts     # Main extension logic
│   │   │   ├── inference.ts     # ML inference handling
│   │   │   ├── diagnostics.ts   # Diagnostic display
│   │   │   └── config.ts        # Configuration management
│   │   └── resources/           # ML models and configs
│   └── remote-inference-py/     # Python inference server
├── DynamicAnalysis/
│   ├── extension/               # VS Code extension
│   │   ├── src/
│   │   │   ├── api/            # REST API implementation
│   │   │   ├── core/           # Analysis engine
│   │   │   │   ├── checkers/   # Vulnerability checkers
│   │   │   │   ├── orchestrator.ts
│   │   │   │   └── sarif.ts    # SARIF report generation
│   │   │   └── extension/      # VS Code integration
│   │   └── src/                # Analysis tools
│   └── vulnerable_code/        # Test cases
└── docs/                       # Documentation
```

### Building from Source

```bash
# Clone the repository
git clone https://github.com/hoda39/CodeGuard.git
cd CodeGuard

# Build static analysis extension
cd StaticAnalysis/code
npm install
npm run compile

# Build dynamic analysis extension
cd ../../DynamicAnalysis/extension
npm install
npm run compile

# Package extensions
npm run package
```

### Running Tests

```bash
# Static analysis tests
cd StaticAnalysis/code
npm test

# Dynamic analysis tests
cd ../../DynamicAnalysis/extension
npm test
```

### Development Workflow

1. **Local Development**:
   ```bash
   # Start development server
   npm run watch
   
   # Run extension in development mode
   F5 in VS Code
   ```

2. **Testing**:
   ```bash
   # Run unit tests
   npm test
   
   # Run integration tests
   npm run test:integration
   ```

3. **Linting**:
   ```bash
   npm run lint
   npm run lint:fix
   ```

## 🤝 Contributing

We welcome contributions from the security and development community! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint configuration provided
- Write comprehensive tests
- Document new features and APIs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LineVul**: Transformer-based line-level vulnerability prediction
- **VulRepair**: T5-based automated software vulnerability repair
- **AddressSanitizer**: Runtime memory error detection
- **SARIF**: Standardized security analysis results format

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/hoda39/CodeGuard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hoda39/CodeGuard/discussions)
- **Security**: [Security Policy](SECURITY.md)

---

**CodeGuard** - Empowering developers with advanced security analysis tools for safer C/C++ development.
