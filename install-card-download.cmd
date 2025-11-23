@echo off
chcp 65001 >nul
echo ========================================
echo   安装卡片下载功能
echo ========================================
echo.
echo 正在安装依赖...
echo.

npm install

echo.
echo ========================================
echo   安装完成！
echo ========================================
echo.
echo 现在你可以：
echo 1. 运行 npm run dev 启动开发服务器
echo 2. 或运行 npm run electron:dev 启动桌面版
echo.
echo 功能说明：
echo - 在角色卡片上会出现"下载卡片"按钮
echo - 点击即可将卡片保存为PNG图片
echo - 图片会保存到下载文件夹
echo.
pause
