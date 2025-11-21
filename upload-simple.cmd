@echo off
echo.
echo ==========================================
echo    GitHub Upload Helper
echo ==========================================
echo.

REM Check if in correct directory
if not exist "package.json" (
    echo Error: Please run this script in project root directory
    echo Current directory: %CD%
    echo Should contain: package.json file
    pause
    exit /b 1
)

echo Project files detected
echo.

REM Check Git installation
git --version >nul 2>&1
if errorlevel 1 (
    echo Error: Git not detected
    echo Please install Git: https://git-scm.com/download/windows
    pause
    exit /b 1
)

echo Git is installed
echo.

REM Initialize Git if needed
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo Git repository initialized
    echo.
    
    echo Please enter your GitHub information:
    set /p GITHUB_USERNAME="GitHub Username: "
    set /p GITHUB_EMAIL="GitHub Email: "
    
    echo.
    echo Configuring Git user info...
    git config --global user.name "%GITHUB_USERNAME%"
    git config --global user.email "%GITHUB_EMAIL%"
    echo Git user info configured
    echo.
    
    echo Adding remote repository...
    echo Enter your repository URL: https://github.com/qizhihenying/oc-character-generator.git
    set /p REPO_URL="Repository URL: "
    git remote add origin %REPO_URL%
    echo Remote repository added
    echo.
)

echo Checking file status...
git status
echo.

echo Adding files to Git...
git add .

echo.
echo Files to be committed:
git status --short
echo.

set /p COMMIT_MSG="Enter commit message (default: Initial commit): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Initial commit

echo.
echo Committing changes...
git commit -m "%COMMIT_MSG%"

if errorlevel 1 (
    echo Commit failed, maybe no changes to commit
    echo.
) else (
    echo Commit successful
    echo.
)

echo Pushing to GitHub...
echo.
echo Note: You may need to enter GitHub username and Personal Access Token
echo Personal Access Token: https://github.com/settings/tokens
echo.

git push -u origin main

if errorlevel 1 (
    echo.
    echo Push failed
    echo.
    echo Possible solutions:
    echo 1. Check network connection
    echo 2. Verify GitHub repository URL
    echo 3. Verify username and Personal Access Token
    echo 4. Verify repository permissions
    echo.
    echo For authentication:
    echo Username: qizhihenying
    echo Password: Personal Access Token (not GitHub password)
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo Push successful!
    echo.
    echo Code uploaded to GitHub successfully!
    echo.
    echo Next steps:
    echo 1. Visit your GitHub repository page
    echo 2. Click "Releases" - "Create a new release"
    echo 3. Run "npm run dist" to build software
    echo 4. Upload generated EXE file to Release
    echo 5. Update public/version.json with download link
    echo.
    echo See GITHUB-UPLOAD-GUIDE.md for details
    echo.
)

pause
