# CodeGuard: Advanced C/C++ Security Analysis Extension

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visual-studio-code)](https://marketplace.visualstudio.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)](https://docker.com/)

**CodeGuard** is a VS Code extension that provides advanced static and dynamic security analysis for C/C++ code. It combines AI-powered vulnerability detection with grey box concolic execution fuzzing to help identify and remediate security vulnerabilities.

## Features

- **Static Analysis**: AI-driven vulnerability prediction using ML models
- **Dynamic Analysis**: Grey box concolic execution fuzzing with sanitizers
- **Real-time Analysis**: Automatic vulnerability detection as you code
- **Containerized**: Everything runs in isolated containers - no local setup required
- **Professional Diagnostics**: Detailed vulnerability reports with remediation guidance

## Quick Start

### Prerequisites
- **VS Code**: Version 1.69.0+
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+ (recommended)

### Installation

1. **Install VS Code Extension**:
   ```bash
   code --install-extension CodeGuard.secure-code-analyzer
   ```

2. **Start Analysis Containers**:
   ```bash
   git clone https://github.com/hoda39/CodeGuard.git
   cd CodeGuard
   docker-compose up -d
   ```

3. **Verify Installation**:
   ```bash
   curl http://localhost:5000/health  # Static analysis
   curl http://localhost:3000/health  # Dynamic analysis
   ```

### Usage

1. **Open a C/C++ file** (`.c`, `.cpp`, `.h`, `.hpp`)
2. **Static analysis begins automatically** - diagnostics appear in Problems panel
3. **Run dynamic analysis** via Command Palette (`Ctrl+Shift+P` → "Run Fuzzing Analysis")

## Configuration



## Docker Compose

```yaml
version: '3.8'
services:
  static-analysis:
    image: codeguard/static-analysis:latest
    ports: ["5000:5000"]
    volumes: [static-models:/app/models]
    
  dynamic-analysis:
    image: codeguard/dynamic-analysis:latest
    ports: ["3000:3000"]
    volumes: [dynamic-results:/app/results]

volumes:
  static-models:
  dynamic-results:
```

## Security Analysis Types

### Static Analysis
- Buffer overflows, memory leaks, use-after-free
- Integer overflows, null pointer dereferences
- CWE classification with severity assessment

### Dynamic Analysis
- Grey box concolic execution fuzzing
- AddressSanitizer, UndefinedBehaviorSanitizer, LeakSanitizer
- AFL++ and Eclipser integration

## Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Usage Guide](docs/USAGE.md)
- [API Documentation](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)

## Contributing

See [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- [GitHub Issues](https://github.com/hoda39/CodeGuard/issues)
- [Documentation](docs/)
- [Discussions](https://github.com/hoda39/CodeGuard/discussions)

---

**CodeGuard** - Empowering developers with advanced security analysis tools for safer C/C++ development.
