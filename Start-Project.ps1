<#
.SYNOPSIS
    XinBo Project One-Click Startup Script
.DESCRIPTION
    Auto-detect environment, start frontend and backend services, and open browser
    Supports Windows 10 and above
.PARAMETER SkipBrowser
    Skip auto-opening browser
.PARAMETER FrontendOnly
    Start frontend service only
.PARAMETER BackendOnly
    Start backend service only
.EXAMPLE
    .\Start-Project.ps1
    Start all services and open browser
.EXAMPLE
    .\Start-Project.ps1 -SkipBrowser
    Start all services without opening browser
#>

param(
    [switch]$SkipBrowser,
    [switch]$FrontendOnly,
    [switch]$BackendOnly
)

$ErrorActionPreference = "Continue"
$script:processes = @()

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $prefix = "[$timestamp]"
    
    switch ($Type) {
        "Success" {
            Write-Host "$prefix " -NoNewline -ForegroundColor Gray
            Write-Host "[OK] " -NoNewline -ForegroundColor Green
            Write-Host $Message -ForegroundColor White
        }
        "Error" {
            Write-Host "$prefix " -NoNewline -ForegroundColor Gray
            Write-Host "[ERROR] " -NoNewline -ForegroundColor Red
            Write-Host $Message -ForegroundColor Red
        }
        "Warning" {
            Write-Host "$prefix " -NoNewline -ForegroundColor Gray
            Write-Host "[WARN] " -NoNewline -ForegroundColor Yellow
            Write-Host $Message -ForegroundColor Yellow
        }
        "Info" {
            Write-Host "$prefix " -NoNewline -ForegroundColor Gray
            Write-Host "[INFO] " -NoNewline -ForegroundColor Cyan
            Write-Host $Message -ForegroundColor White
        }
        "Step" {
            Write-Host "$prefix " -NoNewline -ForegroundColor Gray
            Write-Host "[STEP] " -NoNewline -ForegroundColor Magenta
            Write-Host $Message -ForegroundColor White
        }
        default {
            Write-Host "$prefix $Message" -ForegroundColor White
        }
    }
}

function Write-Banner {
    param([string]$ProjectName)
    
    $banner = @"

  ==================================================
  
     _  _  _  _  _  _  _  _  _  _  _  _  _  _  _
    | || || || || || || || || || || || || || || |
    | XinBo - Heart Rate Monitoring System       |
    | One-Click Startup Script v1.0.0            |
    |____________________________________________|
    
  ==================================================

"@
    
    Clear-Host
    Write-Host $banner -ForegroundColor Cyan
}

function Test-NodeJS {
    param([string]$MinimumVersion)
    
    Write-ColorOutput "Checking Node.js environment..." "Step"
    
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Node.js not installed"
        }
        
        $versionNumber = $nodeVersion -replace "^v", ""
        $minVersion = [version]$MinimumVersion
        $currentVersion = [version]$versionNumber
        
        if ($currentVersion -lt $minVersion) {
            Write-ColorOutput "Node.js version too low: $nodeVersion (required >= v$MinimumVersion)" "Error"
            Write-ColorOutput "Please visit https://nodejs.org to download latest version" "Info"
            return $false
        }
        
        Write-ColorOutput "Node.js version: $nodeVersion" "Success"
        return $true
    }
    catch {
        Write-ColorOutput "Node.js not detected" "Error"
        Write-ColorOutput "Please visit https://nodejs.org to download and install Node.js" "Info"
        Write-ColorOutput "LTS (Long Term Support) version is recommended" "Info"
        return $false
    }
}

function Test-Npm {
    Write-ColorOutput "Checking npm package manager..." "Step"
    
    try {
        $npmVersion = npm --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "npm not installed"
        }
        
        Write-ColorOutput "npm version: $npmVersion" "Success"
        return $true
    }
    catch {
        Write-ColorOutput "npm not detected" "Error"
        return $false
    }
}

