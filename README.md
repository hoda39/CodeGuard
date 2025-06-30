# CodeGuard - Unified Security Analysis Extension

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://marketplace.visualstudio.com/items?itemName=CodeGuard.codeguard)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.96.0+-green.svg)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

CodeGuard is a comprehensive VS Code extension that combines static and dynamic security analysis for C/C++ code. It runs analysis inside Docker containers for isolation and provides real-time vulnerability detection with actionable fixes.

## 🚀 Features

### 🔍 Static Analysis
- **AI-Powered Vulnerability Detection**: Uses machine learning models to identify security vulnerabilities
- **CWE Classification**: Maps vulnerabilities to Common Weakness Enumeration (CWE) categories
- **Severity Assessment**: Provides severity levels for detected vulnerabilities
- **Line-level Analysis**: Pinpoints exact locations of security issues

### 🧪 Dynamic Analysis
- **Memory Leak Detection**: Identifies memory leaks and resource management issues
- **Runtime Analysis**: Performs analysis during code execution
- **CASR Integration**: Uses Crash Analysis and Symbolic Resolution for comprehensive testing
- **Performance Monitoring**: Tracks execution performance and resource usage

### 🐳 Containerized Execution
- **Docker Isolation**: All analysis runs in isolated Docker containers
- **Environment Consistency**: Ensures reproducible results across different systems
- **Resource Management**: Controlled resource allocation for analysis processes

### 🎯 Unified Interface
- **Single Extension**: One extension for both static and dynamic analysis
- **Progress Tracking**: Real-time progress updates with cancellable operations
- **Results Aggregation**: Combined results from both analysis types
- **Intelligent Fixes**: Automatic vulnerability fix suggestions

## 📋 Prerequisites

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux
- **VS Code**: Version 1.96.0 or higher
- **Node.js**: Version 16.0.0 or higher
- **Docker**: Version 20.10.0 or higher with Docker Compose

