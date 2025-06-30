# Contributing to CodeGuard

Thank you for your interest in contributing to CodeGuard! This document provides guidelines and information for contributors.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Code Style](#code-style)
4. [Testing](#testing)
5. [Pull Request Process](#pull-request-process)
6. [Issue Reporting](#issue-reporting)
7. [Feature Requests](#feature-requests)
8. [Documentation](#documentation)
9. [Code of Conduct](#code-of-conduct)

## Getting Started

### Prerequisites
- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **VS Code**: Version 1.96.0 or higher
- **Docker**: Version 20.10.0 or higher
- **Git**: Version control

### Fork and Clone
1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/codeguard.git
   cd codeguard
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-repo/codeguard.git
   ```

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: New features
- **bugfix/***: Bug fixes
- **hotfix/***: Critical fixes for production

## Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile the Extension
```bash
npm run compile
```

### 3. Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 4. Development Mode
```bash
# Watch for changes and recompile
npm run watch
```

### 5. Package Extension
```bash
# Install vsce globally
npm install -g vsce

# Create package
vsce package
```

## Code Style

### TypeScript Guidelines
- Use **TypeScript** for all new code
- Follow **strict mode** settings
- Use **explicit types** when beneficial
- Prefer **interfaces** over types for objects
- Use **async/await** over Promises
- Handle **errors** properly

### Naming Conventions
- **Files**: kebab-case (`analysis-manager.ts`)
- **Classes**: PascalCase (`AnalysisManager`)
- **Functions**: camelCase (`runAnalysis`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Interfaces**: PascalCase with `I` prefix (`IAnalysisResult`)

### Code Organization
```typescript
// 1. Imports (external, then internal)
import * as vscode from 'vscode';
import { AnalysisManager } from './analysis-manager';

// 2. Constants
const DEFAULT_TIMEOUT = 30000;

// 3. Interfaces/Types
interface AnalysisOptions {
  timeout?: number;
  type: 'static' | 'dynamic' | 'combined';
}

// 4. Class/Function
export class AnalysisService {
  // 4a. Private fields
  private manager: AnalysisManager;

  // 4b. Constructor
  constructor(manager: AnalysisManager) {
    this.manager = manager;
  }

  // 4c. Public methods
  public async runAnalysis(options: AnalysisOptions): Promise<void> {
    // Implementation
  }

  // 4d. Private methods
  private validateOptions(options: AnalysisOptions): void {
    // Validation logic
  }
}
```

### Comments and Documentation
- Use **JSDoc** for public APIs
- Write **clear, concise comments**
- Explain **why**, not just **what**
- Keep comments **up to date**

```typescript
/**
 * Runs security analysis on the specified files.
 * @param workspace - The VS Code workspace folder
 * @param files - Array of file paths to analyze
 * @param options - Analysis configuration options
 * @returns Promise that resolves to analysis results
 * @throws {Error} When analysis fails or Docker is unavailable
 */
async runAnalysis(
  workspace: vscode.WorkspaceFolder,
  files: string[],
  options: AnalysisOptions = {}
): Promise<AnalysisResult> {
  // Implementation
}
```

## Testing

### Test Structure
```
src/test/
├── unit/                    # Unit tests
├── integration/             # Integration tests
├── performance/             # Performance tests
├── end-to-end/              # End-to-end tests
└── setup.ts                 # Test setup
```

### Writing Tests
```typescript
describe('AnalysisManager', () => {
  let analysisManager: AnalysisManager;
  let mockConfigManager: jest.Mocked<ConfigManager>;

  beforeEach(() => {
    mockConfigManager = createMockConfigManager();
    analysisManager = new AnalysisManager(mockConfigManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('runAnalysis', () => {
    it('should run static analysis successfully', async () => {
      // Arrange
      const workspace = createMockWorkspace();
      const files = ['test.c'];

      // Act
      const result = await analysisManager.runAnalysis('static', workspace, files);

      // Assert
      expect(result.success).toBe(true);
      expect(result.staticResults).toBeDefined();
    });

    it('should handle analysis failures gracefully', async () => {
      // Arrange
      mockConfigManager.getConfig.mockReturnValue(invalidConfig);

      // Act & Assert
      await expect(
        analysisManager.runAnalysis('static', workspace, files)
      ).rejects.toThrow('Invalid configuration');
    });
  });
});
```

### Test Guidelines
- **One assertion per test** when possible
- **Arrange-Act-Assert** pattern
- **Descriptive test names**
- **Mock external dependencies**
- **Test error conditions**
- **Use test data factories**

### Running Tests
```bash
# Run specific test file
npm test -- analysis-manager.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should run static analysis"

# Run tests with verbose output
npm test -- --verbose

# Run tests in specific directory
npm test -- src/test/unit/
```

## Pull Request Process

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write your code
- Add tests for new functionality
- Update documentation
- Follow code style guidelines

### 3. Commit Changes
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new analysis type support

- Add support for custom analysis types
- Implement type validation
- Add unit tests for new functionality
- Update documentation

Closes #123"
```

### 4. Push and Create PR
```bash
git push origin feature/your-feature-name
```

### 5. Pull Request Guidelines
- **Clear title** describing the change
- **Detailed description** of changes
- **Link related issues**
- **Include screenshots** for UI changes
- **List testing steps**
- **Check all CI checks pass**

### 6. PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance impact assessed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)
Add screenshots for UI changes
```

## Issue Reporting

### Bug Reports
When reporting bugs, include:
- **VS Code version**
- **Extension version**
- **Operating system**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Error messages/logs**
- **Screenshots** (if applicable)

### Issue Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Open VS Code
2. Open a C file
3. Run static analysis
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- VS Code: 1.96.0
- Extension: 1.0.0
- OS: Windows 10
- Docker: 20.10.0

## Additional Information
Any other relevant information
```

## Feature Requests

### Feature Request Guidelines
- **Clear problem statement**
- **Proposed solution**
- **Use cases**
- **Implementation ideas**
- **Priority level**

### Feature Request Template
```markdown
## Problem
Describe the problem you're trying to solve

## Proposed Solution
Describe your proposed solution

## Use Cases
- Use case 1
- Use case 2
- Use case 3

## Implementation Ideas
Any thoughts on implementation

## Priority
- [ ] High
- [ ] Medium
- [ ] Low
```

## Documentation

### Documentation Guidelines
- **Keep documentation up to date**
- **Write for the target audience**
- **Use clear, concise language**
- **Include examples**
- **Add screenshots when helpful**

### Documentation Structure
```
docs/
├── README.md              # Main documentation
├── USAGE.md               # Usage guide
├── API.md                 # API documentation
├── ARCHITECTURE.md        # Architecture guide
├── TESTING.md             # Testing guide
└── DEPLOYMENT.md          # Deployment guide
```

### Writing Documentation
- **Start with an overview**
- **Provide step-by-step instructions**
- **Include code examples**
- **Add troubleshooting sections**
- **Keep it organized**

## Code of Conduct

### Our Standards
- **Be respectful** and inclusive
- **Be collaborative** and helpful
- **Be constructive** in feedback
- **Be professional** in communication

### Unacceptable Behavior
- **Harassment** or discrimination
- **Trolling** or insulting comments
- **Publishing private information**
- **Other inappropriate conduct**

### Enforcement
- **Warnings** for minor violations
- **Temporary bans** for repeated violations
- **Permanent bans** for serious violations

## Getting Help

### Resources
- **Documentation**: Check the docs folder
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Code**: Review source code

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code contributions
- **Email**: For sensitive matters

## Recognition

### Contributors
- **Code contributors** are listed in CONTRIBUTORS.md
- **Documentation contributors** are acknowledged
- **Bug reporters** are thanked
- **Feature requesters** are credited

### Hall of Fame
- **Top contributors** are featured
- **Special recognition** for major contributions
- **Community awards** for outstanding work

Thank you for contributing to CodeGuard! Your contributions help make the extension better for everyone. 