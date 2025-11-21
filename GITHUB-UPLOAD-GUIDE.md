# GitHub 上传完整指南 - 实现在线更新

## 🎯 目标
将代码上传到 GitHub，实现软件的在线自动更新功能

---

## 📋 准备工作

### 1. 确认需要上传的文件

#### ✅ **必须上传的文件**
```
📁 项目根目录/
├── 📁 src/                    # 源代码目录
│   ├── 📁 components/         # React 组件
│   ├── 📁 data/              # 数据文件
│   ├── 📁 utils/             # 工具函数
│   ├── App.tsx               # 主应用
│   ├── main.tsx              # 入口文件
│   └── index.css             # 样式文件
├── 📁 electron/              # Electron 相关
│   ├── main.js               # 主进程
│   └── preload.js            # 预加载脚本
├── 📁 public/                # 公共资源
│   ├── version.json          # 版本信息（重要！）
│   └── icon.svg              # 应用图标
├── package.json              # 项目配置
├── vite.config.ts            # 构建配置
├── tsconfig.json             # TypeScript 配置
├── tailwind.config.js        # Tailwind 配置
├── postcss.config.js         # PostCSS 配置
├── index.html                # HTML 模板
├── README.md                 # 项目说明
├── .gitignore                # Git 忽略文件
└── 📁 文档文件/
    ├── ADVANCED-OPTIONS-GUIDE.md
    ├── AUTO-UPDATE-GUIDE.md
    ├── CONSISTENCY-GUIDE.md
    └── 其他 .md 文件
```

#### ❌ **不要上传的文件**
```
📁 不要上传/
├── 📁 node_modules/          # 依赖包（太大）
├── 📁 dist/                  # 构建输出
├── 📁 dist-electron/         # Electron 构建输出
├── 📁 .vscode/               # 编辑器配置
├── 📁 .git/                  # Git 历史（自动处理）
├── *.log                     # 日志文件
├── .env                      # 环境变量
└── 临时文件
```

### 2. 检查 .gitignore 文件

确认 `.gitignore` 文件内容正确：

```gitignore
# 依赖包
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 构建输出
dist/
dist-electron/
build/

# 环境变量
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 编辑器
.vscode/
.idea/
*.swp
*.swo

# 系统文件
.DS_Store
Thumbs.db

# 日志
*.log
logs/

# 临时文件
*.tmp
*.temp
```

---

## 🚀 步骤1：创建 GitHub 仓库

### 1.1 在 GitHub 网站创建仓库

1. **访问 GitHub**
   ```
   https://github.com
   ```

2. **登录账号**
   - 如果没有账号，先注册一个

3. **创建新仓库**
   - 点击右上角 "+" → "New repository"
   - 或直接访问：https://github.com/new

4. **填写仓库信息**
   ```
   Repository name: oc-character-generator
   Description: OC人设盲盒工具 - 随机生成AI图像提示词
   
   ✅ Public（必须选择公开，否则无法实现在线更新）
   ❌ Add a README file（我们已经有了）
   ❌ Add .gitignore（我们已经有了）
   ❌ Choose a license（可选）
   ```

5. **点击 "Create repository"**

### 1.2 记录仓库信息

创建成功后，记录以下信息：
```
仓库地址：https://github.com/你的用户名/oc-character-generator
用户名：你的GitHub用户名
仓库名：oc-character-generator
```

---

## 🔧 步骤2：配置本地 Git

### 2.1 检查 Git 是否安装

打开命令提示符（CMD）或 PowerShell：

```bash
git --version
```

如果显示版本号，说明已安装。如果没有，请下载安装：
```
https://git-scm.com/download/windows
```

### 2.2 配置 Git 用户信息

```bash
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱@example.com"
```

**示例：**
```bash
git config --global user.name "张三"
git config --global user.email "zhangsan@gmail.com"
```

### 2.3 验证配置

```bash
git config --global user.name
git config --global user.email
```

---

## 📤 步骤3：上传代码到 GitHub

### 3.1 在项目目录初始化 Git

打开命令提示符，进入项目目录：

```bash
# 进入项目目录
cd C:\Users\邱\CascadeProjects\oc-character-generator

# 初始化 Git 仓库
git init
```

### 3.2 添加远程仓库

```bash
# 添加远程仓库（替换为你的用户名）
git remote add origin https://github.com/你的用户名/oc-character-generator.git
```

**示例：**
```bash
git remote add origin https://github.com/zhangsan/oc-character-generator.git
```

### 3.3 添加文件到 Git

```bash
# 添加所有文件
git add .

# 检查状态
git status
```

你应该看到类似这样的输出：
```
Changes to be committed:
  new file:   .gitignore
  new file:   README.md
  new file:   package.json
  new file:   src/App.tsx
  ... 更多文件
```

