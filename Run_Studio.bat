@echo off
chcp 65001 > nul
title 🎬 Clipchamp Subtitle Studio Pro 🚀

echo ========================================================
echo   ✨ Clipchamp Subtitle Studio Pro Execution ✨
echo   🎬 Motion Subtitle | 📚 Batch ZIP | 📊 Chart | 🎵 Audio Waveform
echo ========================================================
echo.

cd /d "%~dp0"

IF NOT EXIST node_modules (
    echo 📦 Installing dependencies... Please wait...
    call npm install
    echo.
)

echo 🚀 Starting local development server...
echo 🌐 Opening web browser at http://localhost:5173/ ...
echo.

start http://localhost:5173/
call npm run dev

pause
