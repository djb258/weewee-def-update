#!/bin/bash

# SOP Library Machine Setup Script
# This script sets up any machine for SOP library development

set -e  # Exit on any error

echo "🚀 SOP Library Machine Setup"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

# Check git
if ! command -v git &> /dev/null; then
    echo "❌ git not found. Please install git first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Enable YOLO mode
echo "🚀 Enabling YOLO mode..."
npm run yolo:enable

# Run setup script
echo "🔧 Running machine setup..."
npm run setup:run

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo "✅ Dependencies installed"
echo "✅ YOLO mode enabled"
echo "✅ Development environment configured"
echo ""
echo "🚀 Ready to start development!"
echo ""
echo "Quick commands:"
echo "  npm run dev          # Start development server"
echo "  npm run montecarlo:quick  # Run quick tests"
echo "  npm run yolo:status  # Check YOLO status"
echo ""
echo "📚 See docs/MACHINE_SETUP.md for more information" 