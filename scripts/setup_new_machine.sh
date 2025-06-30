#!/bin/bash

# Cursor Blueprint Enforcer - New Machine Setup Script
# This script sets up a new machine with all configurations and tools

set -e  # Exit on any error

echo "🚀 Setting up Cursor Blueprint Enforcer on new machine..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js (v16 or higher) first."
        print_status "Download from: https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm not found. Please install npm first."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f env.template ]; then
            cp env.template .env
            print_warning "Created .env from template. Please edit it with your actual credentials."
        else
            print_error "env.template not found. Please create a .env file manually."
            exit 1
        fi
    else
        print_success ".env file already exists"
    fi
}

# Import Cursor configuration
import_cursor_config() {
    print_status "Importing Cursor configuration..."
    
    if [ -d "cursor-config" ]; then
        npm run sync-cursor import
        print_success "Cursor configuration imported"
    else
        print_warning "cursor-config directory not found. Skipping Cursor import."
        print_status "You can import Cursor config later with: npm run sync-cursor import"
    fi
}

# Import machine sync configuration
import_machine_config() {
    print_status "Importing machine sync configuration..."
    
    if [ -f "machine-sync-config.json" ]; then
        npm run sync-machines
        print_success "Machine sync configuration imported"
    else
        print_warning "machine-sync-config.json not found. Skipping machine sync import."
        print_status "You can create machine sync config later with: npm run sync-machines"
    fi
}

# Import tool sync configuration
import_tool_config() {
    print_status "Importing tool sync configuration..."
    
    if [ -f "tool-sync-config.json" ]; then
        npm run sync-tools
        print_success "Tool sync configuration imported"
    else
        print_warning "tool-sync-config.json not found. Skipping tool sync import."
        print_status "You can create tool sync config later with: npm run sync-tools"
    fi
}

# Validate setup
validate_setup() {
    print_status "Validating setup..."
    
    # Check if all required files exist
    local missing_files=()
    
    if [ ! -f "package.json" ]; then missing_files+=("package.json"); fi
    if [ ! -f ".env" ]; then missing_files+=(".env"); fi
    if [ ! -f "src/index.ts" ]; then missing_files+=("src/index.ts"); fi
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        print_error "Missing required files: ${missing_files[*]}"
        return 1
    fi
    
    # Test build
    print_status "Testing TypeScript build..."
    if npm run build; then
        print_success "TypeScript build successful"
    else
        print_error "TypeScript build failed"
        return 1
    fi
    
    # Test linting
    print_status "Testing code linting..."
    if npm run lint; then
        print_success "Code linting passed"
    else
        print_warning "Code linting failed (this is okay for initial setup)"
    fi
    
    print_success "Setup validation completed"
}

# Test tool integrations
test_integrations() {
    print_status "Testing tool integrations..."
    
    local failed_tests=()
    
    # Test Google Workspace
    if npm run google:health &> /dev/null; then
        print_success "Google Workspace: OK"
    else
        print_warning "Google Workspace: Failed (check your .env configuration)"
        failed_tests+=("Google Workspace")
    fi
    
    # Test MindPal
    if npm run mindpal:health &> /dev/null; then
        print_success "MindPal: OK"
    else
        print_warning "MindPal: Failed (check your .env configuration)"
        failed_tests+=("MindPal")
    fi
    
    # Test DeerFlow
    if npm run deerflow:health &> /dev/null; then
        print_success "DeerFlow: OK"
    else
        print_warning "DeerFlow: Failed (check your .env configuration)"
        failed_tests+=("DeerFlow")
    fi
    
    # Test Render
    if npm run render:health &> /dev/null; then
        print_success "Render: OK"
    else
        print_warning "Render: Failed (check your .env configuration)"
        failed_tests+=("Render")
    fi
    
    # Test Make.com
    if npm run make:health &> /dev/null; then
        print_success "Make.com: OK"
    else
        print_warning "Make.com: Failed (check your .env configuration)"
        failed_tests+=("Make.com")
    fi
    
    if [ ${#failed_tests[@]} -gt 0 ]; then
        print_warning "Some integrations failed: ${failed_tests[*]}"
        print_status "You can configure these later by editing your .env file"
    else
        print_success "All integrations working correctly"
    fi
}

# Generate summary
generate_summary() {
    print_status "Generating project summary..."
    npm run generate-summary
    print_success "Project summary generated"
}

# Show next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed! Here are your next steps:"
    echo ""
    echo "1. Edit your .env file with actual credentials:"
    echo "   nano .env"
    echo ""
    echo "2. Test individual tools:"
    echo "   npm run google:health"
    echo "   npm run mindpal:health"
    echo "   npm run deerflow:health"
    echo "   npm run render:health"
    echo "   npm run make:health"
    echo ""
    echo "3. Run the main application:"
    echo "   npm run dev src/index.ts"
    echo ""
    echo "4. Sync with other machines:"
    echo "   npm run sync-machines"
    echo ""
    echo "5. View project summary:"
    echo "   cat LATEST_SUMMARY.md"
    echo ""
    echo "📚 Documentation: README.md"
    echo "🔧 Configuration: .env"
    echo "📊 Status: LATEST_SUMMARY.md"
}

# Main setup function
main() {
    echo "=========================================="
    echo "  Cursor Blueprint Enforcer Setup"
    echo "=========================================="
    echo ""
    
    check_nodejs
    check_npm
    install_dependencies
    setup_environment
    import_cursor_config
    import_machine_config
    import_tool_config
    validate_setup
    test_integrations
    generate_summary
    show_next_steps
    
    echo ""
    print_success "Setup completed successfully! 🚀"
}

# Run main function
main "$@" 