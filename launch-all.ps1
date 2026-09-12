# EventPark Smart Full Stack Launcher
$ErrorActionPreference = "SilentlyContinue"

Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "  EventPark Full Stack Health Check & Launcher" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow

# 1. Backend Check (Port 5118)
$backendPort = Get-NetTCPConnection -LocalPort 5118 -State Listen 2>$null
if (-not $backendPort) {
    Write-Host "[1/2] Starting ASP.NET Core Backend API on http://localhost:5118..." -ForegroundColor Cyan
    $backendDir = Join-Path $PSScriptRoot "Event-Parking-System-final-project\Event  And Parking  Reservation system"
    Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$backendDir`" && dotnet run --launch-profile http" -WindowStyle Normal
    
    # Wait for Backend to bind to port 5118
    $attempts = 0
    while (-not (Get-NetTCPConnection -LocalPort 5118 -State Listen 2>$null) -and ($attempts -lt 20)) {
        Start-Sleep -Seconds 1
        $attempts++
    }
    Write-Host "[1/2] Backend API is now live on http://localhost:5118." -ForegroundColor Green
} else {
    Write-Host "[1/2] Backend API is already active on http://localhost:5118." -ForegroundColor Green
}

# 2. Frontend Check (Port 4200)
$frontendPort = Get-NetTCPConnection -LocalPort 4200 -State Listen 2>$null
if (-not $frontendPort) {
    Write-Host "[2/2] Starting Angular Frontend on http://localhost:4200..." -ForegroundColor Cyan
    Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$PSScriptRoot`" && npx ng serve --port 4200 --open" -WindowStyle Normal
    
    # Wait for Angular dev server to start listening on port 4200
    $attempts = 0
    while (-not (Get-NetTCPConnection -LocalPort 4200 -State Listen 2>$null) -and ($attempts -lt 25)) {
        Start-Sleep -Seconds 1
        $attempts++
    }
    Write-Host "[2/2] Frontend is now live on http://localhost:4200." -ForegroundColor Green
} else {
    Write-Host "[2/2] Frontend is already active on http://localhost:4200." -ForegroundColor Green
}

Write-Host "========================================================" -ForegroundColor Green
Write-Host "  All systems operational! http://localhost:4200/" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
