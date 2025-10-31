@echo off
echo ========================================
echo   Rebuilding Saarthi Desktop App
echo   (with OAuth fixes)
echo ========================================
echo.

cd "D:\YASH\MERN DESKTOP"

echo [*] Building desktop application with OAuth support...
node bin\mernpkg.js build --config saarthi.config.json --platforms windows --arch x64 --verbose

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Output: D:\YASH\Project Management\dist
echo.
echo Next: Run the desktop app and test Google Sign-In
pause