function Test-ProjectStructure {
    param(
        [string]$BasePath,
        [hashtable]$Config
    )
    
    Write-ColorOutput "Checking project directory structure..." "Step"
    
    $allValid = $true
    
    if (-not $FrontendOnly) {
        $backendPath = Join-Path $BasePath $Config.backend.relativePath
        foreach ($file in $Config.backend.requiredFiles) {
            $filePath = Join-Path $backendPath $file
            if (-not (Test-Path $filePath)) {
                Write-ColorOutput "Backend missing required file: $file" "Error"
                $allValid = $false
            }
        }
        if ($allValid) {
            Write-ColorOutput "Backend directory structure is complete" "Success"
        }
    }
    
    if (-not $BackendOnly) {
        $frontendPath = Join-Path $BasePath $Config.frontend.relativePath
        foreach ($file in $Config.frontend.requiredFiles) {
            $filePath = Join-Path $frontendPath $file
            if (-not (Test-Path $filePath)) {
                Write-ColorOutput "Frontend missing required file: $file" "Error"
                $allValid = $false
            }
        }
        if ($allValid) {
            Write-ColorOutput "Frontend directory structure is complete" "Success"
        }
    }
    
    return $allValid
}

function Test-PortInUse {
    param([int]$Port)
    
    $connections = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"
    return ($connections.Count -gt 0)
}

function Get-PortProcess {
    param([int]$Port)
    
    $connection = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"
    if ($connection) {
        $parts = $connection -split "\s+"
        $pid = $parts[-1]
        try {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            return $process
        }
        catch {
            return $null
        }
    }
    return $null
}

function Test-Ports {
    param(
        [hashtable]$Config
    )
    
    Write-ColorOutput "Checking port availability..." "Step"
    
    $portsAvailable = $true
    
    if (-not $FrontendOnly) {
        $frontendPort = $Config.frontend.port
        if (Test-PortInUse -Port $frontendPort) {
            $process = Get-PortProcess -Port $frontendPort
            $processName = if ($process) { $process.ProcessName } else { "Unknown" }
            Write-ColorOutput "Frontend port $frontendPort is in use (Process: $processName)" "Warning"
            Write-ColorOutput "Please close the program using this port or modify the port in config" "Info"
            $portsAvailable = $false
        }
        else {
            Write-ColorOutput "Frontend port $frontendPort is available" "Success"
        }
    }
    
    if (-not $BackendOnly) {
        $backendPort = $Config.backend.port
        if (Test-PortInUse -Port $backendPort) {
            $process = Get-PortProcess -Port $backendPort
            $processName = if ($process) { $process.ProcessName } else { "Unknown" }
            Write-ColorOutput "Backend port $backendPort is in use (Process: $processName)" "Warning"
            Write-ColorOutput "Please close the program using this port or modify the port in config" "Info"
            $portsAvailable = $false
        }
        else {
            Write-ColorOutput "Backend port $backendPort is available" "Success"
        }
    }
    
    return $portsAvailable
}

function Test-NodeModules {
    param(
        [string]$BasePath,
        [hashtable]$Config
    )
    
    Write-ColorOutput "Checking dependency installation status..." "Step"
    
    $needInstall = $false
    
    if (-not $FrontendOnly) {
        $backendPath = Join-Path $BasePath $Config.backend.relativePath
        $nodeModulesPath = Join-Path $backendPath "node_modules"
        if (-not (Test-Path $nodeModulesPath)) {
            Write-ColorOutput "Backend dependencies not installed" "Warning"
            $needInstall = $true
        }
        else {
            Write-ColorOutput "Backend dependencies installed" "Success"
        }
    }
    
    if (-not $BackendOnly) {
        $frontendPath = Join-Path $BasePath $Config.frontend.relativePath
        $nodeModulesPath = Join-Path $frontendPath "node_modules"
        if (-not (Test-Path $nodeModulesPath)) {
            Write-ColorOutput "Frontend dependencies not installed" "Warning"
            $needInstall = $true
        }
        else {
            Write-ColorOutput "Frontend dependencies installed" "Success"
        }
    }
    
    if ($needInstall) {
        Write-ColorOutput "Install dependencies now? (Y/N)" "Info"
        $response = Read-Host
        if ($response -eq "Y" -or $response -eq "y") {
            Install-Dependencies -BasePath $BasePath -Config $Config
        }
        else {
            Write-ColorOutput "Please run 'npm install' manually to install dependencies" "Warning"
            return $false
        }
    }
    
    return $true
}

