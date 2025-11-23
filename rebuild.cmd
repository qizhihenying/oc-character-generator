@echo off
echo ========================================
echo 重新构建 OC 人设盲盒
echo ========================================
echo.

echo [1/3] 清理旧文件...
if exist dist rmdir /s /q dist
if exist dist-electron rmdir /s /q dist-electron
echo 清理完成！
echo.

echo [2/3] 构建前端...
call npm run build
if errorlevel 1 (
    echo 构建失败！
    pause
    exit /b 1
)
echo 前端构建完成！
echo.

echo [3/3] 打包 Electron...
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
call npm run dist
if errorlevel 1 (
    echo 打包失败！
    pause
    exit /b 1
)
echo.

echo ========================================
echo 构建成功！
echo ========================================
echo.
echo 安装程序位置：
echo dist-electron\OC人设盲盒 Setup 2.0.0.exe
echo.
echo 绿色版位置：
echo dist-electron\win-unpacked\OC人设盲盒.exe
echo.
pause
