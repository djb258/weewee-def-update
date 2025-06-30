@echo off
echo ========================================
echo Cursor Blueprint Enforcer - Full Update
echo ========================================
echo.

echo [1/6] Updating npm dependencies...
npm update
if %errorlevel% neq 0 (
    echo ❌ Failed to update dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies updated
echo.

echo [2/6] Fixing security vulnerabilities...
npm audit fix
echo ✅ Security audit completed
echo.

echo [3/6] Fixing linting issues...
npm run lint:fix
echo ✅ Linting fixes applied
echo.

echo [4/6] Building project...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✅ Project built successfully
echo.

echo [5/6] Running tests...
npm test
echo ✅ Tests completed
echo.

echo [6/6] Generating summary...
npm run generate-summary
if %errorlevel% neq 0 (
    echo ❌ Summary generation failed
    pause
    exit /b 1
)
echo ✅ Summary generated
echo.

echo ========================================
echo 🎉 All updates completed successfully!
echo ========================================
echo.
echo What you can do now:
echo - Run: npm run sync-cursor export
echo - Run: ./scripts/simple_gui.bat
echo - Check: LATEST_SUMMARY.md
echo.
pause 