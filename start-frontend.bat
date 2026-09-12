@echo off
title EventPark Frontend
echo ========================================================
echo   Starting EventPark Angular Application...
echo   Listening on: http://localhost:4200
echo ========================================================
cd /d "%~dp0"
call npx ng serve --port 4200 --open
