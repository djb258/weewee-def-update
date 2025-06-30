# Weekly Tool Update Setup Script
# Sets up Windows Task Scheduler to run weekly tool updates

param(
    [switch]$Remove,
    [string]$Time = "09:00",
    [string]$Day = "Sunday"
)

$TaskName = "CursorDevToolsWeeklyUpdate"
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptPath
$UpdateScript = Join-Path $ProjectRoot "scripts\weekly_tool_update.ts"

function Write-ColoredOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

if ($Remove) {
    Write-ColoredOutput "🗑️ Removing weekly update task..." "Yellow"
    
    try {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
        Write-ColoredOutput "✅ Weekly update task removed successfully!" "Green"
    } catch {
        Write-ColoredOutput "❌ Error removing task: $($_.Exception.Message)" "Red"
        exit 1
    }
    exit 0
}

Write-ColoredOutput "🚀 Setting up Weekly Tool Updates" "Cyan"
Write-ColoredOutput "=================================" "Cyan"

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-ColoredOutput "⚠️ This script requires administrator privileges to create scheduled tasks." "Yellow"
    Write-ColoredOutput "Please run PowerShell as Administrator and try again." "Yellow"
    exit 1
}

# Verify required files exist
if (-not (Test-Path $UpdateScript)) {
    Write-ColoredOutput "❌ Update script not found: $UpdateScript" "Red"
    exit 1
}

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-ColoredOutput "✅ Node.js found: $nodeVersion" "Green"
} catch {
    Write-ColoredOutput "❌ Node.js not found. Please ensure Node.js is installed and in PATH." "Red"
    exit 1
}

# Check if tsx is available
try {
    $tsxVersion = npx tsx --version
    Write-ColoredOutput "✅ tsx found: $tsxVersion" "Green"
} catch {
    Write-ColoredOutput "❌ tsx not found. Installing..." "Yellow"
    npm install -g tsx
}

Write-ColoredOutput "📅 Creating scheduled task..." "Blue"

# Remove existing task if it exists
try {
    Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop | Out-Null
    Write-ColoredOutput "🔄 Removing existing task..." "Yellow"
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
} catch {
    # Task doesn't exist, which is fine
}

# Create the action
$Action = New-ScheduledTaskAction -Execute "npx" -Argument "tsx `"$UpdateScript`"" -WorkingDirectory $ProjectRoot

# Create the trigger (weekly)
$Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $Day -At $Time

# Create task settings
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Create the principal (run as current user)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -RunLevel Highest

# Create the task
$Task = New-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal -Description "Weekly update of development tools for Cursor IDE setup"

# Register the task
try {
    Register-ScheduledTask -TaskName $TaskName -InputObject $Task -Force
    Write-ColoredOutput "✅ Weekly update task created successfully!" "Green"
    
    Write-ColoredOutput "`n📋 Task Details:" "Cyan"
    Write-ColoredOutput "  • Task Name: $TaskName" "White"
    Write-ColoredOutput "  • Schedule: Every $Day at $Time" "White"
    Write-ColoredOutput "  • Script: $UpdateScript" "White"
    Write-ColoredOutput "  • Working Directory: $ProjectRoot" "White"
    
    Write-ColoredOutput "`n🔧 Management Commands:" "Cyan"
    Write-ColoredOutput "  • View task: Get-ScheduledTask -TaskName '$TaskName'" "Gray"
    Write-ColoredOutput "  • Run now: Start-ScheduledTask -TaskName '$TaskName'" "Gray"
    Write-ColoredOutput "  • Remove: .\setup_weekly_updates.ps1 -Remove" "Gray"
    Write-ColoredOutput "  • Logs: Check logs/weekly-update.log" "Gray"
    
    Write-ColoredOutput "`n💡 Tips:" "Yellow"
    Write-ColoredOutput "  • The task will run even if you're not logged in" "Gray"
    Write-ColoredOutput "  • Updates will be logged to logs/weekly-update.log" "Gray"
    Write-ColoredOutput "  • You can change the schedule in Task Scheduler" "Gray"
    Write-ColoredOutput "  • Manual run: npm run update-tools" "Gray"
    
} catch {
    Write-ColoredOutput "❌ Error creating scheduled task: $($_.Exception.Message)" "Red"
    exit 1
}

Write-ColoredOutput "`n🎉 Setup complete! Your tools will update automatically every $Day at $Time." "Green" 