### Docker Setup
1. **Install Docker Desktop**:
   - [Windows](https://docs.docker.com/desktop/install/windows/)
   - [macOS](https://docs.docker.com/desktop/install/mac/)
   - [Linux](https://docs.docker.com/desktop/install/linux/)

2. **Verify Installation**:
   ```bash
   docker --version
   docker-compose --version
   ```

3. **Start Docker Service**:
   - Ensure Docker Desktop is running
   - Docker daemon should be accessible

## 🛠️ Installation

### Method 1: VSIX Package (Recommended)
1. Download the latest `.vsix` file from [Releases](https://github.com/your-repo/codeguard/releases)
2. In VS Code, go to **Extensions** (Ctrl+Shift+X)
3. Click the **...** menu and select **Install from VSIX...**
4. Choose the downloaded `.vsix` file
5. Reload VS Code when prompted

### Method 2: From Source
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/codeguard.git
   cd codeguard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Compile the extension**:
   ```bash
   npm run compile
   ```

4. **Package the extension**:
   ```bash
   npm install -g vsce
   vsce package
   ```

5. **Install the generated .vsix file** in VS Code

## 🎮 Usage

### Quick Start
1. **Open a C/C++ project** in VS Code
2. **Open a .c or .cpp file**
3. **Run Analysis** using one of these methods:
   - **Command Palette**: `Ctrl+Shift+P` → "CodeGuard: Run Security Analysis"
   - **Keyboard Shortcut**: `Ctrl+Shift+A`
   - **Context Menu**: Right-click in editor → "Run Security Analysis"

### Analysis Types

#### 🔍 Static Analysis
- **Command**: `Ctrl+Shift+S` or "CodeGuard: Run Static Analysis"
- **What it does**: Analyzes code without execution using AI models
- **Best for**: Early detection of security vulnerabilities
- **Output**: Vulnerability list with CWE classifications and severity levels

#### 🧪 Dynamic Analysis
- **Command**: `Ctrl+Shift+D` or "CodeGuard: Run Dynamic Analysis"
- **What it does**: Runs code in controlled environment to detect runtime issues
- **Best for**: Memory leaks, runtime vulnerabilities, and execution issues
- **Output**: Runtime analysis results with memory usage and crash reports

#### 🔄 Combined Analysis
- **Command**: `Ctrl+Shift+A` or "CodeGuard: Run Security Analysis"
- **What it does**: Runs both static and dynamic analysis concurrently
- **Best for**: Comprehensive security assessment
- **Output**: Aggregated results from both analysis types

### Analysis Workflow

1. **Select Analysis Type**:
   - Choose from Static, Dynamic, or Combined analysis
   - The extension will prompt for your choice

2. **Monitor Progress**:
   - Progress bar shows analysis status
   - Status bar displays current operation
   - Notifications provide updates

3. **Review Results**:
   - Results appear in the Output panel
   - Diagnostics show in the Problems panel
   - Click on issues to navigate to code locations

4. **Apply Fixes**:
   - Use Code Actions (lightbulb icon) for automatic fixes
   - Review suggested changes before applying
   - Manual fixes available for complex issues

### Keyboard Shortcuts

| Command | Shortcut | Description |
|---------|----------|-------------|
| Run Security Analysis | `Ctrl+Shift+A` | Run combined static and dynamic analysis |
| Run Static Analysis | `Ctrl+Shift+S` | Run static analysis only |
| Run Dynamic Analysis | `Ctrl+Shift+D` | Run dynamic analysis only |
| Cancel Analysis | `Ctrl+Shift+X` | Cancel running analysis |
| Test UI Components | `Ctrl+Shift+T` | Test UI functionality |
| Show Performance Report | `Ctrl+Shift+P` | Display performance metrics |

## ⚙️ Configuration

### Extension Settings
Open VS Code Settings (`Ctrl+,`) and search for "CodeGuard":

```json
{
  "codeguard.ui.showProgressNotifications": true,
  "codeguard.ui.showStatusBar": true,
  "codeguard.ui.autoShowOutput": true,
  "codeguard.ui.progressLocation": "notification"
}
```

### Docker Configuration
The extension uses Docker containers for analysis. Ensure:
- Docker Desktop is running
- Sufficient disk space (at least 2GB free)
- Memory allocation (at least 4GB recommended)

## 📊 Understanding Results

### Static Analysis Results
- **Vulnerability Type**: CWE classification (e.g., CWE-787, CWE-125)
- **Severity**: Critical, High, Medium, Low
- **Location**: File path and line number
- **Description**: Detailed explanation of the vulnerability
- **Fix Suggestion**: Recommended code changes

### Dynamic Analysis Results
- **Memory Leaks**: Detected memory allocation issues
- **Crash Reports**: CASR analysis results
- **Performance Metrics**: Execution time and resource usage
- **Runtime Errors**: Issues discovered during execution

### Result Categories
- **Critical**: Immediate security risks requiring urgent attention
- **High**: Significant security vulnerabilities
- **Medium**: Moderate security concerns
- **Low**: Minor issues or best practice violations
- **Info**: Informational messages and suggestions

## 🏗️ Architecture

### Project Structure
```
CodeGuard_project/
├── src/
│   ├── analysis/          # Analysis orchestration
│   ├── static/            # Static analysis logic
│   ├── dynamic/           # Dynamic analysis logic
│   ├── shared/            # Shared utilities
│   ├── ui/                # User interface components
│   ├── config/            # Configuration management
│   └── diagnostics/       # Diagnostic handling
├── resources/             # Extension resources
├── StaticAnalysis/        # Static analysis Docker setup
├── DynamicAnalysis/       # Dynamic analysis Docker setup
└── docs/                  # Documentation
```

### Key Components
- **Analysis Manager**: Orchestrates analysis execution
- **Docker Runner**: Manages containerized analysis
- **Diagnostic Manager**: Handles result display
- **Config Manager**: Manages extension settings
- **UI Components**: Progress tracking and status display

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm test -- --testNamePattern="Analysis"
```

### Test Structure
- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end workflow testing
- **Performance Tests**: Performance and resource usage testing
- **UI Tests**: User interface component testing

## 🐛 Troubleshooting

### Common Issues

#### Docker Not Running
**Problem**: "Docker is not available" error
**Solution**:
1. Ensure Docker Desktop is installed and running
2. Check Docker service status: `docker info`
3. Restart Docker Desktop if needed

#### Analysis Fails to Start
**Problem**: Analysis commands don't work
**Solution**:
1. Check if a C/C++ file is open
2. Verify extension is activated
3. Check Output panel for error messages
4. Reload VS Code window

#### Slow Analysis Performance
**Problem**: Analysis takes too long
**Solution**:
1. Check Docker resource allocation
2. Close unnecessary applications
3. Ensure sufficient disk space
4. Consider running analysis on smaller files first

#### Memory Issues
**Problem**: "Out of memory" errors
**Solution**:
1. Increase Docker memory limit
2. Close other applications
3. Restart Docker Desktop
4. Check system memory usage

### Debug Mode
Enable debug logging:
1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "Developer: Toggle Developer Tools"
3. Check Console tab for detailed logs

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/your-repo/codeguard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/codeguard/discussions)
- **Documentation**: [Wiki](https://github.com/your-repo/codeguard/wiki)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Compile: `npm run compile`
5. Run tests: `npm test`
6. Make your changes
7. Submit a pull request

### Code Style
- Follow TypeScript best practices
- Use ESLint for code linting
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Static Analysis**: Based on machine learning models for vulnerability detection
- **Dynamic Analysis**: Integrates CASR for crash analysis and symbolic resolution
- **Docker Integration**: Containerized execution for isolation and consistency
- **VS Code Extension API**: Built on the VS Code extension framework

## 📈 Roadmap

### Version 1.1.0 (Planned)
- [ ] Support for additional programming languages
- [ ] Custom rule configuration
- [ ] Integration with CI/CD pipelines
- [ ] Advanced fix suggestions

### Version 1.2.0 (Planned)
- [ ] Real-time analysis during editing
- [ ] Team collaboration features
- [ ] Advanced reporting and analytics
- [ ] Plugin architecture for custom analyzers

## 📞 Support

- **Email**: support@codeguard.dev
- **GitHub**: [Issues](https://github.com/your-repo/codeguard/issues)
- **Documentation**: [Wiki](https://github.com/your-repo/codeguard/wiki)

---

**Made with ❤️ for the developer community**
