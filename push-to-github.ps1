# PowerShell script to push changes to GitHub
# This script handles Git operations for the CodeGuard project

Write-Host "CodeGuard - GitHub Push Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if Git is available
$gitPath = "C:\Program Files\Git\bin\git.exe"
if (Test-Path $gitPath) {
    Write-Host "Git found at: $gitPath" -ForegroundColor Green
} else {
    Write-Host "Git not found. Please install Git first." -ForegroundColor Red
    exit 1
}

# Initialize Git repository if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    & $gitPath init
}

# Add remote origin if not exists
$remoteExists = & $gitPath remote get-url origin 2>$null
if (-not $remoteExists) {
    Write-Host "Adding remote origin..." -ForegroundColor Yellow
    & $gitPath remote add origin https://github.com/hoda39/CodeGuard.git
}

# Add all files
Write-Host "Adding files to Git..." -ForegroundColor Yellow
& $gitPath add .

# Check if there are changes to commit
$status = & $gitPath status --porcelain
if ($status) {
    Write-Host "Committing changes..." -ForegroundColor Yellow
    & $gitPath commit -m "Add comprehensive documentation and project structure

- Add professional README.md with detailed project overview
- Create comprehensive documentation in docs/ folder
- Add architecture documentation (ARCHITECTURE.md)
- Add installation guide (INSTALLATION.md)
- Add usage guide (USAGE.md)
- Add API reference (API.md)
- Add contributing guidelines (CONTRIBUTING.md)
- Add examples guide (EXAMPLES.md)
- Add security policy (SECURITY.md)
- Add changelog (CHANGELOG.md)
- Add MIT license
- Integrate static and dynamic analysis components
- Professional documentation for security engineers and developers"

    # Get current branch name
    $currentBranch = & $gitPath branch --show-current
    Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan
    
    # Push to GitHub
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    & $gitPath push -u origin $currentBranch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "Repository: https://github.com/hoda39/CodeGuard" -ForegroundColor Cyan
        Write-Host "Branch: $currentBranch" -ForegroundColor Cyan
    } else {
        Write-Host "Failed to push to GitHub. Please check your credentials." -ForegroundColor Red
        Write-Host "You may need to authenticate with GitHub first." -ForegroundColor Yellow
        Write-Host "Try running: git config --global user.name 'Your Name'" -ForegroundColor Yellow
        Write-Host "Try running: git config --global user.email 'your.email@example.com'" -ForegroundColor Yellow
    }
} else {
    Write-Host "No changes to commit." -ForegroundColor Yellow
}

Write-Host "Script completed." -ForegroundColor Green 