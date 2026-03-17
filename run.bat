@echo off
echo ==========================================
echo   Hostel Sphere - Starting Services...
echo ==========================================

echo Starting Backend API...
start "Hostel-Backend" cmd /k "cd backend && npm.cmd run dev"

echo Starting Frontend Dev Server...
start "Hostel-Frontend" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo ==========================================
echo   Services are starting in separate tabs!
echo   - Backend: http://localhost:5000
echo   - Frontend: http://localhost:5173
echo ==========================================
echo.
pause