### 3.4 提交代码

```bash
# 提交代码
git commit -m "Initial commit - OC人设盲盒工具 v1.3.0"
```

### 3.5 推送到 GitHub

```bash
# 设置主分支
git branch -M main

# 推送代码
git push -u origin main
```

**如果遇到认证问题：**

1. **使用 Personal Access Token（推荐）**
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 选择权限：repo（完整仓库权限）
   - 复制生成的 token
   - 在推送时使用 token 作为密码

2. **或者使用 GitHub Desktop**
   - 下载：https://desktop.github.com/
   - 图形化界面，更简单

---

## 🔄 步骤4：配置自动更新

### 4.1 修改更新检查 URL

编辑 `src/utils/updateChecker.ts` 文件：

```typescript
export class UpdateChecker {
  private currentVersion = '1.3.0';
  // 替换为你的 GitHub 用户名
  private updateCheckUrl = 'https://raw.githubusercontent.com/你的用户名/oc-character-generator/main/public/version.json';
  
  // ... 其他代码
}
```

**示例：**
```typescript
private updateCheckUrl = 'https://raw.githubusercontent.com/zhangsan/oc-character-generator/main/public/version.json';
```

### 4.2 更新 version.json

编辑 `public/version.json` 文件：

```json
{
  "version": "1.3.0",
  "releaseDate": "2025-11-21",
  "downloadUrl": "https://github.com/你的用户名/oc-character-generator/releases/download/v1.3.0/OC人设盲盒-Setup-1.3.0.exe",
  "changelog": [
    "新增高级选项系统（6大类45个选项）",
    "新增自动更新功能",
    "新增人物一致性模式",
    "优化中文提示词格式"
  ],
  "forceUpdate": false
}
```

**注意：** downloadUrl 现在还不存在，我们稍后创建 Release 时会生成。

### 4.3 提交更新

```bash
# 添加修改的文件
git add src/utils/updateChecker.ts public/version.json

# 提交
git commit -m "Configure auto-update URLs"

# 推送
git push
```

---

## 📦 步骤5：创建第一个 Release

### 5.1 打包软件

在项目目录运行：

```bash
# 安装依赖（如果还没安装）
npm install

# 打包软件
npm run dist
```

等待打包完成，会在 `dist-electron` 目录生成 EXE 文件。

### 5.2 在 GitHub 创建 Release

1. **访问你的仓库页面**
   ```
   https://github.com/你的用户名/oc-character-generator
   ```

2. **点击 "Releases"**
   - 在仓库页面右侧找到 "Releases"
   - 点击 "Create a new release"

3. **填写 Release 信息**
   ```
   Tag version: v1.3.0
   Release title: v1.3.0 - 高级选项系统
   
   Description:
   ## 🎉 新功能
   - ✅ 高级选项系统（6大类45个选项）
   - ✅ 自动更新功能
   - ✅ 人物一致性模式
   - ✅ 特征锁定功能
   
   ## 🎨 高级选项包括
   - 颜色主题（8个选项）
   - 年龄段（6个选项）
   - 体型（7个选项）
   - 表情情绪（8个选项）
   - 特殊效果（8个选项）
   - 场景氛围（8个选项）
   
   ## 📥 下载说明
   下载 `OC人设盲盒-Setup-1.3.0.exe` 并运行安装。
   
   ## 🔄 自动更新
   软件现在支持自动检测更新，启动时会自动检查新版本。
   ```

4. **上传 EXE 文件**
   - 点击 "Attach binaries by dropping them here or selecting them"
   - 选择 `dist-electron` 目录中的 EXE 文件
   - 通常文件名类似：`OC人设盲盒 Setup 1.3.0.exe`

5. **发布 Release**
   - 确认信息无误
   - 点击 "Publish release"

### 5.3 获取下载链接

发布成功后：

1. **找到 EXE 文件**
   - 在 Release 页面找到上传的 EXE 文件

2. **复制下载链接**
   - 右键点击 EXE 文件
   - 选择 "复制链接地址"
   - 链接格式类似：
     ```
     https://github.com/你的用户名/oc-character-generator/releases/download/v1.3.0/OC人设盲盒-Setup-1.3.0.exe
     ```

### 5.4 更新 version.json

用获取的下载链接更新 `public/version.json`：

```json
{
  "version": "1.3.0",
  "releaseDate": "2025-11-21",
  "downloadUrl": "刚才复制的完整下载链接",
  "changelog": [
    "新增高级选项系统（6大类45个选项）",
    "新增自动更新功能",
    "新增人物一致性模式",
    "优化中文提示词格式"
  ],
  "forceUpdate": false
}
```

提交更新：

```bash
git add public/version.json
git commit -m "Update download URL in version.json"
git push
```

---

## ✅ 步骤6：测试自动更新

