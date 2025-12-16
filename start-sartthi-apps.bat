@echo off
REM Sartthi Ecosystem - Local Development Script
REM Runs Mail, Calendar, and Vault apps concurrently

echo.
echo ========================================
echo   Sartthi Ecosystem - Local Dev
echo ========================================
echo.
echo Starting all Sartthi apps...
echo.

REM Start all three apps in separate windows
start "Sartthi Mail (Port 3001)" cmd /k "cd sartthi-mail-ui && npm install && npm run dev"
timeout /t 2 /nobreak >nul

start "Sartthi Calendar (Port 3002)" cmd /k "cd sartthi-calendar-ui && npm install && npm run dev"
timeout /t 2 /nobreak >nul

start "Sartthi Vault (Port 3003)" cmd /k "cd sartthi-vault-ui && npm install && npm run dev"

echo.
echo ========================================
echo   All apps are starting!
echo ========================================
echo.
echo   Mail:     http://localhost:3001
echo   Calendar: http://localhost:3002
echo   Vault:    http://localhost:3003
echo.
echo Press any key to close this window...
pause >nul
