@echo off
chcp 65001 >nul
echo ========================================
echo Build OC Character Generator v2.2.0
echo ========================================
echo.

echo [1/3] Cleaning old files...
if exist dist rmdir /s /q dist
if exist dist-electron rmdir /s /q dist-electron
echo Clean completed!
echo.

echo [2/3] Building frontend...
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)
echo Frontend build completed!
echo.

echo [3/3] Packaging Electron...
call npx electron-builder --win portable
if errorlevel 1 (
    echo Package failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Build Success!
echo ========================================
echo.
echo Portable version location:
echo dist-electron\OC-Character-Generator-Portable.exe
echo.
echo New features:
echo - Midjourney API Integration
echo - Auto Drawing
echo - U/V/Reroll Operations
echo - Gallery Display
echo.
pause
