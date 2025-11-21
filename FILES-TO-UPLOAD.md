# 📁 GitHub上传文件清单

## ✅ 必须上传的文件

### 📂 项目配置文件
```
✅ package.json                 # 项目配置和依赖
✅ vite.config.ts              # 构建配置
✅ tsconfig.json               # TypeScript配置
✅ tailwind.config.js          # Tailwind CSS配置
✅ postcss.config.js           # PostCSS配置
✅ index.html                  # HTML模板
✅ .gitignore                  # Git忽略文件配置
✅ README.md                   # 项目说明
```

### 📂 源代码目录 (src/)
```
✅ src/
├── 📄 App.tsx                 # 主应用组件
├── 📄 main.tsx                # 应用入口
├── 📄 index.css               # 全局样式
├── 📁 components/             # React组件
│   ├── 📄 Header.tsx
│   ├── 📄 GeneratorOptions.tsx
│   ├── 📄 AdvancedOptions.tsx      # 🆕 高级选项
│   ├── 📄 ConsistencyMode.tsx      # 🆕 一致性模式
│   ├── 📄 UpdateNotification.tsx   # 🆕 更新通知
│   ├── 📄 MultiDrawButton.tsx
│   ├── 📄 CharacterCard.tsx
│   ├── 📄 HistoryPanel.tsx
│   └── 📄 ImagePreview.tsx
├── 📁 data/
│   ├── 📄 characterElements.ts
│   └── 📄 characterElements-chinese.ts  # 🆕 中文元素库
└── 📁 utils/
    ├── 📄 promptGenerator.ts
    └── 📄 updateChecker.ts           # 🆕 更新检查器
```

### 📂 Electron相关文件
```
✅ electron/
├── 📄 main.js                 # Electron主进程
└── 📄 preload.js              # 预加载脚本
```

### 📂 公共资源 (public/)
```
✅ public/
├── 📄 version.json            # 🔥 重要！版本信息
├── 📄 icon.svg                # 应用图标
└── 📄 icon-readme.txt         # 图标说明
```

### 📂 文档文件
```
✅ GITHUB-UPLOAD-GUIDE.md      # 🆕 详细上传指南
✅ QUICK-START-GITHUB.md       # 🆕 快速开始指南
✅ FILES-TO-UPLOAD.md          # 🆕 本文件
✅ ADVANCED-OPTIONS-GUIDE.md   # 🆕 高级选项指南
✅ AUTO-UPDATE-GUIDE.md        # 🆕 自动更新指南
✅ CONSISTENCY-GUIDE.md        # 一致性模式指南
✅ UPDATE-v1.3.0.md           # 版本更新说明
✅ 其他 .md 文档文件
```

### 📂 辅助脚本
```
✅ upload-to-github.cmd        # 🆕 上传助手脚本
✅ check-update-config.cmd     # 🆕 配置检查脚本
✅ clean-build.cmd             # 构建清理脚本
✅ 其他 .cmd/.bat 文件
```

---

## ❌ 不要上传的文件

### 📂 依赖和构建输出
```
❌ node_modules/               # 依赖包（太大，会自动安装）
❌ dist/                       # Vite构建输出
❌ dist-electron/              # Electron构建输出
❌ build/                      # 其他构建目录
```

### 📂 编辑器和系统文件
```
❌ .vscode/                    # VS Code配置
❌ .idea/                      # IntelliJ配置
❌ .DS_Store                   # macOS系统文件
❌ Thumbs.db                   # Windows缩略图
❌ *.swp, *.swo               # Vim临时文件
```

### 📂 日志和临时文件
```
❌ *.log                       # 日志文件
❌ logs/                       # 日志目录
❌ *.tmp, *.temp              # 临时文件
❌ npm-debug.log*             # npm调试日志
❌ yarn-debug.log*            # yarn调试日志
```

### 📂 环境和配置文件
```
❌ .env                        # 环境变量（可能包含敏感信息）
❌ .env.local                  # 本地环境变量
❌ .env.development.local      # 开发环境变量
❌ .env.test.local            # 测试环境变量
❌ .env.production.local      # 生产环境变量
```

---

## 🔍 文件大小检查

### 📊 预期文件大小
```
📁 整个项目（不含node_modules）: ~5-10MB
📄 单个源文件: 通常 < 100KB
📄 文档文件: 通常 < 50KB
📄 配置文件: 通常 < 10KB
```

### ⚠️ 注意事项
- 如果某个文件 > 100MB，GitHub会拒绝
- 如果整个仓库 > 1GB，会收到警告
- 建议单次推送 < 100MB

---

## 📋 上传前检查清单

### 🔧 配置检查
- [ ] `.gitignore` 文件存在且配置正确
- [ ] `node_modules` 目录已删除或被忽略
- [ ] `dist` 和 `dist-electron` 目录已删除或被忽略
- [ ] `public/version.json` 文件存在
- [ ] `src/utils/updateChecker.ts` 中的URL已更新

### 📄 文件检查
- [ ] 所有源代码文件都存在
- [ ] 所有组件文件都存在
- [ ] 配置文件完整
- [ ] 文档文件完整
- [ ] 没有包含敏感信息

### 🔗 链接检查
- [ ] `updateChecker.ts` 中的 `YOUR_USERNAME` 已替换
- [ ] GitHub仓库地址正确
- [ ] 版本号在各文件中保持一致

---

## 🚀 快速检查命令

### 检查文件大小
```bash
# 检查项目总大小
dir /s

# 检查是否有大文件
forfiles /m *.* /c "cmd /c if @fsize gtr 10485760 echo @path @fsize"
```

### 检查Git状态
```bash
# 查看将要提交的文件
git status

# 查看文件大小
git ls-files | xargs ls -la

# 检查忽略的文件
git status --ignored
```

### 运行检查脚本
```bash
# 运行配置检查
check-update-config.cmd

# 运行上传脚本
upload-to-github.cmd
```

---

## 📊 文件统计

### 当前项目文件统计
```
📁 源代码文件: ~20个
📁 组件文件: ~10个
📁 配置文件: ~8个
📁 文档文件: ~15个
📁 脚本文件: ~10个
📁 总计: ~60个文件
```

### 预期上传大小
```
📦 压缩前: ~8-12MB
📦 压缩后: ~2-4MB
⏱️ 上传时间: 1-3分钟（取决于网速）
```

---

## 🎯 重要提醒

### 🔥 关键文件
这些文件对自动更新功能至关重要：

1. **`public/version.json`** - 版本信息
2. **`src/utils/updateChecker.ts`** - 更新检查器
3. **`src/components/UpdateNotification.tsx`** - 更新通知

### 🔧 配置要点
1. **GitHub仓库必须是Public**
2. **`version.json` 必须在 `public` 目录**
3. **更新URL必须指向正确的GitHub地址**
4. **版本号必须在多个文件中保持一致**

### 📝 上传顺序
1. 先上传源代码
2. 再创建Release
3. 最后更新version.json

---

## ✅ 完成检查

上传完成后，确认以下内容：

- [ ] GitHub仓库页面可以正常访问
- [ ] 所有文件都已上传
- [ ] 没有上传不必要的文件
- [ ] Release已创建并包含EXE文件
- [ ] version.json已更新下载链接
- [ ] 自动更新功能测试正常

---

**🎉 准备好上传了吗？运行 `upload-to-github.cmd` 开始吧！**
