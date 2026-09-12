@echo off
title EventPark Backend API
echo ========================================================
echo   Starting EventPark ASP.NET Core Web API...
echo   Listening on: http://localhost:5118
echo   Swagger UI  : http://localhost:5118/swagger
echo ========================================================
cd /d "%~dp0Event-Parking-System-final-project\Event  And Parking  Reservation system"
dotnet run --launch-profile http
