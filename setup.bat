@echo off
setlocal enabledelayedexpansion

echo 🚀 SOP Library Machine Setup
echo ==============================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Check prerequisites
echo 🔍 Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js v18+ first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found. Please install npm first.
    pause
    exit /b 1
)

REM Check git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ git not found. Please install git first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Enable YOLO mode
echo 🚀 Enabling YOLO mode...
call npm run yolo:enable
if errorlevel 1 (
    echo ❌ Failed to enable YOLO mode
    pause
    exit /b 1
)

REM Run setup script
echo 🔧 Running machine setup...
call npm run setup:run
if errorlevel 1 (
    echo ❌ Failed to run machine setup
    pause
    exit /b 1
)

echo.
echo 🎉 Setup complete!
echo ==================
echo ✅ Dependencies installed
echo ✅ YOLO mode enabled
echo ✅ Development environment configured
echo.
echo 🚀 Ready to start development!
echo.
echo Quick commands:
echo   npm run dev          # Start development server
echo   npm run montecarlo:quick  # Run quick tests
echo   npm run yolo:status  # Check YOLO status
echo.
echo 📚 See docs/MACHINE_SETUP.md for more information
pause 