function Install-Dependencies {
    param(
        [string]$BasePath,
        [hashtable]$Config
    )
    
    Write-ColorOutput "Starting dependency installation..." "Step"
    
    if (-not $FrontendOnly) {
        $backendPath = Join-Path $BasePath $Config.backend.relativePath
        Write-ColorOutput "Installing backend dependencies..." "Info"
        Push-Location $backendPath
        npm install
        Pop-Location
        Write-ColorOutput "Backend dependencies installed" "Success"
    }
    
    if (-not $BackendOnly) {
        $frontendPath = Join-Path $BasePath $Config.frontend.relativePath
        Write-ColorOutput "Installing frontend dependencies..." "Info"
        Push-Location $frontendPath
        npm install
        Pop-Location
        Write-ColorOutput "Frontend dependencies installed" "Success"
    }
}

function Start-BackendService {
    param(
        [string]$BasePath,
        [hashtable]$Config
    )
    
    Write-ColorOutput "Starting backend service..." "Step"
    
    $backendPath = Join-Path $BasePath $Config.backend.relativePath
    $startCommand = $Config.backend.startCommand
    
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "cmd.exe"
    $psi.Arguments = "/c $startCommand"
    $psi.WorkingDirectory = $backendPath
    $psi.UseShellExecute = $true
    $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Normal
    
    try {
        $process = [System.Diagnostics.Process]::Start($psi)
        $script:processes += $process
        Write-ColorOutput "Backend service started (PID: $($process.Id))" "Success"
        Write-ColorOutput "Backend URL: $($Config.backend.url)" "Info"
        return $true
    }
    catch {
        Write-ColorOutput "Backend service failed to start: $_" "Error"
        return $false
    }
}

function Start-FrontendService {
    param(
        [string]$BasePath,
        [hashtable]$Config
    )
    
    Write-ColorOutput "Starting frontend service..." "Step"
    
    $frontendPath = Join-Path $BasePath $Config.frontend.relativePath
    $startCommand = $Config.frontend.startCommand
    
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "cmd.exe"
    $psi.Arguments = "/c $startCommand"
    $psi.WorkingDirectory = $frontendPath
    $psi.UseShellExecute = $true
    $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Normal
    
    try {
        $process = [System.Diagnostics.Process]::Start($psi)
        $script:processes += $process
        Write-ColorOutput "Frontend service started (PID: $($process.Id))" "Success"
        Write-ColorOutput "Frontend URL: $($Config.frontend.url)" "Info"
        return $true
    }
    catch {
        Write-ColorOutput "Frontend service failed to start: $_" "Error"
        return $false
    }
}

function Open-Browser {
    param(
        [string]$Url,
        [int]$Delay
    )
    
    Write-ColorOutput "Waiting for services to start..." "Step"
    Write-ColorOutput "Opening browser in $Delay seconds..." "Info"
    
    for ($i = $Delay; $i -gt 0; $i--) {
        Write-Host "`r  Remaining $i seconds...  " -NoNewline -ForegroundColor Yellow
        Start-Sleep -Seconds 1
    }
    Write-Host ""
    
    Write-ColorOutput "Opening browser..." "Step"
    
    try {
        Start-Process $Url
        Write-ColorOutput "Browser opened: $Url" "Success"
        return $true
    }
    catch {
        Write-ColorOutput "Failed to open browser: $_" "Warning"
        Write-ColorOutput "Please visit manually: $Url" "Info"
        return $false
    }
}

