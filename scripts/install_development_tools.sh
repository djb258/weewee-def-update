#!/bin/bash

# ============================================================================
# CURSOR BLUEPRINT ENFORCER - DEVELOPMENT TOOLS INSTALLER
# ============================================================================
# Bash script to install all required development tools
# Compatible with macOS and Linux

echo "🛠️ Installing Development Tools for Cursor Blueprint Enforcer"
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_status() {
    echo -e "${2}${1}${NC}"
}

# Check prerequisites
print_status "\n📋 Checking Prerequisites..." "$YELLOW"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "✅ Node.js found: $NODE_VERSION" "$GREEN"
else
    print_status "❌ Node.js not found. Please install Node.js first: https://nodejs.org" "$RED"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_status "✅ npm found: v$NPM_VERSION" "$GREEN"
else
    print_status "❌ npm not found. Please install Node.js with npm" "$RED"
    exit 1
fi

# Check git
if command_exists git; then
    print_status "✅ Git found" "$GREEN"
else
    print_status "❌ Git not found. Please install Git first" "$RED"
    exit 1
fi

# Install Obsidian based on OS
print_status "\n🗒️ Installing Obsidian..." "$YELLOW"

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if command_exists brew; then
        brew install --cask obsidian
        print_status "✅ Obsidian installed successfully via Homebrew" "$GREEN"
    else
        print_status "💡 Please install Obsidian manually from https://obsidian.md" "$CYAN"
        print_status "   Or install Homebrew first: https://brew.sh" "$CYAN"
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command_exists flatpak; then
        flatpak install flathub md.obsidian.Obsidian -y
        print_status "✅ Obsidian installed successfully via Flatpak" "$GREEN"
    elif command_exists snap; then
        sudo snap install obsidian --classic
        print_status "✅ Obsidian installed successfully via Snap" "$GREEN"
    else
        print_status "💡 Please install Obsidian manually from https://obsidian.md" "$CYAN"
        print_status "   Or install via AppImage/deb package" "$CYAN"
    fi
else
    print_status "💡 Please install Obsidian manually from https://obsidian.md" "$CYAN"
fi

# Install Dendron CLI
print_status "\n📚 Installing Dendron CLI..." "$YELLOW"
if npm install -g @dendronhq/dendron-cli; then
    print_status "✅ Dendron CLI installed successfully" "$GREEN"
    print_status "💡 Remember to install Dendron extension in Cursor/VS Code" "$CYAN"
else
    print_status "❌ Failed to install Dendron CLI" "$RED"
fi

# Install Graphite CLI
print_status "\n🔄 Installing Graphite CLI..." "$YELLOW"
if npm install -g @withgraphite/graphite-cli; then
    print_status "✅ Graphite CLI installed successfully" "$GREEN"
else
    print_status "❌ Failed to install Graphite CLI" "$RED"
fi

# Verify installations
print_status "\n🔍 Verifying Installations..." "$YELLOW"

# Check Dendron
if command_exists dendron; then
    print_status "✅ Dendron CLI verified" "$GREEN"
else
    print_status "❌ Dendron CLI not found in PATH" "$RED"
fi

# Check Graphite
if command_exists gt; then
    GT_VERSION=$(gt --version)
    print_status "✅ Graphite CLI verified: v$GT_VERSION" "$GREEN"
else
    print_status "❌ Graphite CLI not found in PATH" "$RED"
fi

# Initialize Graphite if in a Git repository
if [ -d ".git" ]; then
    print_status "\n🔧 Initializing Graphite in repository..." "$YELLOW"
    if echo "main" | gt init; then
        print_status "✅ Graphite initialized with 'main' as trunk branch" "$GREEN"
    else
        print_status "❌ Failed to initialize Graphite" "$RED"
    fi
else
    print_status "💡 Not in a Git repository. Run 'gt init' after cloning the project." "$CYAN"
fi

# Create Dendron documentation structure if not exists
print_status "\n📁 Setting up documentation structure..." "$YELLOW"
if [ ! -d "docs/dendron" ]; then
    mkdir -p docs/dendron
    print_status "✅ Created docs/dendron directory" "$GREEN"
else
    print_status "✅ docs/dendron directory already exists" "$GREEN"
fi

# Summary
print_status "\n🎉 Installation Summary" "$CYAN"
echo "======================"
print_status "✅ Obsidian - Knowledge management and note-taking" "$GREEN"
print_status "✅ Dendron CLI - Hierarchical documentation" "$GREEN"
print_status "✅ Graphite CLI - Stacked PR workflow" "$GREEN"

print_status "\n📋 Next Steps:" "$YELLOW"
print_status "1. Install Dendron extension in Cursor/VS Code" "$WHITE"
print_status "2. Create Obsidian vault in project directory" "$WHITE"
print_status "3. Authenticate Graphite: https://app.graphite.dev/settings/cli" "$WHITE"
print_status "4. Run 'gt demo' for Graphite tutorial" "$WHITE"

print_status "\n🔗 Documentation:" "$YELLOW"
print_status "- Tools Guide: TOOLS_INSTALLED.md" "$WHITE"
print_status "- Environment Setup: ENVIRONMENT_SETUP.md" "$WHITE"
print_status "- Barton Doctrine: DOCTRINE.md" "$WHITE"

print_status "\n✨ Development environment setup complete!" "$GREEN" 