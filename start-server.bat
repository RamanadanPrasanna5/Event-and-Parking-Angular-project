@echo off
title Eventro Frontend (Port 4200 ONLY)
echo ========================================================
echo   EVENTRO FRONTEND - STRICTLY PORT 4200
echo ========================================================
echo.
echo Ensuring port 4200 is available...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4200 ^| findstr LISTENING 2^>nul') do (
    echo Note: Cleaning up lingering process on port 4200 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)
echo Port 4200 is clear.
echo Starting Angular Dev Server on http://localhost:4200 ...
echo.
npm start
pause
