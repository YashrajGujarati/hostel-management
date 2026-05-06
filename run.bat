@echo off
title Hostel Sphere - Startup
color 0A

echo.
echo =============================================
echo  HOSTEL SPHERE - STARTING SERVERS
echo =============================================
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is NOT installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b
)
echo [OK] Node.js is installed

:: Check if backend node_modules exists
if not exist "%~dp0backend\node_modules" (
    echo.
    echo [SETUP] Installing backend dependencies...
    cd /d "%~dp0backend"
    npm install
    cd /d "%~dp0"
)

:: Check if frontend node_modules exists
if not exist "%~dp0frontend\node_modules" (
    echo.
    echo [SETUP] Installing frontend dependencies...
    cd /d "%~dp0frontend"
    npm install
    cd /d "%~dp0"
)

echo.
echo [1/2] Launching Backend API on port 5000...
start "HOSTEL-BACKEND" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo Waiting for backend to initialize...
timeout /t 4 /nobreak >nul

echo [2/2] Launching Frontend on port 5173...
start "HOSTEL-FRONTEND" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Waiting for frontend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo =============================================
echo  SERVICES STARTED!
echo =============================================
echo.
echo  Frontend (Login):  http://localhost:5173/login
echo  Backend API:       http://localhost:5000/api
echo  Health Check:      http://localhost:5000/api/health
echo.
echo  ADMIN LOGIN:
echo  Email:    admin@hostelsphere.com
echo  Password: admin123
echo.
echo  STUDENT LOGIN:
echo  Email:    banna@hostel.com
echo  Password: banna123
echo =============================================
echo.
echo  Opening browser now...
timeout /t 2 /nobreak >nul
start "" "http://localhost:5173/login"

echo.
echo  [Done] Browser opened! Close this window anytime.
pause
