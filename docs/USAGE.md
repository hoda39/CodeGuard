# CodeGuard Usage Guide

This comprehensive guide covers how to use CodeGuard for both static and dynamic security analysis of C/C++ code. The guide assumes you have successfully installed CodeGuard and have basic familiarity with VS Code.

## Table of Contents

- [Getting Started](#getting-started)
- [Static Analysis Workflow](#static-analysis-workflow)
- [Dynamic Analysis Workflow](#dynamic-analysis-workflow)
- [Configuration Management](#configuration-management)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

Before using CodeGuard, ensure you have:

- **VS Code**: Version 1.69.0 or higher
- **Node.js**: Version 16.x or higher
- **Python**: Version 3.8+ (for local static analysis)
- **Docker**: Version 20.10+ (for containerized analysis)
- **C/C++ Compiler**: GCC/Clang with sanitizer support

### Initial Setup

1. **Open VS Code** and navigate to your C/C++ project
2. **Verify Extension Installation**: Check that CodeGuard appears in the Extensions panel
3. **Check Status**: Look for the CodeGuard status bar item showing "Ready"

### First Analysis

1. **Open a C/C++ file** (`.c`, `.cpp`, `.h`, `.hpp`)
2. **Static analysis begins automatically** - you'll see diagnostics appear in the Problems panel
3. **Run dynamic analysis** via Command Palette (`Ctrl+Shift+P` → "Run Fuzzing Analysis")

## Static Analysis Workflow

### Automatic Analysis

Static analysis runs automatically when you:

- **Open a C/C++ file**
- **Save changes** to a C/C++ file
- **Switch between files** in a C/C++ project

### Analysis Results

Static analysis results appear as:

- **Inline Diagnostics**: Red/yellow/green underlines in your code
- **Problems Panel**: Detailed list of all detected vulnerabilities
- **Hover Information**: Detailed vulnerability information on hover

### Example Static Analysis Session

```cpp
// Example vulnerable code
void vulnerable_function() {
    char* buffer = (char*)malloc(10);
    strcpy(buffer, "This string is too long for the buffer"); // CWE-119
    free(buffer);
    free(buffer); // CWE-415
}
```

**Expected Results**:
- Line 3: Red underline with CWE-119 (Buffer Overflow) - High Severity
- Line 5: Red underline with CWE-415 (Double Free) - Critical Severity
- Problems panel shows detailed descriptions and remediation suggestions

### Static Analysis Configuration

Configure static analysis behavior in VS Code settings:

```json
{
  "CodeGuard.static.inferenceMode": "Local",
  "CodeGuard.static.useCUDA": false,
  "CodeGuard.static.delayBeforeAnalysis": 1500,
  "CodeGuard.static.maxNumberOfLines": 1,
  "CodeGuard.static.highlightSeverityType": "Error"
}
```

**Configuration Options**:
- `inferenceMode`: "Local" (default) or "Remote"
- `useCUDA`: Enable GPU acceleration (requires CUDA-capable GPU)
- `delayBeforeAnalysis`: Delay in milliseconds before analysis starts
- `maxNumberOfLines`: Maximum lines to analyze at once
- `highlightSeverityType`: Minimum severity to highlight ("Error", "Warning", "Info")

## Dynamic Analysis Workflow

### Manual Analysis

Dynamic analysis requires manual initiation:

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Select "Run Fuzzing Analysis"**
3. **Wait for completion** (typically 1-5 minutes depending on code complexity)
4. **Review results** in the Output panel

### Grey Box Concolic Execution

The dynamic analysis uses advanced fuzzing techniques:

- **Concolic Execution**: Combines concrete and symbolic execution
- **Grey Box Fuzzing**: Uses coverage feedback to guide test generation
- **Sanitizer Integration**: Multiple sanitizers detect various vulnerability types

### Fuzzing Process

1. **Code Compilation**: Source code is compiled with sanitizer flags
2. **Test Case Generation**: Fuzzing engine generates initial test cases
3. **Concolic Execution**: Symbolic execution explores program paths
4. **Vulnerability Detection**: Sanitizers detect runtime vulnerabilities
5. **Result Aggregation**: All findings are collected and reported

### Example Dynamic Analysis Session

```cpp
// Target for fuzzing analysis
void fuzz_target(char* input, size_t length) {
    char buffer[100];
    if (length < 100) {
        memcpy(buffer, input, length); // Potential buffer overflow
    }
    // Process buffer...
}
```

**Analysis Process**:
1. Compile with AddressSanitizer and UndefinedBehaviorSanitizer
2. AFL++ generates test cases with varying input lengths
3. Concolic execution explores different code paths
4. Sanitizers detect buffer overflow when `length >= 100`
5. Results show vulnerability location and test case

### Dynamic Analysis Configuration

```json
{
  "CodeGuard.dynamic.apiUrl": "http://localhost:3000",
  "CodeGuard.dynamic.enableRealTimeAnalysis": true,
  "CodeGuard.dynamic.fuzzingTimeout": 300,
  "CodeGuard.dynamic.sanitizers": ["address", "undefined", "leak"],
  "CodeGuard.dynamic.fuzzerType": "aflplusplus"
}
```

**Configuration Options**:
- `apiUrl`: URL of the dynamic analysis API
- `enableRealTimeAnalysis`: Enable continuous monitoring
- `fuzzingTimeout`: Maximum analysis time in seconds
- `sanitizers`: Array of sanitizers to use
- `fuzzerType`: Fuzzing engine ("aflplusplus" or "eclipser")

## Containerized Analysis

### Using Containerized Analysis

CodeGuard supports containerized deployment for both static and dynamic analysis:

#### Container Configuration

```json
{
  "CodeGuard.containers.staticAnalysisUrl": "http://localhost:5000",
  "CodeGuard.containers.dynamicAnalysisUrl": "http://localhost:3000",
  "CodeGuard.containers.useContainers": true,
  "CodeGuard.containers.autoStart": true
}
```

#### Starting Containers

**Manual Start**:
```bash
# Start static analysis container
docker run -d -p 5000:5000 --name codeguard-static codeguard-static

# Start dynamic analysis container
docker run -d -p 3000:3000 --name codeguard-dynamic codeguard-dynamic
```

**Docker Compose** (Recommended):
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Container Health Checks

Monitor container status:

```bash
# Check container status
docker ps

# View container logs
docker logs codeguard-static
docker logs codeguard-dynamic

# Check API health
curl http://localhost:5000/health
curl http://localhost:3000/health
```

### Container Benefits

- **Isolation**: Analysis runs in isolated environments
- **Consistency**: Same environment across different machines
- **Scalability**: Easy to scale with multiple containers
- **Security**: Reduced attack surface through isolation

## Configuration Management

### VS Code Settings

Access CodeGuard settings:

1. **Open Settings** (`Ctrl+,`)
2. **Search for "CodeGuard"**
3. **Configure options** as needed

### Workspace Configuration

Create `.vscode/settings.json` in your project:

```json
{
  "CodeGuard.static.inferenceMode": "Remote",
  "CodeGuard.static.useCUDA": true,
  "CodeGuard.dynamic.fuzzingTimeout": 600,
  "CodeGuard.dynamic.sanitizers": ["address", "undefined", "leak", "thread"],
  "CodeGuard.containers.useContainers": true
}
```

### Environment Variables

Set environment variables for advanced configuration:

```bash
# Static analysis
export CODEGUARD_STATIC_URL=http://localhost:5000
export CODEGUARD_STATIC_CUDA=true

# Dynamic analysis
export CODEGUARD_DYNAMIC_URL=http://localhost:3000
export CODEGUARD_DYNAMIC_TIMEOUT=300

# Container settings
export CODEGUARD_USE_CONTAINERS=true
export CODEGUARD_AUTO_START=true
```

## Advanced Features

### Batch Analysis

Analyze multiple files simultaneously:

1. **Select multiple files** in the Explorer
2. **Right-click** and select "Run CodeGuard Analysis"
3. **View consolidated results** in the Problems panel

### Custom Analysis Rules

Define custom analysis parameters:

```json
{
  "CodeGuard.custom.rules": {
    "bufferOverflow": {
      "enabled": true,
      "severity": "High",
      "threshold": 0.8
    },
    "memoryLeak": {
      "enabled": true,
      "severity": "Medium",
      "threshold": 0.6
    }
  }
}
```

### Integration with Build Systems

Integrate CodeGuard with your build system:

#### CMake Integration

```cmake
# CMakeLists.txt
find_package(CodeGuard REQUIRED)

# Add sanitizer flags
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fsanitize=address,undefined")

# Enable CodeGuard analysis
codeguard_enable_analysis(${TARGET_NAME})
```

#### Makefile Integration

```makefile
# Makefile
CXXFLAGS += -fsanitize=address,undefined
LDFLAGS += -fsanitize=address,undefined

# CodeGuard analysis target
analyze:
	codeguard-analyze $(SOURCES)
```

### CI/CD Integration

Integrate CodeGuard into your CI/CD pipeline:

#### GitHub Actions

```yaml
# .github/workflows/codeguard.yml
name: CodeGuard Analysis

on: [push, pull_request]

jobs:
  static-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Static Analysis
        run: |
          docker run --rm -v ${{ github.workspace }}:/code codeguard-static

  dynamic-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Dynamic Analysis
        run: |
          docker run --rm -v ${{ github.workspace }}:/code codeguard-dynamic
```

#### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - security

codeguard-analysis:
  stage: security
  image: codeguard-dynamic
  script:
    - codeguard-analyze --static
    - codeguard-analyze --dynamic
  artifacts:
    reports:
      security: codeguard-report.json
```

## Best Practices

### Development Workflow

1. **Enable Real-time Analysis**: Keep static analysis running during development
2. **Regular Dynamic Analysis**: Run fuzzing analysis before commits
3. **Review All Findings**: Don't ignore warnings or low-severity issues
4. **Fix Issues Early**: Address vulnerabilities as soon as they're detected

### Code Organization

1. **Separate Concerns**: Keep vulnerable code isolated
2. **Clear Interfaces**: Define clear boundaries between components
3. **Documentation**: Document security-critical code sections
4. **Testing**: Write tests for security-critical functions

### Performance Optimization

1. **Incremental Analysis**: Only analyze changed files
2. **Parallel Processing**: Use multiple cores for analysis
3. **Caching**: Enable result caching for faster subsequent runs
4. **Resource Limits**: Set appropriate timeouts and memory limits

### Security Considerations

1. **Input Validation**: Always validate external inputs
2. **Memory Management**: Use smart pointers and RAII
3. **Error Handling**: Implement proper error handling
4. **Least Privilege**: Follow principle of least privilege

## Troubleshooting

### Common Issues

#### Static Analysis Not Working

**Symptoms**: No diagnostics appear, status shows "Error"

**Solutions**:
1. Check Python installation: `python --version`
2. Verify model files are present
3. Check VS Code console for error messages
4. Restart VS Code

#### Dynamic Analysis Fails

**Symptoms**: Fuzzing analysis fails to start or complete

**Solutions**:
1. Check Docker containers are running
2. Verify API endpoints are accessible
3. Check compiler supports sanitizers
4. Review container logs for errors

#### Container Issues

**Symptoms**: Containers fail to start or analysis fails

**Solutions**:
1. Check Docker is running: `docker ps`
2. Verify ports are available: `netstat -an | grep 3000`
3. Check container logs: `docker logs container-name`
4. Restart containers: `docker-compose restart`

### Performance Issues

#### Slow Analysis

**Causes**: Large files, complex code, resource constraints

**Solutions**:
1. Increase analysis timeout
2. Use remote inference mode
3. Enable CUDA acceleration
4. Optimize code structure

#### Memory Issues

**Causes**: Large codebases, memory leaks in analysis

**Solutions**:
1. Increase container memory limits
2. Use incremental analysis
3. Restart containers periodically
4. Monitor memory usage

### Debugging

#### Enable Debug Logging

```json
{
  "CodeGuard.debug.enabled": true,
  "CodeGuard.debug.level": "debug",
  "CodeGuard.debug.outputChannel": "CodeGuard Debug"
}
```

#### View Debug Information

1. **Open Output Panel** (`Ctrl+Shift+U`)
2. **Select "CodeGuard Debug"** from dropdown
3. **Review debug messages** for troubleshooting

#### Common Debug Commands

```bash
# Check extension status
code --list-extensions | grep codeguard

# View extension logs
code --verbose

# Test API endpoints
curl -X GET http://localhost:5000/health
curl -X GET http://localhost:3000/health
```

### Getting Help

1. **Check Documentation**: Review this guide and other docs
2. **Search Issues**: Look for similar issues on GitHub
3. **Enable Debug Logging**: Gather detailed error information
4. **Report Issues**: Create detailed bug reports with logs

### Support Resources

- **Documentation**: [docs/](docs/)
- **GitHub Issues**: [Report Issues](https://github.com/hoda39/CodeGuard/issues)
- **Discussions**: [Community Forum](https://github.com/hoda39/CodeGuard/discussions)
- **Security**: [Security Policy](SECURITY.md)

## Conclusion

CodeGuard provides comprehensive security analysis for C/C++ code through both static and dynamic analysis techniques. By following this usage guide, you can effectively integrate CodeGuard into your development workflow and improve the security of your codebase.

Remember to:
- Keep the extension updated
- Review analysis results regularly
- Follow security best practices
- Report issues and contribute improvements

For advanced usage and customization, refer to the [API Documentation](API.md) and [Architecture Documentation](ARCHITECTURE.md). 