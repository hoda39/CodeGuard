# CodeGuard Deployment Guide

This guide covers packaging, publishing, and deploying the CodeGuard extension for distribution.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Building the Extension](#building-the-extension)
3. [Packaging](#packaging)
4. [Publishing](#publishing)
5. [Distribution](#distribution)
6. [Installation](#installation)
7. [Updates](#updates)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Development Environment
- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **TypeScript**: Version 5.0.0 or higher
- **VS Code**: Version 1.96.0 or higher

### Publishing Tools
- **vsce**: VS Code Extension Manager
- **Git**: Version control
- **Docker**: For container testing

### Accounts and Access
- **GitHub**: Repository access
- **Visual Studio Marketplace**: Publisher account
- **Docker Hub**: Container registry (optional)

## Building the Extension

### 1. Prepare the Build Environment

```bash
# Clone the repository
git clone https://github.com/your-repo/codeguard.git
cd codeguard

# Install dependencies
npm install

# Verify TypeScript compilation
npm run compile
```

### 2. Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm test -- --testPathPattern="unit"
npm test -- --testPathPattern="integration"
```

### 3. Verify Build Output

```bash
# Check compiled output
ls -la out/

# Verify extension structure
tree out/
```

Expected structure:
```
out/
├── extension.js
├── analysis/
├── config/
├── diagnostics/
├── dynamic/
├── shared/
├── static/
└── ui/
```

## Packaging

### 1. Install vsce

```bash
# Install vsce globally
npm install -g vsce

# Verify installation
vsce --version
```

### 2. Update package.json

Ensure your `package.json` has the correct publishing information:

```json
{
  "name": "codeguard",
  "displayName": "CodeGuard",
  "description": "Comprehensive security analysis tool combining static and dynamic vulnerability detection for C/C++ code",
  "version": "1.0.0",
  "publisher": "your-publisher-name",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-repo/codeguard.git"
  },
  "engines": {
    "vscode": "^1.96.0"
  },
  "categories": [
    "Machine Learning",
    "Testing",
    "Linters",
    "Security",
    "Other"
  ],
  "keywords": [
    "security",
    "static-analysis",
    "dynamic-analysis",
    "vulnerability",
    "c",
    "cpp",
    "docker"
  ],
  "icon": "resources/logo.png",
  "galleryBanner": {
    "color": "#1e1e1e",
    "theme": "dark"
  },
  "markdown": "github"
}
```

### 3. Create VSIX Package

```bash
# Create package
vsce package

# Verify package
ls -la *.vsix
```

The package will be named `codeguard-1.0.0.vsix`.

### 4. Test the Package

```bash
# Install the package locally
code --install-extension codeguard-1.0.0.vsix

# Verify installation
code --list-extensions | grep codeguard
```

## Publishing

### 1. Visual Studio Marketplace

#### Create Publisher Account
1. Go to [Visual Studio Marketplace](https://marketplace.visualstudio.com/)
2. Sign in with your Microsoft account
3. Click "Publish extensions"
4. Create a new publisher account
5. Note your publisher ID

#### Get Personal Access Token
1. Go to [Azure DevOps](https://dev.azure.com/)
2. Create or select an organization
3. Go to User Settings → Personal Access Tokens
4. Create a new token with Marketplace (Publish) scope
5. Copy the token

#### Publish Extension

```bash
# Login to marketplace
vsce login your-publisher-name

# Publish extension
vsce publish

# Publish with specific version
vsce publish patch  # 1.0.0 -> 1.0.1
vsce publish minor  # 1.0.0 -> 1.1.0
vsce publish major  # 1.0.0 -> 2.0.0
```

### 2. GitHub Releases

#### Create Release
1. Go to your GitHub repository
2. Click "Releases"
3. Click "Create a new release"
4. Tag version: `v1.0.0`
5. Title: `CodeGuard v1.0.0`
6. Upload the `.vsix` file
7. Publish release

#### Automated Release Script

```bash
#!/bin/bash
# release.sh

VERSION=$1
if [ -z "$VERSION" ]; then
    echo "Usage: ./release.sh <version>"
    exit 1
fi

# Build and package
npm run compile
vsce package

# Create git tag
git tag v$VERSION
git push origin v$VERSION

# Create GitHub release
gh release create v$VERSION codeguard-$VERSION.vsix \
    --title "CodeGuard v$VERSION" \
    --notes "Release notes for version $VERSION"

echo "Release v$VERSION created successfully!"
```

### 3. Docker Images

#### Build and Push Docker Images

```bash
# Build static analysis image
docker build -t codeguard/static-analysis:1.0.0 ./StaticAnalysis
docker push codeguard/static-analysis:1.0.0

# Build dynamic analysis image
docker build -t codeguard/dynamic-analysis:1.0.0 ./DynamicAnalysis
docker push codeguard/dynamic-analysis:1.0.0

# Tag as latest
docker tag codeguard/static-analysis:1.0.0 codeguard/static-analysis:latest
docker tag codeguard/dynamic-analysis:1.0.0 codeguard/dynamic-analysis:latest
docker push codeguard/static-analysis:latest
docker push codeguard/dynamic-analysis:latest
```

## Distribution

### 1. Direct Download

Provide the `.vsix` file for direct download:
- GitHub Releases
- Project website
- Documentation site

### 2. Installation Instructions

#### From VSIX File
1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X)
4. Click "..." menu
5. Select "Install from VSIX..."
6. Choose the downloaded file
7. Reload VS Code

#### From Command Line
```bash
code --install-extension codeguard-1.0.0.vsix
```

#### From Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "CodeGuard"
4. Click Install

### 3. System Requirements

Document the system requirements:
- **VS Code**: 1.96.0 or higher
- **Docker**: 20.10.0 or higher
- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Disk Space**: 2GB free space

## Installation

### 1. User Installation

#### Automatic Installation
```bash
# Install from marketplace
code --install-extension your-publisher-name.codeguard
```

#### Manual Installation
```bash
# Download and install
wget https://github.com/your-repo/codeguard/releases/download/v1.0.0/codeguard-1.0.0.vsix
code --install-extension codeguard-1.0.0.vsix
```

### 2. Enterprise Installation

#### Offline Installation
1. Download the `.vsix` file
2. Transfer to target machines
3. Install using `code --install-extension`

#### Network Installation
```bash
# Install from network share
code --install-extension \\server\share\codeguard-1.0.0.vsix
```

### 3. Docker Setup

#### Pull Images
```bash
# Pull analysis images
docker pull codeguard/static-analysis:latest
docker pull codeguard/dynamic-analysis:latest
```

#### Verify Installation
```bash
# Test static analysis
docker run --rm codeguard/static-analysis:latest --help

# Test dynamic analysis
docker run --rm codeguard/dynamic-analysis:latest --help
```

## Updates

### 1. Version Management

#### Semantic Versioning
- **Major**: Breaking changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, backward compatible

#### Update Process
1. Update version in `package.json`
2. Update CHANGELOG.md
3. Build and test
4. Create new package
5. Publish to marketplace
6. Create GitHub release

### 2. Automatic Updates

VS Code automatically checks for updates:
- Daily check for updates
- User notification when updates available
- One-click update installation

### 3. Update Notifications

#### In-App Notifications
- VS Code shows update notifications
- Extension icon shows update badge
- Update button in Extensions panel

#### Release Notes
- Include in GitHub releases
- Show in VS Code after update
- Document breaking changes

## Troubleshooting

### 1. Build Issues

#### TypeScript Compilation Errors
```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix linting issues
npm run lint -- --fix
```

#### Missing Dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### 2. Packaging Issues

#### vsce Errors
```bash
# Check vsce version
vsce --version

# Update vsce
npm update -g vsce

# Check package.json
vsce verify
```

#### Package Size Issues
```bash
# Check package size
ls -lh *.vsix

# Optimize package
vsce package --no-yarn
```

### 3. Publishing Issues

#### Authentication Errors
```bash
# Re-login to marketplace
vsce logout
vsce login your-publisher-name
```

#### Version Conflicts
```bash
# Check existing versions
vsce show your-publisher-name.codeguard

# Use different version
vsce publish patch
```

### 4. Installation Issues

#### Extension Not Loading
1. Check VS Code version compatibility
2. Verify extension installation
3. Check Output panel for errors
4. Reload VS Code window

#### Docker Issues
```bash
# Check Docker installation
docker --version
docker info

# Test Docker access
docker run hello-world
```

### 5. Performance Issues

#### Slow Analysis
1. Check Docker resource allocation
2. Verify sufficient system resources
3. Check for competing processes
4. Monitor system performance

#### Memory Issues
```bash
# Check memory usage
docker stats

# Restart Docker
docker system prune
```

## Best Practices

### 1. Release Process
- Always test before release
- Use semantic versioning
- Update documentation
- Create release notes
- Tag git releases

### 2. Quality Assurance
- Run full test suite
- Test on multiple platforms
- Verify Docker images
- Check package integrity
- Validate installation

### 3. Documentation
- Update README.md
- Maintain CHANGELOG.md
- Document breaking changes
- Provide migration guides
- Include troubleshooting

### 4. Security
- Scan for vulnerabilities
- Use secure dependencies
- Validate package contents
- Sign packages (if possible)
- Monitor for security updates

This deployment guide provides comprehensive instructions for packaging, publishing, and distributing the CodeGuard extension. Follow these steps to ensure a successful release and deployment. 