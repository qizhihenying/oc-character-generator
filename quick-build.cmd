@echo off
cd /d %~dp0
echo Cleaning...
if exist dist rmdir /s /q dist
if exist dist-electron rmdir /s /q dist-electron
echo.
echo Building...
call npm run build
echo.
echo Packaging...
call npx electron-builder --win portable
echo.
echo Done! Check dist-electron folder.
pause
