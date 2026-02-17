@echo off
chcp 65001 >nul 2>&1
title XinBo - One-Click Start
color 0A

echo.
echo  ==================================================
echo.
echo     XinBo - Heart Rate Monitoring System
echo     One-Click Startup Script v1.0.0
echo.
echo  ==================================================
echo.

:: Get script directory
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

:: Check Node.js
echo [STEP] Checking Node.js environment...
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js not detected!
    echo [INFO] Please visit https://nodejs.org to download and install Node.js
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [OK] Node.js version: %NODE_VER%

:: Check npm
echo [STEP] Checking npm package manager...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] npm not detected!
    echo [INFO] Please reinstall Node.js
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo [OK] npm version: %NPM_VER%

:: Check project structure
echo [STEP] Checking project directory structure...
if not exist "package.json" (
    color 0C
    echo [ERROR] Frontend package.json not found!
    pause
    exit /b 1
)
if not exist "server\package.json" (
    color 0C
    echo [ERROR] Backend package.json not found!
    pause
    exit /b 1
)
echo [OK] Project directory structure is complete

:: Check dependencies
echo [STEP] Checking dependency installation status...
if not exist "node_modules" (
    echo [WARN] Frontend dependencies not installed
    echo [INFO] Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
)
if not exist "server\node_modules" (
    echo [WARN] Backend dependencies not installed
    echo [INFO] Installing backend dependencies...
    cd server
    call npm install
    cd ..
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    )
)
echo [OK] Dependencies installed

:: Start services
echo.
echo ==================================================
echo [STEP] Starting services...
echo ==================================================
echo.

:: Start backend service
echo [STEP] Starting backend service...
start "XinBo Backend" cmd /c "cd /d "%SCRIPT_DIR%server" && npm run start"
echo [OK] Backend service started on port 8080

:: Wait a moment
timeout /t 2 /nobreak >nul

:: Start frontend service
echo [STEP] Starting frontend service...
start "XinBo Frontend" cmd /c "cd /d "%SCRIPT_DIR%" && npm run dev"
echo [OK] Frontend service started on port 5173

:: Wait for services to start
echo.
echo [INFO] Waiting for services to start...
timeout /t 5 /nobreak >nul

:: Open browser
echo [STEP] Opening browser...
start http://localhost:5173

echo.
echo ==================================================
echo [OK] Services started successfully!
echo ==================================================
echo.
echo   Access URLs:
echo   +-- Frontend: http://localhost:5173
echo   +-- Backend:  ws://localhost:8080
echo.
echo   Tips:
echo   +-- Close this window will NOT stop services
echo   +-- Close the popup windows to stop services
echo   +-- Press Ctrl+C in popup windows to stop
echo.
echo ==================================================
echo.
echo Press any key to exit this window...
pause >nul
