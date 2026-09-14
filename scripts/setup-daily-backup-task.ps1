# ==============================================================================
# SVI Supabase Daily Backup Automation - Windows Task Scheduler Setup
# Registers a scheduled task to take a safe SQL backup every day
# and automatically delete backups older than 7 days (1 week).
# ==============================================================================

param (
    [string]$TaskName = "SVI_Supabase_Daily_Backup",
    [string]$BackupTime = "03:00AM",
    [int]$RetentionDays = 7
)

$ErrorActionPreference = "Stop"

$ProjectDir = (Get-Item -Path "$PSScriptRoot\..").FullName
$ScriptPath = Join-Path $ProjectDir "scripts\export-supabase-backup.mjs"
$LogPath = Join-Path $ProjectDir "backups\backup_automation.log"

# Locate Node executable
$NodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $NodeExe) {
    Write-Error "[ERROR] Node.js executable could not be found in PATH. Please install Node.js."
    exit 1
}

Write-Host ""
Write-Host ">>> Setting up Windows Daily Backup Task..." -ForegroundColor Cyan
Write-Host "Project Directory: $ProjectDir"
Write-Host "Backup Script:     $ScriptPath"
Write-Host "Daily Schedule:    $BackupTime"
Write-Host "Retention Window:  $RetentionDays days (1 week auto-prune)"
Write-Host "Log File:          $LogPath"

# Ensure backups directory exists
$BackupsDir = Join-Path $ProjectDir "backups"
if (-not (Test-Path $BackupsDir)) {
    New-Item -ItemType Directory -Path $BackupsDir -Force | Out-Null
}

# Create a small launcher batch file to capture logs reliably
$BatchLauncher = Join-Path $ProjectDir "scripts\run-daily-backup.bat"
$BatchContent = "@echo off`r`ncd /d `"$ProjectDir`"`r`necho ==================================================== >> `"$LogPath`"`r`necho [Backup Started: %date% %time%] >> `"$LogPath`"`r`n`"$NodeExe`" `"$ScriptPath`" >> `"$LogPath`" 2>&1`r`necho [Backup Finished: %date% %time%] >> `"$LogPath`"`r`necho ==================================================== >> `"$LogPath`"`r`n"

[System.IO.File]::WriteAllText($BatchLauncher, $BatchContent)
Write-Host "[OK] Created launcher script: scripts/run-daily-backup.bat" -ForegroundColor Green

# Define Task Action
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$BatchLauncher`"" -WorkingDirectory $ProjectDir

# Define Task Trigger (Daily at specified time)
$Trigger = New-ScheduledTaskTrigger -Daily -At $BackupTime

# Define Task Settings (Wake machine if needed, catch up if computer was off/asleep)
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 5)

# Register the Scheduled Task
try {
    # Check if task already exists and unregister cleanly
    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Write-Host "[INFO] Updating existing scheduled task '$TaskName'..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false | Out-Null
    }

    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $Action `
        -Trigger $Trigger `
        -Settings $Settings `
        -Description "Daily automated Supabase database backup with 7-day retention for SVI Infra" | Out-Null

    Write-Host ""
    Write-Host "[SUCCESS] Scheduled Task '$TaskName' registered successfully." -ForegroundColor Green
    Write-Host "Schedule: Daily at $BackupTime"
    Write-Host "Note: If the computer is off at $BackupTime, it will automatically run as soon as it turns on."
    Write-Host ""
    Write-Host "Useful commands:"
    Write-Host "  Run backup now:     schtasks /run /tn `"$TaskName`""
    Write-Host "  Check task status:  Get-ScheduledTask -TaskName `"$TaskName`""
    Write-Host "  Remove task:        Unregister-ScheduledTask -TaskName `"$TaskName`" -Confirm:`$false"
    Write-Host ""
} catch {
    Write-Error "[ERROR] Failed to register scheduled task: $_"
}
