@echo off
setlocal enabledelayedexpansion
title Clipchamp Subtitle Studio Pro

cd /d "%~dp0"

echo ========================================================
echo   Clipchamp Subtitle Studio Pro
echo   1-Click Execution Script
echo ========================================================
echo.

if not exist node_modules (
    echo [INFO] Installing required dependencies...
    call npm install
    echo.
)

echo [INFO] Launching local dev server...
echo [INFO] Web browser will open automatically at http://localhost:5173/
echo [INFO] To stop the server, close this window.
echo.

start http://localhost:5173/
call npm run dev

pause
