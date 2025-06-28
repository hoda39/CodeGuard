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
