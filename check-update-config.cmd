@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo    自动更新配置检查工具
echo ==========================================
echo.

REM 检查项目文件
if not exist "package.json" (
    echo ❌ 错误：请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo ✅ 项目文件检查通过
echo.

REM 检查关键文件
echo 📋 检查关键文件...
echo.

REM 检查 version.json
if exist "public\version.json" (
    echo ✅ public\version.json 存在
    echo 📄 内容预览：
    type "public\version.json"
    echo.
) else (
    echo ❌ public\version.json 不存在
    echo 💡 需要创建此文件以支持自动更新
    echo.
)

REM 检查 updateChecker.ts
if exist "src\utils\updateChecker.ts" (
    echo ✅ src\utils\updateChecker.ts 存在
    echo.
    echo 🔍 检查更新URL配置...
    findstr "updateCheckUrl" "src\utils\updateChecker.ts" >nul
    if errorlevel 1 (
        echo ❌ 未找到 updateCheckUrl 配置
    ) else (
        echo 📄 当前配置：
        findstr "updateCheckUrl" "src\utils\updateChecker.ts"
        echo.
        
        REM 检查是否还是默认配置
        findstr "YOUR_USERNAME" "src\utils\updateChecker.ts" >nul
        if not errorlevel 1 (
            echo ⚠️  警告：检测到默认配置 YOUR_USERNAME
            echo 💡 需要替换为你的实际GitHub用户名
            echo.
        ) else (
            echo ✅ URL配置看起来正确
            echo.
        )
    )
) else (
    echo ❌ src\utils\updateChecker.ts 不存在
    echo 💡 自动更新功能可能未正确集成
    echo.
)

REM 检查版本号一致性
echo 🔍 检查版本号一致性...
echo.

REM 从 package.json 获取版本号
for /f "tokens=2 delims=:, " %%a in ('findstr "version" package.json') do (
    set PACKAGE_VERSION=%%a
    set PACKAGE_VERSION=!PACKAGE_VERSION:"=!
)

echo 📦 package.json 版本: %PACKAGE_VERSION%

REM 从 updateChecker.ts 获取版本号
if exist "src\utils\updateChecker.ts" (
    for /f "tokens=3 delims= '" %%a in ('findstr "currentVersion" "src\utils\updateChecker.ts"') do (
        set CHECKER_VERSION=%%a
        set CHECKER_VERSION=!CHECKER_VERSION:;=!
    )
    echo 🔧 updateChecker.ts 版本: !CHECKER_VERSION!
)

REM 从 version.json 获取版本号
if exist "public\version.json" (
    for /f "tokens=2 delims=:, " %%a in ('findstr "version" "public\version.json"') do (
        set JSON_VERSION=%%a
        set JSON_VERSION=!JSON_VERSION:"=!
    )
    echo 📄 version.json 版本: !JSON_VERSION!
)

echo.

REM 检查 .gitignore
echo 🔍 检查 .gitignore 配置...
if exist ".gitignore" (
    echo ✅ .gitignore 存在
    
    REM 检查关键排除项
    findstr "node_modules" ".gitignore" >nul
    if errorlevel 1 (
        echo ⚠️  警告：.gitignore 中未排除 node_modules
    ) else (
        echo ✅ node_modules 已排除
    )
    
    findstr "dist" ".gitignore" >nul
    if errorlevel 1 (
        echo ⚠️  警告：.gitignore 中未排除 dist 目录
    ) else (
        echo ✅ dist 目录已排除
    )
    echo.
) else (
    echo ❌ .gitignore 不存在
    echo 💡 建议创建 .gitignore 文件
    echo.
)

REM 检查Git配置
echo 🔍 检查Git配置...
if exist ".git" (
    echo ✅ Git仓库已初始化
    
    REM 检查远程仓库
    git remote -v >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  警告：未配置远程仓库
    ) else (
        echo 📡 远程仓库配置：
        git remote -v
    )
    echo.
) else (
    echo ❌ Git仓库未初始化
    echo 💡 运行 git init 初始化仓库
    echo.
)

REM 总结
echo ==========================================
echo 📋 配置检查总结
echo ==========================================
echo.

if exist "public\version.json" (
    if exist "src\utils\updateChecker.ts" (
        findstr "YOUR_USERNAME" "src\utils\updateChecker.ts" >nul
        if errorlevel 1 (
            echo ✅ 自动更新配置基本完整
            echo.
            echo 📋 下一步操作：
            echo    1. 运行 upload-to-github.cmd 上传代码
            echo    2. 在GitHub创建Release并上传EXE文件
            echo    3. 更新 public/version.json 中的下载链接
            echo    4. 提交并推送 version.json 更新
        ) else (
            echo ⚠️  需要完成配置
            echo.
            echo 📋 待完成项目：
            echo    1. 替换 updateChecker.ts 中的 YOUR_USERNAME
            echo    2. 上传代码到GitHub
            echo    3. 创建Release
            echo    4. 更新version.json下载链接
        )
    ) else (
        echo ❌ 缺少关键文件
        echo 💡 请检查 updateChecker.ts 文件
    )
) else (
    echo ❌ 缺少关键文件
    echo 💡 请检查 version.json 文件
)

echo.
echo 📖 详细说明请查看：GITHUB-UPLOAD-GUIDE.md
echo.

pause