function Show-Status {
    param(
        [hashtable]$Config
    )
    
    Write-Host ""
    Write-Host ("=" * 50) -ForegroundColor DarkGray
    Write-ColorOutput "Services started successfully!" "Success"
    Write-Host ""
    Write-Host "  Access URLs:" -ForegroundColor White
    Write-Host "  +-- Frontend: " -NoNewline -ForegroundColor Gray
    Write-Host $Config.frontend.url -ForegroundColor Cyan
    Write-Host "  +-- Backend:  " -NoNewline -ForegroundColor Gray
    Write-Host $Config.backend.url -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Tips:" -ForegroundColor Yellow
    Write-Host "  +-- Press Ctrl+C to stop all services" -ForegroundColor Gray
    Write-Host "  +-- Closing this window will stop all services" -ForegroundColor Gray
    Write-Host "  +-- Do not close the popup command windows" -ForegroundColor Gray
    Write-Host ""
    Write-Host ("=" * 50) -ForegroundColor DarkGray
}

function Stop-AllServices {
    Write-ColorOutput "Stopping all services..." "Warning"
    
    foreach ($process in $script:processes) {
        try {
            if ($process -and !$process.HasExited) {
                $process.Kill()
                Write-ColorOutput "Process stopped (PID: $($process.Id))" "Info"
            }
        }
        catch {
            Write-ColorOutput "Failed to stop process: $_" "Warning"
        }
    }
}

function Main {
    $scriptPath = $PSScriptRoot
    if ([string]::IsNullOrEmpty($scriptPath)) {
        $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
    }
    
    $configPath = Join-Path $scriptPath "start-config.json"
    
    if (-not (Test-Path $configPath)) {
        Write-ColorOutput "Config file not found: $configPath" "Error"
        Write-ColorOutput "Please ensure start-config.json exists" "Info"
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    try {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json -AsHashtable
    }
    catch {
        Write-ColorOutput "Config file format error: $_" "Error"
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Banner -ProjectName $config.projectName
    
    if (-not (Test-NodeJS -MinimumVersion $config.nodejs.minimumVersion)) {
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    if (-not (Test-Npm)) {
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    if (-not (Test-ProjectStructure -BasePath $scriptPath -Config $config)) {
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    if (-not (Test-Ports -Config $config)) {
        Write-ColorOutput "Port is in use, continue anyway? (Y/N)" "Warning"
        $response = Read-Host
        if ($response -ne "Y" -and $response -ne "y") {
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
    
    if (-not (Test-NodeModules -BasePath $scriptPath -Config $config)) {
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host ""
    Write-Host ("=" * 50) -ForegroundColor DarkGray
    Write-ColorOutput "Starting services..." "Step"
    Write-Host ("=" * 50) -ForegroundColor DarkGray
    Write-Host ""
    
    $success = $true
    
    if (-not $FrontendOnly) {
        if (-not (Start-BackendService -BasePath $scriptPath -Config $config)) {
            $success = $false
        }
    }
    
    if (-not $BackendOnly) {
        if (-not (Start-FrontendService -BasePath $scriptPath -Config $config)) {
            $success = $false
        }
    }
    
    if ($success) {
        if (-not $SkipBrowser -and -not $BackendOnly) {
            Open-Browser -Url $config.browser.url -Delay $config.browser.delaySeconds
        }
        
        Show-Status -Config $config
        
        try {
            Wait-Event -Timeout ([int]::MaxValue)
        }
        catch {
        }
    }
    else {
        Write-ColorOutput "Service startup failed, please check error messages" "Error"
        Read-Host "Press Enter to exit"
        exit 1
    }
}

trap {
    Stop-AllServices
    Write-ColorOutput "Script terminated abnormally" "Error"
    exit 1
}

[Console]::TreatControlCAsInput = $true
while ($true) {
    if ([Console]::KeyAvailable) {
        $key = [Console]::ReadKey($true)
        if (($key.Modifiers -band [ConsoleModifiers]::Control) -and ($key.Key -eq "C")) {
            Write-Host ""
            Stop-AllServices
            Write-ColorOutput "User cancelled" "Warning"
            exit 0
        }
    }
    Start-Sleep -Milliseconds 100
    
    if ($script:processes.Count -gt 0) {
        $allExited = $true
        foreach ($process in $script:processes) {
            if ($process -and !$process.HasExited) {
                $allExited = $false
                break
            }
        }
        if ($allExited) {
            Write-ColorOutput "All services have stopped" "Warning"
            exit 0
        }
    }
}

Main
