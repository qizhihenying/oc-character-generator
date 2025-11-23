@echo off
echo Building OC Character Generator...
echo.

REM Check if in correct directory
if not exist "package.json" (
    echo Error: Please run this script in project root directory
    pause
    exit /b 1
)

echo Step 1: Building web app...
call npx vite build
if errorlevel 1 (
    echo Vite build failed
    pause
    exit /b 1
)

echo.
echo Step 2: Building Electron app...
call npx electron-builder --win portable --config.win.sign=false
if errorlevel 1 (
    echo Electron build failed
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo Check dist-electron folder for the executable file.
echo.

dir dist-electron\*.exe /b 2>nul
if errorlevel 1 (
    echo No EXE file found in dist-electron
) else (
    echo EXE files found:
    dir dist-electron\*.exe
)

pause
