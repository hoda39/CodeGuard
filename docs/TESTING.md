# CodeGuard Testing Guide

This guide provides comprehensive instructions for testing the CodeGuard extension, including unit tests, integration tests, and manual testing procedures.

## Table of Contents
1. [Testing Overview](#testing-overview)
2. [Automated Testing](#automated-testing)
3. [Manual Testing](#manual-testing)
4. [Test Data](#test-data)
5. [Performance Testing](#performance-testing)
6. [Docker Testing](#docker-testing)
7. [UI Testing](#ui-testing)
8. [Troubleshooting Tests](#troubleshooting-tests)

## Testing Overview

CodeGuard uses a multi-layered testing approach to ensure reliability and quality:

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete workflows
- **Performance Tests**: Test performance and resource usage
- **UI Tests**: Test user interface components

## Automated Testing

### Running Tests

#### All Tests
```bash
npm test
```

#### Specific Test Suites
```bash
# Unit tests only
npm test -- --testPathPattern="unit"

# Integration tests only
npm test -- --testPathPattern="integration"

# Performance tests only
npm test -- --testPathPattern="performance"

# UI tests only
npm test -- --testPathPattern="ui"
```

#### Watch Mode
```bash
npm run test:watch
```

#### Coverage Report
```bash
npm run test:coverage
```

### Test Structure

```
src/test/
├── unit/                    # Unit tests
│   ├── analysis-manager.test.ts
│   ├── config-manager.test.ts
│   └── docker-runner.test.ts
├── integration/             # Integration tests
│   ├── analysis-workflow.test.ts
│   └── docker-integration.test.ts
├── performance/             # Performance tests
│   └── performance.test.ts
├── end-to-end/              # End-to-end tests
│   └── extension.test.ts
├── ui/                      # UI tests
│   └── ui-components.test.ts
└── setup.ts                 # Test setup
```

### Unit Tests

#### Analysis Manager Tests
```typescript
describe('AnalysisManager', () => {
  let analysisManager: AnalysisManager;
  let mockConfigManager: jest.Mocked<ConfigManager>;
  let mockDiagnosticManager: jest.Mocked<DiagnosticManager>;

  beforeEach(() => {
    mockConfigManager = createMockConfigManager();
    mockDiagnosticManager = createMockDiagnosticManager();
    analysisManager = new AnalysisManager(
      mockConfigManager,
      mockDiagnosticManager,
      mockOutputManager,
      mockProgressManager
    );
  });

  test('should run static analysis successfully', async () => {
    const result = await analysisManager.runAnalysis('static', mockWorkspace, ['test.c']);
    expect(result.success).toBe(true);
    expect(result.staticResults).toBeDefined();
  });

  test('should handle analysis cancellation', async () => {
    const analysisPromise = analysisManager.runAnalysis('static', mockWorkspace, ['test.c']);
    await analysisManager.cancelAnalysis();
    const result = await analysisPromise;
    expect(result.success).toBe(false);
  });
});
```

#### Config Manager Tests
```typescript
describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager();
  });

  test('should load default configuration', () => {
    const config = configManager.getConfig();
    expect(config.ui.showProgressNotifications).toBe(true);
    expect(config.ui.showStatusBar).toBe(true);
  });

  test('should update configuration', () => {
    configManager.updateConfig({
      ui: { showProgressNotifications: false }
    });
    const config = configManager.getConfig();
    expect(config.ui.showProgressNotifications).toBe(false);
  });
});
```

### Integration Tests

#### Analysis Workflow Tests
```typescript
describe('Analysis Workflow', () => {
  test('should complete full analysis workflow', async () => {
    // Setup test workspace
    const workspace = createTestWorkspace();
    const testFile = createTestFile('vulnerable.c');

    // Run analysis
    const result = await runAnalysisWorkflow(workspace, [testFile]);

    // Verify results
    expect(result.success).toBe(true);
    expect(result.staticResults.vulnerabilities).toHaveLength(2);
    expect(result.dynamicResults.memoryLeaks).toHaveLength(1);
  });

  test('should handle concurrent analysis', async () => {
    const workspace = createTestWorkspace();
    const files = ['file1.c', 'file2.c', 'file3.c'];

    const promises = files.map(file => 
      runAnalysisWorkflow(workspace, [file])
    );

    const results = await Promise.all(promises);
    expect(results.every(r => r.success)).toBe(true);
  });
});
```

#### Docker Integration Tests
```typescript
describe('Docker Integration', () => {
  test('should build and run static analysis container', async () => {
    const dockerRunner = new DockerRunner();
    const result = await dockerRunner.runStaticAnalysis(
      '/test/workspace',
      ['test.c']
    );
    expect(result.vulnerabilities).toBeDefined();
  });

  test('should handle container failures gracefully', async () => {
    const dockerRunner = new DockerRunner();
    await expect(
      dockerRunner.runStaticAnalysis('/invalid/path', ['nonexistent.c'])
    ).rejects.toThrow();
  });
});
```

### Performance Tests

#### Analysis Performance
```typescript
describe('Performance Tests', () => {
  test('should complete analysis within time limits', async () => {
    const startTime = Date.now();
    const result = await runAnalysisWorkflow(largeWorkspace, largeFiles);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(300000); // 5 minutes
    expect(result.success).toBe(true);
  });

  test('should handle memory usage efficiently', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    await runAnalysisWorkflow(workspace, files);
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB
  });
});
```

## Manual Testing

### Prerequisites for Manual Testing

1. **VS Code Installation**: Latest version (1.96.0+)
2. **Docker Desktop**: Running and accessible
3. **Test Files**: Sample C/C++ files with known vulnerabilities
4. **Extension**: Compiled and installed

### Test Scenarios

#### Scenario 1: Basic Static Analysis
1. **Setup**:
   - Open VS Code
   - Create a new workspace
   - Add a C file with known vulnerabilities

2. **Test Steps**:
   - Open the C file
   - Press `Ctrl+Shift+S` to run static analysis
   - Wait for analysis to complete
   - Check output panel for results
   - Verify diagnostics appear in Problems panel

3. **Expected Results**:
   - Analysis completes successfully
   - Vulnerabilities are detected
   - Results are displayed in output
   - Diagnostics show in Problems panel

#### Scenario 2: Basic Dynamic Analysis
1. **Setup**:
   - Use the same workspace as Scenario 1
   - Ensure the C file can be compiled

2. **Test Steps**:
   - Press `Ctrl+Shift+D` to run dynamic analysis
   - Wait for analysis to complete
   - Check for memory leaks and runtime issues

3. **Expected Results**:
   - Analysis completes successfully
   - Memory leaks are detected (if any)
   - Runtime issues are reported
   - Performance metrics are shown

#### Scenario 3: Combined Analysis
1. **Setup**:
   - Use a complex C/C++ project

2. **Test Steps**:
   - Press `Ctrl+Shift+A` to run combined analysis
   - Monitor progress in status bar
   - Wait for both analyses to complete

3. **Expected Results**:
   - Both static and dynamic analysis run
   - Progress is shown in real-time
   - Combined results are displayed
   - All vulnerabilities are reported

#### Scenario 4: Analysis Cancellation
1. **Setup**:
   - Use a large project for longer analysis time

2. **Test Steps**:
   - Start analysis with `Ctrl+Shift+A`
   - Press `Ctrl+Shift+X` to cancel
   - Wait for cancellation to complete

3. **Expected Results**:
   - Analysis stops gracefully
   - No partial results are shown
   - Status returns to "Ready"
   - No error messages

#### Scenario 5: Error Handling
1. **Setup**:
   - Create a file with syntax errors
   - Or temporarily disable Docker

2. **Test Steps**:
   - Try to run analysis on invalid file
   - Check error messages and handling

3. **Expected Results**:
   - Clear error messages
   - Graceful error handling
   - No crashes or hangs
   - Helpful troubleshooting information

### UI Testing

#### Test UI Components Command
1. **Setup**:
   - Open VS Code with CodeGuard extension

2. **Test Steps**:
   - Press `Ctrl+Shift+P`
   - Run "CodeGuard: Test UI Components"
   - Observe all UI elements

3. **Expected Results**:
   - All UI components display correctly
   - Progress bars work
   - Status bar updates
   - Output panel functions
   - No visual glitches

#### Keyboard Shortcuts
1. **Test all shortcuts**:
   - `Ctrl+Shift+A`: Run security analysis
   - `Ctrl+Shift+S`: Run static analysis
   - `Ctrl+Shift+D`: Run dynamic analysis
   - `Ctrl+Shift+X`: Cancel analysis

2. **Expected Results**:
   - All shortcuts work correctly
   - Commands execute as expected
   - No conflicts with VS Code shortcuts

## Test Data

### Sample Vulnerable Code

#### Buffer Overflow
```c
#include <stdio.h>
#include <string.h>

int main() {
    char buffer[10];
    char input[20];
    
    printf("Enter text: ");
    gets(input); // Vulnerable function
    
    strcpy(buffer, input); // Potential buffer overflow
    
    printf("You entered: %s\n", buffer);
    return 0;
}
```

#### Memory Leak
```c
#include <stdlib.h>
#include <string.h>

char* create_string(const char* input) {
    char* result = malloc(strlen(input));
    strcpy(result, input);
    return result;
}

int main() {
    char* str = create_string("Hello, World!");
    printf("%s\n", str);
    // Missing free(str) - memory leak
    return 0;
}
```

#### Use After Free
```c
#include <stdlib.h>

int main() {
    int* ptr = malloc(sizeof(int));
    *ptr = 42;
    
    free(ptr);
    
    *ptr = 100; // Use after free
    
    return 0;
}
```

### Test Workspace Structure
```
test-workspace/
├── src/
│   ├── vulnerable.c
│   ├── memory_leak.c
│   └── use_after_free.c
├── include/
│   └── utils.h
├── build/
└── .vscode/
    └── settings.json
```

## Performance Testing

### Performance Benchmarks

#### Analysis Time Limits
- **Small file (< 100 lines)**: < 30 seconds
- **Medium file (100-500 lines)**: < 2 minutes
- **Large file (500+ lines)**: < 5 minutes

#### Memory Usage Limits
- **Peak memory usage**: < 500MB
- **Memory leak**: < 10MB per analysis
- **Container memory**: < 1GB per container

#### Resource Usage
- **CPU usage**: < 80% during analysis
- **Disk I/O**: < 100MB/s
- **Network usage**: < 10MB per analysis

### Performance Test Scripts

#### Load Testing
```bash
# Test multiple concurrent analyses
for i in {1..5}; do
  codeguard run-analysis --file test$i.c &
done
wait
```

#### Memory Testing
```bash
# Monitor memory usage during analysis
node --max-old-space-size=512 test/performance/memory-test.js
```

## Docker Testing

### Container Testing

#### Build Test
```bash
# Test container builds
docker build -t codeguard-static ./StaticAnalysis
docker build -t codeguard-dynamic ./DynamicAnalysis
```

#### Run Test
```bash
# Test container execution
docker run --rm -v $(pwd):/workspace codeguard-static
docker run --rm -v $(pwd):/workspace codeguard-dynamic
```

#### Resource Test
```bash
# Test resource limits
docker run --rm --memory=512m --cpus=1 -v $(pwd):/workspace codeguard-static
```

### Docker Health Checks

#### Container Health
```bash
# Check container status
docker ps -a --filter "name=codeguard"

# Check container logs
docker logs codeguard-static
docker logs codeguard-dynamic
```

#### Volume Mounting
```bash
# Test volume mounting
docker run --rm -v /host/path:/container/path codeguard-static ls /container/path
```

## Troubleshooting Tests

### Common Test Issues

#### Docker Not Available
**Problem**: Tests fail with "Docker not available"
**Solution**:
1. Ensure Docker Desktop is running
2. Check Docker service: `docker info`
3. Restart Docker if needed

#### Permission Issues
**Problem**: Tests fail with permission errors
**Solution**:
1. Check file permissions
2. Run tests with appropriate permissions
3. Use sudo if necessary (Linux/macOS)

#### Memory Issues
**Problem**: Tests fail with out of memory
**Solution**:
1. Increase Node.js memory limit: `node --max-old-space-size=2048`
2. Close other applications
3. Restart Docker Desktop

#### Timeout Issues
**Problem**: Tests timeout
**Solution**:
1. Increase Jest timeout in configuration
2. Check system performance
3. Reduce test complexity

### Debug Mode

#### Enable Debug Logging
```typescript
// In test setup
process.env.DEBUG = 'codeguard:*';
```

#### Verbose Test Output
```bash
npm test -- --verbose
```

#### Test Debugging
```bash
# Debug specific test
npm test -- --testNamePattern="Analysis Manager" --verbose
```

This testing guide provides comprehensive coverage for ensuring the CodeGuard extension works correctly and reliably. Regular testing helps maintain quality and catch issues early in development. 