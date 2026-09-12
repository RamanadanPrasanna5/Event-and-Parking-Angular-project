@echo off
title EventPark Full Stack Launcher
echo ========================================================
echo   Launching EventPark Full Stack Application...
echo   Backend API  : http://localhost:5118 (Swagger: /swagger)
echo   Frontend Web : http://localhost:4200
echo ========================================================
echo.

echo [1/2] Starting ASP.NET Core Web API...
start "EventPark Backend API" cmd /k "cd /d ""%~dp0Event-Parking-System-final-project\Event  And Parking  Reservation system"" && dotnet run --launch-profile http"

echo.
echo Waiting for backend to start...
timeout /t 4 /nobreak >nul

echo.
echo [2/2] Starting Angular Frontend...
cd /d "%~dp0"
call npx ng serve --port 4200 --open

