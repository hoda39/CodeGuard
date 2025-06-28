# Contributing to CodeGuard

Thank you for your interest in contributing to CodeGuard! This document provides guidelines and information for contributors to help make the contribution process smooth and effective.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Documentation](#documentation)
- [Security](#security)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Before You Start

1. **Read the Documentation**: Familiarize yourself with the project by reading the [README](README.md) and other documentation in the `docs/` folder.

2. **Check Existing Issues**: Look through existing [issues](https://github.com/hoda39/CodeGuard/issues) to see if your contribution has already been discussed or is in progress.

3. **Join the Community**: Participate in [discussions](https://github.com/hoda39/CodeGuard/discussions) to understand the project direction and community needs.

### Types of Contributions

We welcome various types of contributions:

- **Bug Fixes**: Fix issues and improve stability
- **Feature Development**: Add new capabilities and functionality
- **Documentation**: Improve guides, API docs, and examples
- **Testing**: Add tests, improve test coverage
- **Performance**: Optimize code and improve efficiency
- **Security**: Enhance security analysis capabilities
- **UI/UX**: Improve user interface and experience
- **Translation**: Help with internationalization

## Development Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 16.x or higher
- **Python**: Version 3.8 or higher
- **Git**: Latest version
- **VS Code**: For development (recommended)
- **C/C++ Compiler**: GCC/Clang with AddressSanitizer support

### Fork and Clone

1. **Fork the Repository**:
   - Go to [CodeGuard on GitHub](https://github.com/hoda39/CodeGuard)
   - Click the "Fork" button in the top right
   - This creates your own copy of the repository

2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/CodeGuard.git
   cd CodeGuard
   ```

3. **Add Upstream Remote**:
   ```bash
   git remote add upstream https://github.com/hoda39/CodeGuard.git
   ```

### Install Dependencies

#### Static Analysis Dependencies
```bash
cd StaticAnalysis/code
npm install
npm run compile
```

#### Dynamic Analysis Dependencies
```bash
cd ../../DynamicAnalysis/extension
npm install
npm run compile
```

#### Python Dependencies
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Development Environment

#### VS Code Setup
1. **Install Recommended Extensions**:
   - TypeScript and JavaScript Language Features
   - ESLint
   - Prettier
   - Python
   - C/C++

2. **Configure Workspace Settings**:
   ```json
   // .vscode/settings.json
   {
     "typescript.preferences.importModuleSpecifier": "relative",
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "python.defaultInterpreterPath": "./venv/bin/python"
   }
   ```

#### Development Scripts
```bash
# Static Analysis Development
cd StaticAnalysis/code
npm run watch          # Watch for changes and recompile
npm run test           # Run tests
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues

# Dynamic Analysis Development
cd ../../DynamicAnalysis/extension
npm run watch          # Watch for changes and recompile
npm run test           # Run tests
npm run lint           # Run ESLint
npm run start:api      # Start API server
```

## Code Style

### TypeScript/JavaScript

#### General Guidelines
- Use TypeScript for all new code
- Follow strict TypeScript configuration
- Use meaningful variable and function names
- Write self-documenting code with clear comments

#### Code Formatting
```typescript
// Use consistent formatting
interface AnalysisResult {
  id: string;
  type: AnalysisType;
  results: VulnerabilityResult[];
  summary: AnalysisSummary;
}

// Use async/await for asynchronous operations
async function runAnalysis(config: AnalysisConfig): Promise<AnalysisResult> {
  try {
    const result = await analysisEngine.analyze(config);
    return result;
  } catch (error) {
    throw new AnalysisError(`Analysis failed: ${error.message}`);
  }
}

// Use proper error handling
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
```

#### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Python

#### General Guidelines
- Follow PEP 8 style guide
- Use type hints for all functions
- Write docstrings for all public functions
- Use meaningful variable names

#### Code Formatting
```python
# Use consistent formatting
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class AnalysisEngine:
    """Core analysis engine for vulnerability detection."""
    
    def __init__(self, config: Dict[str, any]) -> None:
        """Initialize the analysis engine.
        
        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.logger = logging.getLogger(__name__)
    
    async def analyze(self, code: str) -> List[VulnerabilityResult]:
        """Analyze code for vulnerabilities.
        
        Args:
            code: Source code to analyze
            
        Returns:
            List of detected vulnerabilities
            
        Raises:
            AnalysisError: If analysis fails
        """
        try:
            results = await self._run_analysis(code)
            return results
        except Exception as e:
            self.logger.error(f"Analysis failed: {e}")
            raise AnalysisError(f"Analysis failed: {e}")
```

### C/C++

#### General Guidelines
- Follow project-specific coding standards
- Use consistent naming conventions
- Include proper error handling
- Write clear comments

#### Code Formatting
```cpp
// Use consistent formatting
#include <iostream>
#include <memory>
#include <string>

class VulnerabilityChecker {
private:
    std::string name_;
    std::string description_;
    
public:
    VulnerabilityChecker(const std::string& name, const std::string& description)
        : name_(name), description_(description) {}
    
    virtual ~VulnerabilityChecker() = default;
    
    // Pure virtual function for checking vulnerabilities
    virtual std::vector<VulnerabilityResult> check(const std::string& code) = 0;
    
    // Getter methods
    const std::string& name() const { return name_; }
    const std::string& description() const { return description_; }
};
```

## Testing

### Test Structure

#### Unit Tests
```typescript
// Static Analysis Tests
describe('StaticAnalysisEngine', () => {
  let engine: StaticAnalysisEngine;
  
  beforeEach(() => {
    engine = new StaticAnalysisEngine(mockConfig);
  });
  
  it('should detect buffer overflow vulnerabilities', async () => {
    const code = `
      void vulnerable_function() {
        char buffer[10];
        strcpy(buffer, "This string is too long");
      }
    `;
    
    const result = await engine.analyze(code);
    
    expect(result.results).toHaveLength(1);
    expect(result.results[0].cweId).toBe('CWE-119');
    expect(result.results[0].severityLevel).toBe('high');
  });
  
  it('should handle empty code gracefully', async () => {
    const result = await engine.analyze('');
    
    expect(result.results).toHaveLength(0);
    expect(result.summary.totalIssues).toBe(0);
  });
});
```

#### Integration Tests
```typescript
// API Integration Tests
describe('Analysis API', () => {
  let server: Express;
  let apiClient: CodeGuardAPIClient;
  
  beforeAll(async () => {
    server = await createTestServer();
    apiClient = new CodeGuardAPIClient('http://localhost:3000');
  });
  
  afterAll(async () => {
    await server.close();
  });
  
  it('should process static analysis requests', async () => {
    const response = await apiClient.runStaticAnalysis({
      code: 'int main() { return 0; }',
      language: 'cpp'
    });
    
    expect(response.status).toBe('completed');
    expect(response.results).toBeDefined();
  });
});
```

#### End-to-End Tests
```typescript
// VS Code Extension Tests
describe('CodeGuard Extension', () => {
  it('should activate for C++ files', async () => {
    const document = await vscode.workspace.openTextDocument({
      content: 'int main() { return 0; }',
      language: 'cpp'
    });
    
    await vscode.window.showTextDocument(document);
    
    // Wait for extension activation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    expect(diagnostics).toBeDefined();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

Maintain high test coverage:
- **Unit Tests**: > 80% coverage
- **Integration Tests**: > 70% coverage
- **Critical Paths**: 100% coverage

## Pull Request Process

### Before Submitting

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**:
   - Write clear, focused commits
   - Follow the coding standards
   - Add appropriate tests
   - Update documentation

3. **Test Your Changes**:
   ```bash
   # Run all tests
   npm test
   
   # Run linting
   npm run lint
   
   # Build the project
   npm run build
   ```

4. **Update Documentation**:
   - Update README if needed
   - Add API documentation
   - Update examples
   - Add inline comments

### Pull Request Guidelines

#### Title and Description
```markdown
## Title
feat: Add memory leak detection checker

## Description
This PR adds a new vulnerability checker for detecting memory leaks in C/C++ code.

### Changes
- Added MemoryLeakChecker class
- Implemented AST-based memory allocation tracking
- Added unit tests for memory leak detection
- Updated documentation

### Testing
- [x] Unit tests pass
- [x] Integration tests pass
- [x] Manual testing completed
- [x] No breaking changes

### Checklist
- [x] Code follows style guidelines
- [x] Tests added for new functionality
- [x] Documentation updated
- [x] No console errors
- [x] Performance impact assessed

### Related Issues
Closes #123
```

#### Commit Messages
Use conventional commit format:
```bash
# Feature
feat: add new vulnerability checker

# Bug fix
fix: resolve memory leak in analysis engine

# Documentation
docs: update API documentation

# Refactoring
refactor: improve error handling

# Test
test: add unit tests for new feature
```

### Review Process

1. **Automated Checks**:
   - All tests must pass
   - Code coverage must meet requirements
   - Linting must pass
   - Build must succeed

2. **Code Review**:
   - At least one maintainer must approve
   - Address all review comments
   - Ensure code quality standards

3. **Final Steps**:
   - Squash commits if needed
   - Update branch if conflicts arise
   - Wait for CI/CD pipeline completion

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Open VS Code
2. Create a C++ file with...
3. Run analysis
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: Windows 10
- VS Code: 1.69.0
- CodeGuard: 1.0.0
- Node.js: 16.x

## Additional Information
- Screenshots if applicable
- Error logs
- Console output
```

### Feature Requests

Use the feature request template:

```markdown
## Feature Description
Brief description of the requested feature

## Use Case
Why this feature is needed

## Proposed Solution
How the feature should work

## Alternatives Considered
Other approaches that were considered

## Additional Context
Any other relevant information
```

## Documentation

### Documentation Standards

#### Code Comments
```typescript
/**
 * Analyzes source code for security vulnerabilities.
 * 
 * @param code - The source code to analyze
 * @param config - Analysis configuration options
 * @returns Promise resolving to analysis results
 * 
 * @example
 * ```typescript
 * const results = await analyzeCode(sourceCode, {
 *   language: 'cpp',
 *   severityThreshold: 'high'
 * });
 * ```
 * 
 * @throws {AnalysisError} When analysis fails
 */
async function analyzeCode(
  code: string,
  config: AnalysisConfig
): Promise<AnalysisResult> {
  // Implementation
}
```

#### API Documentation
```markdown
## POST /api/analysis/static

Submit code for static analysis.

### Request Body
```json
{
  "code": "string",
  "language": "cpp" | "c",
  "options": {
    "inferenceMode": "local" | "remote",
    "useCUDA": boolean
  }
}
```

### Response
```json
{
  "success": true,
  "data": {
    "analysisId": "uuid",
    "results": [...]
  }
}
```

### Status Codes
- `200`: Analysis completed successfully
- `400`: Invalid input data
- `500`: Analysis failed
```

### Documentation Updates

When making changes that affect documentation:

1. **Update README**: If public-facing changes
2. **Update API Docs**: If API changes
3. **Update Examples**: If functionality changes
4. **Add Migration Guide**: If breaking changes

## Security

### Security Guidelines

#### Code Security
- Never commit secrets or sensitive data
- Use environment variables for configuration
- Validate all inputs
- Sanitize all outputs
- Use secure coding practices

#### Vulnerability Reporting
For security vulnerabilities:

1. **DO NOT** create a public issue
2. **DO** email security@codeguard.dev
3. **DO** include detailed information
4. **DO** wait for response before disclosure

#### Security Checklist
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] Output sanitization implemented
- [ ] Authentication/authorization in place
- [ ] Error handling doesn't leak information
- [ ] Dependencies are up to date

### Dependency Management

#### Regular Updates
```bash
# Check for outdated dependencies
npm outdated

# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix security issues
npm audit fix
```

#### Dependency Policy
- Keep dependencies up to date
- Use exact versions for critical dependencies
- Regularly audit for security vulnerabilities
- Document any known vulnerabilities

## Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be collaborative and constructive
- Focus on what is best for the community
- Show empathy towards other community members

### Communication

#### GitHub Discussions
- Use discussions for questions and ideas
- Be helpful and supportive
- Search before posting
- Use appropriate tags

#### Issue Comments
- Be constructive and specific
- Provide context and examples
- Respect others' time and effort
- Follow up on resolved issues

### Recognition

Contributors are recognized through:

- **Contributors List**: Added to README
- **Release Notes**: Mentioned in changelog
- **Community Hall of Fame**: Special recognition for significant contributions

## Getting Help

### Resources

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/hoda39/CodeGuard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hoda39/CodeGuard/discussions)
- **Wiki**: [Project Wiki](https://github.com/hoda39/CodeGuard/wiki)

### Contact

- **General Questions**: Use GitHub Discussions
- **Bug Reports**: Use GitHub Issues
- **Security Issues**: Email security@codeguard.dev
- **Feature Requests**: Use GitHub Issues with feature template

## Conclusion

Thank you for contributing to CodeGuard! Your contributions help make the project better for everyone. If you have any questions or need clarification on any part of this guide, please don't hesitate to ask.

Remember:
- Start small and build up
- Ask for help when needed
- Be patient with the review process
- Celebrate your contributions!

Happy coding! 🚀 