@echo off
echo Cleaning build directories...
echo.

echo Closing any running Electron apps...
taskkill /F /IM "OC人设盲盒.exe" 2>nul
taskkill /F /IM electron.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Removing dist directories...
if exist "dist" rmdir /s /q "dist"
if exist "dist-electron" rmdir /s /q "dist-electron"

echo.
echo Clean completed!
echo.
echo Now you can run: npm run pack
echo.
pause