### 6.1 测试更新检查

1. **临时修改版本号**
   
   编辑 `src/utils/updateChecker.ts`：
   ```typescript
   private currentVersion = '1.0.0'; // 临时改为较低版本
   ```

2. **运行开发版本**
   ```bash
   npm run electron:dev
   ```

3. **验证更新通知**
   - 软件启动后应该显示更新通知
   - 显示版本 v1.3.0
   - 显示更新内容
   - 点击"立即下载"应该打开下载链接

4. **恢复版本号**
   ```typescript
   private currentVersion = '1.3.0'; // 恢复正确版本
   ```

### 6.2 测试下载链接

1. **直接访问下载链接**
   - 复制 version.json 中的 downloadUrl
   - 在浏览器中打开
   - 应该直接开始下载 EXE 文件

2. **测试安装**
   - 下载完成后运行 EXE
   - 验证安装过程
   - 确认软件正常启动

---

## 🔄 步骤7：发布新版本的流程

以后每次发布新版本，按以下流程：

### 7.1 开发完成后

```bash
# 1. 更新版本号
# 编辑 package.json: "version": "1.4.0"
# 编辑 src/utils/updateChecker.ts: currentVersion = '1.4.0'
# 编辑 src/App.tsx: 版本显示

# 2. 提交代码
git add .
git commit -m "Release v1.4.0 - 新功能描述"
git push
```

### 7.2 打包和发布

```bash
# 3. 打包
npm run dist

# 4. 在 GitHub 创建新 Release
# - Tag: v1.4.0
# - 上传新的 EXE 文件
# - 复制下载链接

# 5. 更新 version.json
# - version: "1.4.0"
# - downloadUrl: 新的下载链接
# - changelog: 更新内容

# 6. 提交 version.json
git add public/version.json
git commit -m "Update version.json for v1.4.0"
git push
```

### 7.3 等待生效

- GitHub Raw 文件有缓存，通常5-10分钟后生效
- 用户下次启动软件时会收到更新通知

---

## 🛠️ 常见问题解决

### Q1: git push 时要求输入用户名密码

**解决方案：**

1. **使用 Personal Access Token**
   ```
   用户名: 你的GitHub用户名
   密码: 生成的Personal Access Token（不是GitHub密码）
   ```

2. **生成 Token 步骤：**
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 选择 "repo" 权限
   - 复制生成的 token

### Q2: 更新通知不显示

**检查清单：**
1. ✅ GitHub 仓库是否为 Public？
2. ✅ updateChecker.ts 中的 URL 是否正确？
3. ✅ version.json 是否在 public 目录？
4. ✅ version.json 中的版本号是否大于当前版本？
5. ✅ 等待5-10分钟让 GitHub 缓存更新

### Q3: 下载链接打不开

**检查清单：**
1. ✅ Release 是否已发布（不是草稿）？
2. ✅ EXE 文件是否已上传？
3. ✅ 链接是否为直接下载链接？

### Q4: 文件太大无法上传

**解决方案：**
1. 确认 .gitignore 正确配置
2. 不要上传 node_modules 和 dist 目录
3. 使用 Git LFS 处理大文件（如果需要）

### Q5: 中文文件名乱码

**解决方案：**
```bash
# 配置 Git 支持中文
git config --global core.quotepath false
git config --global gui.encoding utf-8
git config --global i18n.commit.encoding utf-8
git config --global i18n.logoutputencoding utf-8
```

---

## 📋 完整检查清单

### 上传前检查

- [ ] .gitignore 文件配置正确
- [ ] 删除了 node_modules 目录
- [ ] 删除了 dist 和 dist-electron 目录
- [ ] version.json 在 public 目录
- [ ] updateChecker.ts 中的 URL 已更新

### GitHub 配置检查

- [ ] 仓库设置为 Public
- [ ] 仓库名称正确
- [ ] Personal Access Token 已生成
- [ ] Git 用户信息已配置

### Release 检查

- [ ] Tag 版本号格式正确（v1.3.0）
- [ ] EXE 文件已上传
- [ ] 下载链接可以正常访问
- [ ] version.json 已更新下载链接

### 测试检查

- [ ] 更新通知正常显示
- [ ] 下载链接正常工作
- [ ] 安装程序正常运行
- [ ] 软件功能正常

---

## 🎉 完成！

现在你的软件已经支持在线自动更新了！

### 用户体验：
1. 用户启动软件
2. 自动检查更新
3. 发现新版本时显示通知
4. 点击下载新版本
5. 安装并享受新功能

### 开发者体验：
1. 开发新功能
2. 更新版本号
3. 提交代码到 GitHub
4. 创建 Release 并上传 EXE
5. 更新 version.json
6. 用户自动收到更新通知

**🚀 开始享受现代化的软件分发体验吧！**
