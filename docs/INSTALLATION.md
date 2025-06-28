# CodeGuard Installation Guide

This guide provides comprehensive instructions for installing and setting up CodeGuard in various environments, from individual development to enterprise deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
- [Environment Setup](#environment-setup)
- [Configuration](#configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

#### Minimum Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **VS Code**: Version 1.69.0 or higher
- **Node.js**: Version 16.x or higher
- **Python**: Version 3.8 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB available space

#### Recommended Requirements
- **Operating System**: Latest stable version
- **VS Code**: Latest stable version
- **Node.js**: Version 18.x or higher
- **Python**: Version 3.9 or higher
- **RAM**: 16GB or higher
- **Storage**: 5GB available space
- **GPU**: NVIDIA GPU with CUDA support (for GPU acceleration)

### Required Software

#### 1. Visual Studio Code
```bash
# Download from official website
https://code.visualstudio.com/download

# Or install via package manager
# Ubuntu/Debian
sudo apt update
sudo apt install code

# macOS (using Homebrew)
brew install --cask visual-studio-code

# Windows (using Chocolatey)
choco install vscode
```

#### 2. Node.js and npm
```bash
# Download from official website
https://nodejs.org/

# Or install via package manager
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (using Homebrew)
brew install node

# Windows (using Chocolatey)
choco install nodejs
```

#### 3. Python
```bash
# Download from official website
https://www.python.org/downloads/

# Or install via package manager
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip

# macOS (using Homebrew)
brew install python

# Windows (using Chocolatey)
choco install python
```

#### 4. C/C++ Compiler
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install build-essential gcc g++ clang

# macOS
xcode-select --install

# Windows
# Install Visual Studio Build Tools or MinGW-w64
```

## Installation Methods

### Method 1: VS Code Marketplace (Recommended)

This is the easiest method for most users.

#### Steps:
1. **Open VS Code**
2. **Open Extensions Panel**: Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on macOS)
3. **Search for CodeGuard**: Type "CodeGuard" in the search box
4. **Install Extension**: Click "Install" on the CodeGuard extension
5. **Reload VS Code**: Click "Reload" when prompted

#### Verification:
```bash
# Check if extension is installed
code --list-extensions | grep CodeGuard
```

### Method 2: Manual Installation from Source

This method is for developers who want to build from source or customize the extension.

#### Steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/hoda39/CodeGuard.git
   cd CodeGuard
   ```

2. **Install Static Analysis Dependencies**:
   ```bash
   cd StaticAnalysis/code
   npm install
   npm run compile
   ```

3. **Install Dynamic Analysis Dependencies**:
   ```bash
   cd ../../DynamicAnalysis/extension
   npm install
   npm run compile
   ```

4. **Package the Extension**:
   ```bash
   # Install vsce globally
   npm install -g vsce
   
   # Package static analysis extension
   cd ../../StaticAnalysis/code
   vsce package
   
   # Package dynamic analysis extension
   cd ../../DynamicAnalysis/extension
   vsce package
   ```

5. **Install the Package**:
   ```bash
   # Install the generated .vsix files
   code --install-extension aibughunter-1.0.4.vsix
   code --install-extension secure-code-analyzer-0.0.1.vsix
   ```

### Method 3: Docker Installation

This method is for containerized environments or consistent deployment.

#### Steps:

1. **Create Dockerfile**:
   ```dockerfile
   FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:18
   
   # Install Python and required packages
   RUN apt-get update && apt-get install -y \
       python3 \
       python3-pip \
       build-essential \
       gcc \
       g++ \
       clang \
       && rm -rf /var/lib/apt/lists/*
   
   # Install Python dependencies
   COPY requirements.txt /tmp/
   RUN pip3 install -r /tmp/requirements.txt
   
   # Install Node.js dependencies
   COPY package*.json ./
   RUN npm install
   
   # Copy extension source
   COPY . .
   
   # Build extensions
   RUN npm run compile
   ```

2. **Build and Run**:
   ```bash
   docker build -t codeguard .
   docker run -it --rm -v $(pwd):/workspace codeguard
   ```

## Environment Setup

### Python Environment Setup

#### 1. Create Virtual Environment (Recommended)
```bash
# Create virtual environment
python3 -m venv codeguard-env

# Activate virtual environment
# On Windows
codeguard-env\Scripts\activate

# On macOS/Linux
source codeguard-env/bin/activate
```

#### 2. Install Python Dependencies
```bash
# Install base requirements
pip install numpy onnxruntime torch transformers

# For GPU acceleration (NVIDIA GPUs only)
pip install onnxruntime-gpu

# Install additional dependencies
pip install python-shell xml2js xml2json
```

#### 3. Verify Python Setup
```python
# Test Python installation
python3 -c "import torch; import onnxruntime; print('Python setup successful')"
```

### Node.js Environment Setup

#### 1. Verify Node.js Installation
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check TypeScript installation
npx tsc --version
```

#### 2. Install Global Dependencies
```bash
# Install TypeScript globally
npm install -g typescript

# Install VS Code extension tools
npm install -g vsce

# Install development tools
npm install -g eslint prettier
```

### C/C++ Environment Setup

#### 1. Verify Compiler Installation
```bash
# Check GCC version
gcc --version

# Check Clang version
clang --version

# Check AddressSanitizer support
gcc -fsanitize=address -x c -E - < /dev/null
```

#### 2. Install AddressSanitizer Support
```bash
# Ubuntu/Debian
sudo apt install libasan5 libasan6

# macOS
# AddressSanitizer is included with Xcode

# Windows
# Install Visual Studio with C++ development tools
```

## Configuration

### VS Code Settings

#### 1. Open Settings
- Press `Ctrl+,` (or `Cmd+,` on macOS)
- Or go to File → Preferences → Settings

#### 2. Configure Static Analysis
```json
{
  "AiBugHunter.inference.inferenceMode": "Local",
  "AiBugHunter.inference.useCUDA": false,
  "AiBugHunter.inference.inferenceServerURL": "http://localhost:5000",
  "AiBugHunter.diagnostics.delayBeforeAnalysis": 1500,
  "AiBugHunter.diagnostics.maxNumberOfLines": 1,
  "AiBugHunter.diagnostics.highlightSeverityType": "Error",
  "AiBugHunter.diagnostics.informationLevel": "Verbose",
  "AiBugHunter.diagnostics.showDescription": true
}
```

#### 3. Configure Dynamic Analysis
```json
{
  "secure-code-analyzer.apiUrl": "http://localhost:3000",
  "secure-code-analyzer.enableRealTimeAnalysis": true,
  "secure-code-analyzer.sarifOutputPath": "./analysis-results",
  "secure-code-analyzer.timeout": 30000,
  "secure-code-analyzer.logLevel": "info"
}
```

### Environment Variables

#### 1. Create Environment File
```bash
# Create .env file in project root
touch .env
```

#### 2. Configure Environment Variables
```env
# API Configuration
API_PORT=3000
API_HOST=localhost
NODE_ENV=development

# Database Configuration (if using external database)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=codeguard
DB_USER=codeguard_user
DB_PASSWORD=secure_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/codeguard.log

# Analysis Configuration
MAX_ANALYSIS_TIME=300
MAX_FILE_SIZE=10485760
```

### Build Configuration

#### 1. TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./out",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "out", "test"]
}
```

#### 2. ESLint Configuration
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
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

## Verification

### 1. Extension Installation Verification
```bash
# Check installed extensions
code --list-extensions

# Should show:
# aibughunter
# secure-code-analyzer
```

### 2. Static Analysis Verification
```cpp
// Create test file: test.cpp
#include <iostream>
#include <cstring>

void vulnerable_function() {
    char buffer[10];
    strcpy(buffer, "This string is too long"); // Should trigger warning
}

int main() {
    vulnerable_function();
    return 0;
}
```

**Expected Result**: The extension should highlight the `strcpy` line with a vulnerability warning.

### 3. Dynamic Analysis Verification
```bash
# Run AddressSanitizer analysis
# Press Ctrl+Shift+P and select "Run AddressSanitizer"

# Check for SARIF output
ls analysis-results/
```

### 4. API Verification
```bash
# Test API health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"status": "healthy", "timestamp": "2024-01-01T00:00:00.000Z"}
```

### 5. Python Dependencies Verification
```python
# Test ML model loading
python3 -c "
import torch
import onnxruntime
import transformers
print('All Python dependencies loaded successfully')
"
```

## Troubleshooting

### Common Issues

#### 1. Extension Not Activating
**Symptoms**: Extension doesn't activate for C/C++ files
**Solutions**:
```bash
# Check VS Code version
code --version

# Reinstall extension
code --uninstall-extension aibughunter
code --install-extension aibughunter

# Check activation events in package.json
```

#### 2. Python Dependencies Not Found
**Symptoms**: Static analysis fails with Python import errors
**Solutions**:
```bash
# Verify Python installation
python3 --version

# Reinstall dependencies
pip install --upgrade numpy onnxruntime torch transformers

# Check virtual environment
which python3
```

#### 3. AddressSanitizer Not Working
**Symptoms**: Dynamic analysis fails to compile with ASan
**Solutions**:
```bash
# Check compiler support
gcc -fsanitize=address -x c -E - < /dev/null

# Install ASan libraries
sudo apt install libasan5 libasan6

# Verify ASan flags
echo 'int main() { return 0; }' | gcc -fsanitize=address -x c -o test -
```

#### 4. API Server Not Starting
**Symptoms**: Dynamic analysis API endpoints not responding
**Solutions**:
```bash
# Check port availability
netstat -tulpn | grep :3000

# Check Node.js installation
node --version

# Restart API server
cd DynamicAnalysis/extension
npm run start:api
```

#### 5. ML Models Not Loading
**Symptoms**: Static analysis shows "Model not found" errors
**Solutions**:
```bash
# Check model files exist
ls StaticAnalysis/code/resources/local-inference/models/

# Download models if missing
# Models should be automatically downloaded on first run

# Check file permissions
chmod 644 StaticAnalysis/code/resources/local-inference/models/*
```

### Performance Issues

#### 1. Slow Analysis
**Solutions**:
- Enable CUDA acceleration (if NVIDIA GPU available)
- Increase RAM allocation
- Use remote inference mode
- Optimize analysis delay settings

#### 2. High Memory Usage
**Solutions**:
- Reduce max number of lines analyzed
- Use local inference mode
- Restart VS Code periodically
- Monitor system resources

### Debug Mode

#### 1. Enable Debug Logging
```json
// settings.json
{
  "secure-code-analyzer.logLevel": "debug",
  "AiBugHunter.diagnostics.informationLevel": "Verbose"
}
```

#### 2. Check Logs
```bash
# VS Code extension logs
# Open Output panel (View → Output)
# Select "CodeGuard" from dropdown

# API server logs
tail -f DynamicAnalysis/extension/logs/server.log
```

#### 3. Development Mode
```bash
# Run extension in development mode
cd DynamicAnalysis/extension
npm run watch

# Press F5 in VS Code to start debugging
```

## Support

If you encounter issues not covered in this guide:

1. **Check GitHub Issues**: [CodeGuard Issues](https://github.com/hoda39/CodeGuard/issues)
2. **Review Documentation**: [docs/](docs/)
3. **Create New Issue**: Provide detailed error messages and system information
4. **Community Support**: [GitHub Discussions](https://github.com/hoda39/CodeGuard/discussions)

## Next Steps

After successful installation:

1. **Read the User Guide**: [docs/USAGE.md](docs/USAGE.md)
2. **Configure Your Workflow**: [docs/CONFIGURATION.md](docs/CONFIGURATION.md)
3. **Explore Examples**: [docs/EXAMPLES.md](docs/EXAMPLES.md)
4. **Join the Community**: Contribute and share feedback 