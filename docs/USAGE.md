# CodeGuard Usage Guide

This guide provides detailed instructions for using the CodeGuard extension effectively.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Running Analysis](#running-analysis)
3. [Understanding Results](#understanding-results)
4. [Applying Fixes](#applying-fixes)
5. [Advanced Features](#advanced-features)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites Check
Before using CodeGuard, ensure you have:
- ✅ VS Code 1.96.0 or higher
- ✅ Docker Desktop installed and running
- ✅ A C/C++ project open in VS Code
- ✅ At least one .c or .cpp file in your workspace

### First Run
1. **Open a C/C++ file** in your project
2. **Activate the extension** - it should activate automatically for C/C++ files
3. **Check the status bar** - you should see "CodeGuard Ready" when the extension is active

## Running Analysis

### Method 1: Command Palette
1. Press `Ctrl+Shift+P` to open the command palette
2. Type "CodeGuard" to see available commands
3. Select one of the following:
   - `CodeGuard: Run Security Analysis` (Combined)
   - `CodeGuard: Run Static Analysis` (Static only)
   - `CodeGuard: Run Dynamic Analysis` (Dynamic only)

### Method 2: Keyboard Shortcuts
- `Ctrl+Shift+A` - Run combined security analysis
- `Ctrl+Shift+S` - Run static analysis only
- `Ctrl+Shift+D` - Run dynamic analysis only
- `Ctrl+Shift+X` - Cancel running analysis

### Method 3: Context Menu
1. Right-click in a C/C++ file editor
2. Select "Run Security Analysis" from the context menu

### Analysis Types Explained

#### 🔍 Static Analysis
**What it does**: Analyzes your code without executing it using AI-powered models
**Best for**: 
- Early vulnerability detection
- Code review assistance
- Security compliance checking
**Duration**: 30 seconds to 2 minutes (depending on file size)

#### 🧪 Dynamic Analysis
**What it does**: Runs your code in a controlled Docker environment to detect runtime issues
**Best for**:
- Memory leak detection
- Runtime vulnerability discovery
- Performance analysis
**Duration**: 1-5 minutes (depending on code complexity)

#### 🔄 Combined Analysis
**What it does**: Runs both static and dynamic analysis concurrently
**Best for**:
- Comprehensive security assessment
- Complete vulnerability scanning
- Production-ready code validation
**Duration**: 2-7 minutes (depending on code size and complexity)

## Understanding Results

### Progress Tracking
During analysis, you'll see:
- **Progress bar** in the notification area
- **Status updates** in the status bar
- **Real-time logs** in the Output panel

### Results Display

#### Output Panel
The main results appear in the CodeGuard Output panel:
1. Open the Output panel (`View > Output`)
2. Select "CodeGuard" from the dropdown
3. Review the analysis results

#### Problems Panel
Individual issues appear in the Problems panel:
1. Open the Problems panel (`View > Problems`)
2. Click on any issue to navigate to the specific line
3. Hover over issues for detailed descriptions

#### Diagnostic Information
Each issue includes:
- **Severity Level**: Critical, High, Medium, Low, Info
- **CWE Classification**: Common Weakness Enumeration category
- **File Location**: Exact file and line number
- **Description**: Detailed explanation of the vulnerability
- **Fix Suggestion**: Recommended code changes

### Result Categories

#### Critical Issues
- **Color**: Red
- **Action Required**: Immediate attention
- **Examples**: Buffer overflows, SQL injection, command injection

#### High Issues
- **Color**: Orange
- **Action Required**: High priority fixes
- **Examples**: Memory leaks, use-after-free, integer overflows

#### Medium Issues
- **Color**: Yellow
- **Action Required**: Should be addressed
- **Examples**: Weak cryptography, improper input validation

#### Low Issues
- **Color**: Blue
- **Action Required**: Best practice improvements
- **Examples**: Missing error handling, deprecated functions

#### Info Messages
- **Color**: Green
- **Action Required**: Informational only
- **Examples**: Code style suggestions, performance hints

## Applying Fixes

### Automatic Fixes
CodeGuard provides automatic fix suggestions for many issues:

1. **Navigate to the issue** in the Problems panel
2. **Click the lightbulb icon** (Code Action) next to the issue
3. **Select the fix** from the available options
4. **Review the changes** before applying
5. **Apply the fix** to your code

### Manual Fixes
For complex issues, manual fixes are required:

1. **Read the description** carefully
2. **Follow the suggested approach** in the description
3. **Test your changes** thoroughly
4. **Re-run analysis** to verify the fix

### Common Fix Patterns

#### Buffer Overflow Fixes
```c
// Before (vulnerable)
char buffer[10];
strcpy(buffer, user_input); // Potential overflow

// After (safe)
char buffer[10];
strncpy(buffer, user_input, sizeof(buffer) - 1);
buffer[sizeof(buffer) - 1] = '\0';
```

#### Memory Leak Fixes
```c
// Before (leaky)
void process_data() {
    char* data = malloc(100);
    // ... use data ...
    // Missing free(data)
}

// After (fixed)
void process_data() {
    char* data = malloc(100);
    if (data == NULL) return;
    
    // ... use data ...
    
    free(data); // Proper cleanup
}
```

#### Input Validation Fixes
```c
// Before (unsafe)
int value = atoi(user_input);

// After (safe)
char* endptr;
int value = strtol(user_input, &endptr, 10);
if (*endptr != '\0' || errno == ERANGE) {
    // Handle invalid input
    return ERROR_INVALID_INPUT;
}
```

## Advanced Features

### Configuration Options
Customize CodeGuard behavior in VS Code settings:

```json
{
  "codeguard.ui.showProgressNotifications": true,
  "codeguard.ui.showStatusBar": true,
  "codeguard.ui.autoShowOutput": true,
  "codeguard.ui.progressLocation": "notification"
}
```

### Performance Monitoring
Monitor analysis performance:
1. Run `CodeGuard: Show Performance Report` from command palette
2. Review execution times and resource usage
3. Optimize your analysis workflow

### UI Testing
Test UI components:
1. Run `CodeGuard: Test UI Components` from command palette
2. Verify all UI elements work correctly
3. Report any issues found

### Canceling Analysis
To cancel a running analysis:
1. Press `Ctrl+Shift+X`
2. Or use the cancel button in the progress notification
3. Wait for the cancellation to complete

## Troubleshooting

### Analysis Won't Start
**Symptoms**: Commands don't work, no response
**Solutions**:
1. Check if a C/C++ file is open
2. Verify Docker is running: `docker info`
3. Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
4. Check Output panel for error messages

### Analysis Fails
**Symptoms**: Analysis starts but fails with errors
**Solutions**:
1. Check Docker logs: `docker logs <container-id>`
2. Verify file permissions
3. Ensure sufficient disk space
4. Check network connectivity for Docker

### Slow Performance
**Symptoms**: Analysis takes too long
**Solutions**:
1. Close unnecessary applications
2. Increase Docker memory limit
3. Run analysis on smaller files first
4. Check system resource usage

### Memory Issues
**Symptoms**: "Out of memory" errors
**Solutions**:
1. Restart Docker Desktop
2. Increase Docker memory allocation
3. Close other memory-intensive applications
4. Check available system memory

### False Positives
**Symptoms**: Incorrect vulnerability reports
**Solutions**:
1. Review the issue description carefully
2. Check if it's a known limitation
3. Report false positives via GitHub issues
4. Consider context-specific analysis

### Getting Help
If you encounter issues:
1. Check this documentation first
2. Search existing GitHub issues
3. Create a new issue with:
   - VS Code version
   - CodeGuard version
   - Error messages
   - Steps to reproduce
   - Sample code (if applicable)

## Best Practices

### Before Analysis
1. **Save all files** before running analysis
2. **Close unnecessary tabs** to free memory
3. **Ensure Docker is running** and has sufficient resources
4. **Start with small files** to test the setup

### During Analysis
1. **Don't interrupt** the analysis process
2. **Monitor progress** through the UI
3. **Keep VS Code open** during analysis
4. **Avoid heavy system operations**

### After Analysis
1. **Review all results** carefully
2. **Prioritize fixes** by severity
3. **Test fixes** before committing
4. **Re-run analysis** to verify fixes

### Regular Maintenance
1. **Update the extension** regularly
2. **Keep Docker updated**
3. **Clean up old containers**: `docker system prune`
4. **Monitor disk space** usage

## Examples

### Example 1: Simple C Program
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

**Analysis Results**:
- Critical: Use of `gets()` function (CWE-242)
- High: Potential buffer overflow in `strcpy()` (CWE-787)
- Medium: Missing input validation

### Example 2: Memory Management
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
    // Missing free(str)
    return 0;
}
```

**Analysis Results**:
- High: Memory leak in `main()` function
- Medium: Potential buffer overflow in `create_string()`
- Info: Consider using safer string functions

This guide should help you get the most out of CodeGuard. For additional support, please refer to the main README or create an issue on GitHub. 