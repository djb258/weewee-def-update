@echo off
REM Cursor Blueprint Enforcer - GUI Launcher
REM This batch file launches the sync GUI application

echo Starting Cursor Blueprint Enforcer Sync GUI...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: Please run this script from the cursor-blueprint-enforcer directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install npm (comes with Node.js)
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Launch the GUI
echo Launching sync GUI...
python scripts/sync_gui.py

REM Check if GUI ran successfully
if errorlevel 1 (
    echo.
    echo ERROR: GUI failed to start
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo GUI closed successfully
pause 