#!/bin/bash

# Cursor Blueprint Enforcer - GUI Launcher
# This shell script launches the sync GUI application

echo "Starting Cursor Blueprint Enforcer Sync GUI..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "ERROR: Python is not installed or not in PATH"
        echo "Please install Python from https://python.org"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "ERROR: Please run this script from the cursor-blueprint-enforcer directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed or not in PATH"
    echo "Please install npm (comes with Node.js)"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
fi

# Make the GUI script executable
chmod +x scripts/sync_gui.py

# Launch the GUI
echo "Launching sync GUI..."
$PYTHON_CMD scripts/sync_gui.py

# Check if GUI ran successfully
if [ $? -ne 0 ]; then
    echo
    echo "ERROR: GUI failed to start"
    echo "Please check the error messages above"
    exit 1
fi

echo
echo "GUI closed successfully" 