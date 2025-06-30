# ============================================================================
# CURSOR BLUEPRINT ENFORCER - DEVELOPMENT TOOLS INSTALLER
# ============================================================================
# PowerShell script to install all required development tools
# Run as Administrator for best results

Write-Host "🛠️ Installing Development Tools for Cursor Blueprint Enforcer" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Warning "⚠️ Not running as Administrator. Some installations may require elevated privileges."
}

# Function to check if command exists
function Test-Command($command) {
    try {
        if (Get-Command $command -ErrorAction Stop) { return $true }
    }
    catch {
        return $false
    }
}

# Check prerequisites
Write-Host "`n📋 Checking Prerequisites..." -ForegroundColor Yellow

# Check Node.js
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
}
else {
    Write-Host "❌ Node.js not found. Please install Node.js first: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "✅ npm found: v$npmVersion" -ForegroundColor Green
}
else {
    Write-Host "❌ npm not found. Please install Node.js with npm" -ForegroundColor Red
    exit 1
}

# Check winget
if (Test-Command "winget") {
    Write-Host "✅ Windows Package Manager (winget) found" -ForegroundColor Green
}
else {
    Write-Host "❌ winget not found. Please install from Microsoft Store" -ForegroundColor Red
    exit 1
}

# Install Obsidian
Write-Host "`n🗒️ Installing Obsidian..." -ForegroundColor Yellow
try {
    winget install Obsidian.Obsidian --accept-package-agreements --accept-source-agreements
    Write-Host "✅ Obsidian installed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to install Obsidian: $_" -ForegroundColor Red
}

# Install Dendron CLI
Write-Host "`n📚 Installing Dendron CLI..." -ForegroundColor Yellow
try {
    npm install -g @dendronhq/dendron-cli
    Write-Host "✅ Dendron CLI installed successfully" -ForegroundColor Green
    Write-Host "💡 Remember to install Dendron extension in Cursor/VS Code" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Failed to install Dendron CLI: $_" -ForegroundColor Red
}

# Install Graphite CLI
Write-Host "`n🔄 Installing Graphite CLI..." -ForegroundColor Yellow
try {
    npm install -g @withgraphite/graphite-cli
    Write-Host "✅ Graphite CLI installed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to install Graphite CLI: $_" -ForegroundColor Red
}

# Verify installations
Write-Host "`n🔍 Verifying Installations..." -ForegroundColor Yellow

# Check Dendron
if (Test-Command "dendron") {
    Write-Host "✅ Dendron CLI verified" -ForegroundColor Green
}
else {
    Write-Host "❌ Dendron CLI not found in PATH" -ForegroundColor Red
}

# Check Graphite
if (Test-Command "gt") {
    $gtVersion = gt --version
    Write-Host "✅ Graphite CLI verified: v$gtVersion" -ForegroundColor Green
}
else {
    Write-Host "❌ Graphite CLI not found in PATH" -ForegroundColor Red
}

# Initialize Graphite if in a Git repository
if (Test-Path ".git") {
    Write-Host "`n🔧 Initializing Graphite in repository..." -ForegroundColor Yellow
    try {
        echo "main" | gt init
        Write-Host "✅ Graphite initialized with 'main' as trunk branch" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to initialize Graphite: $_" -ForegroundColor Red
    }
}
else {
    Write-Host "💡 Not in a Git repository. Run 'gt init' after cloning the project." -ForegroundColor Cyan
}

# Create Dendron documentation structure if not exists
Write-Host "`n📁 Setting up documentation structure..." -ForegroundColor Yellow
if (-not (Test-Path "docs/dendron")) {
    New-Item -ItemType Directory -Path "docs/dendron" -Force
    Write-Host "✅ Created docs/dendron directory" -ForegroundColor Green
}
else {
    Write-Host "✅ docs/dendron directory already exists" -ForegroundColor Green
}

# Summary
Write-Host "`n🎉 Installation Summary" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host "✅ Obsidian - Knowledge management and note-taking" -ForegroundColor Green
Write-Host "✅ Dendron CLI - Hierarchical documentation" -ForegroundColor Green
Write-Host "✅ Graphite CLI - Stacked PR workflow" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Install Dendron extension in Cursor/VS Code" -ForegroundColor White
Write-Host "2. Create Obsidian vault in project directory" -ForegroundColor White
Write-Host "3. Authenticate Graphite: https://app.graphite.dev/settings/cli" -ForegroundColor White
Write-Host "4. Run 'gt demo' for Graphite tutorial" -ForegroundColor White

Write-Host "`n🔗 Documentation:" -ForegroundColor Yellow
Write-Host "- Tools Guide: TOOLS_INSTALLED.md" -ForegroundColor White
Write-Host "- Environment Setup: ENVIRONMENT_SETUP.md" -ForegroundColor White
Write-Host "- Barton Doctrine: DOCTRINE.md" -ForegroundColor White

Write-Host "`n✨ Development environment setup complete!" -ForegroundColor Green 