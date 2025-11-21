@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo    OC人设盲盒工具 - GitHub上传助手
echo ==========================================
echo.

REM 检查是否在正确的目录
if not exist "package.json" (
    echo ❌ 错误：请在项目根目录运行此脚本
    echo    当前目录：%CD%
    echo    应该包含：package.json 文件
    pause
    exit /b 1
)

echo ✅ 检测到项目文件
echo.

REM 检查Git是否安装
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未检测到Git
    echo    请先安装Git：https://git-scm.com/download/windows
    pause
    exit /b 1
)

echo ✅ Git已安装
echo.

REM 检查是否已初始化Git
if not exist ".git" (
    echo 🔧 初始化Git仓库...
    git init
    echo ✅ Git仓库初始化完成
    echo.
    
    echo 📝 请输入你的GitHub信息：
    set /p GITHUB_USERNAME="GitHub用户名: "
    set /p GITHUB_EMAIL="GitHub邮箱: "
    
    echo.
    echo 🔧 配置Git用户信息...
    git config --global user.name "%GITHUB_USERNAME%"
    git config --global user.email "%GITHUB_EMAIL%"
    echo ✅ Git用户信息配置完成
    echo.
    
    echo 🔗 添加远程仓库...
    set /p REPO_URL="GitHub仓库地址 (https://github.com/用户名/oc-character-generator.git): "
    git remote add origin %REPO_URL%
    echo ✅ 远程仓库添加完成
    echo.
)

REM 检查是否有未提交的更改
git status --porcelain >nul 2>&1
if errorlevel 1 (
    echo ❌ Git状态检查失败
    pause
    exit /b 1
)

echo 📋 检查文件状态...
git status
echo.

echo 📤 准备上传文件...
echo.

REM 添加所有文件
echo 📁 添加文件到Git...
git add .

REM 显示将要提交的文件
echo.
echo 📋 将要提交的文件：
git status --short
echo.

REM 询问提交信息
set /p COMMIT_MSG="请输入提交信息 (默认: Update project): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Update project

echo.
echo 💾 提交更改...
git commit -m "%COMMIT_MSG%"

if errorlevel 1 (
    echo ❌ 提交失败，可能没有更改需要提交
    echo.
) else (
    echo ✅ 提交成功
    echo.
)

REM 推送到GitHub
echo 🚀 推送到GitHub...
echo.
echo 📝 注意：如果是第一次推送，可能需要输入GitHub用户名和Personal Access Token
echo    Personal Access Token获取地址：https://github.com/settings/tokens
echo.

git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ 推送失败
    echo.
    echo 🔧 可能的解决方案：
    echo    1. 检查网络连接
    echo    2. 确认GitHub仓库地址正确
    echo    3. 确认用户名和Personal Access Token正确
    echo    4. 确认仓库权限设置
    echo.
    echo 💡 如果是认证问题：
    echo    用户名：你的GitHub用户名
    echo    密码：Personal Access Token（不是GitHub密码）
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ 推送成功！
    echo.
    echo 🎉 代码已成功上传到GitHub！
    echo.
    echo 📋 下一步操作：
    echo    1. 访问你的GitHub仓库页面
    echo    2. 点击 "Releases" → "Create a new release"
    echo    3. 运行 npm run dist 打包软件
    echo    4. 上传生成的EXE文件到Release
    echo    5. 更新 public/version.json 中的下载链接
    echo.
    echo 📖 详细说明请查看：GITHUB-UPLOAD-GUIDE.md
    echo.
)

pause
