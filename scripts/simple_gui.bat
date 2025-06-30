@echo off
echo Starting Simple Cursor Blueprint Enforcer GUI...
echo.

REM Try to find Python in common locations
set PYTHON_CMD=

REM Check if python is in PATH
python --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python
    goto :found_python
)

REM Check if python3 is in PATH
python3 --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python3
    goto :found_python
)

REM Try common Python installation paths
if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python313\python.exe" (
    set PYTHON_CMD=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python313\python.exe
    goto :found_python
)

if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\python.exe" (
    set PYTHON_CMD=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\python.exe
    goto :found_python
)

if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\python.exe" (
    set PYTHON_CMD=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\python.exe
    goto :found_python
)

echo ERROR: Python not found!
echo.
echo Please ensure Python is installed and in your PATH, or install Python from:
echo https://www.python.org/downloads/
echo.
echo Make sure to check "Add Python to PATH" during installation.
echo.
pause
exit /b 1

:found_python
echo Found Python: %PYTHON_CMD%
echo.

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0
set GUI_SCRIPT=%SCRIPT_DIR%simple_gui.py

REM Check if the GUI script exists
if not exist "%GUI_SCRIPT%" (
    echo ERROR: GUI script not found at %GUI_SCRIPT%
    echo.
    pause
    exit /b 1
)

echo Starting Simple GUI...
echo.

REM Run the Python GUI script
"%PYTHON_CMD%" "%GUI_SCRIPT%"

REM Check if the script ran successfully
if %errorlevel% neq 0 (
    echo.
    echo ERROR: GUI script failed to run properly.
    echo.
    pause
    exit /b 1
)

echo.
echo GUI closed successfully.
pause 