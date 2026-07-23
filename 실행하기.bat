@echo off
chcp 65001 > nul
title 🎬 Clipchamp Subtitle Studio Pro 🚀

echo ========================================================
echo   ✨ Clipchamp Subtitle Studio Pro 실행 중... ✨
echo   🎬 모션 자막 | 📚 대사 일괄생성 | 📊 모션 차트 | 🎵 음파 비주얼라이저
echo ========================================================
echo.

cd /d "%~dp0"

IF NOT EXIST node_modules (
    echo 📦 필요한 라이브러리를 설치하고 있습니다. 잠시만 기다려주세요...
    call npm install
    echo.
)

echo 🚀 개발 서버를 구동합니다...
echo 🌐 잠시 후 웹 브라우저(http://localhost:5173/)가 자동으로 열립니다!
echo 💡 종료하시려면 이 창을 닫아주세요.
echo.

start http://localhost:5173/
call npm run dev

pause
