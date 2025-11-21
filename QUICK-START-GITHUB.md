# 🚀 GitHub上传快速开始指南

## 📋 5分钟完成上传

### 第1步：准备工作（1分钟）

1. **检查配置**
   ```bash
   # 双击运行
   check-update-config.cmd
   ```

2. **如果显示需要配置，编辑以下文件：**
   
   **编辑 `src/utils/updateChecker.ts`：**
   ```typescript
   // 第12行，替换 YOUR_USERNAME 为你的GitHub用户名
   private updateCheckUrl = 'https://raw.githubusercontent.com/你的用户名/oc-character-generator/main/public/version.json';
   ```

---

### 第2步：创建GitHub仓库（2分钟）

1. **访问 GitHub**
   ```
   https://github.com/new
   ```

2. **填写信息**
   ```
   Repository name: oc-character-generator
   Description: OC人设盲盒工具 - 随机生成AI图像提示词
   ✅ Public（必须选择）
   ```

3. **点击 "Create repository"**

4. **记录仓库地址**
   ```
   https://github.com/你的用户名/oc-character-generator.git
   ```

---

### 第3步：上传代码（2分钟）

1. **运行上传脚本**
   ```bash
   # 双击运行
   upload-to-github.cmd
   ```

2. **按提示输入信息**
   ```
   GitHub用户名: 你的用户名
   GitHub邮箱: 你的邮箱
   GitHub仓库地址: https://github.com/你的用户名/oc-character-generator.git
   提交信息: Initial commit - OC人设盲盒工具 v1.3.0
   ```

3. **输入认证信息**
   ```
   用户名: 你的GitHub用户名
   密码: Personal Access Token（不是GitHub密码）
   ```

   **获取 Token：**
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 选择 "repo" 权限
   - 复制生成的 token

---

### 第4步：创建Release（1分钟）

1. **打包软件**
   ```bash
   npm run dist
   ```

2. **访问仓库页面**
   ```
   https://github.com/你的用户名/oc-character-generator
   ```

3. **创建Release**
   - 点击 "Releases" → "Create a new release"
   - Tag: `v1.3.0`
   - Title: `v1.3.0 - 高级选项系统`
   - 上传 `dist-electron` 中的 EXE 文件
   - 点击 "Publish release"

4. **复制下载链接**
   - 右键点击 EXE 文件 → 复制链接

---

### 第5步：完成配置（30秒）

1. **更新 `public/version.json`**
   ```json
   {
     "version": "1.3.0",
     "releaseDate": "2025-11-21",
     "downloadUrl": "刚才复制的下载链接",
     "changelog": [
       "新增高级选项系统（6大类45个选项）",
       "新增自动更新功能",
       "新增人物一致性模式"
     ],
     "forceUpdate": false
   }
   ```

2. **提交更新**
   ```bash
   git add public/version.json
   git commit -m "Update download URL"
   git push
   ```

---

## ✅ 完成！

现在你的软件支持自动更新了！

### 🧪 测试

1. **临时修改版本号测试**
   ```typescript
   // src/utils/updateChecker.ts 第11行
   private currentVersion = '1.0.0'; // 临时改为低版本
   ```

2. **运行测试**
   ```bash
   npm run electron:dev
   ```

3. **应该看到更新通知**
   - 右上角弹出通知
   - 显示 v1.3.0
   - 点击下载正常工作

4. **恢复版本号**
   ```typescript
   private currentVersion = '1.3.0'; // 恢复正确版本
   ```

---

## 🔄 以后发布新版本

```bash
# 1. 修改版本号（3个地方）
# - package.json
# - src/utils/updateChecker.ts
# - src/App.tsx

# 2. 提交代码
git add .
git commit -m "Release v1.4.0"
git push

# 3. 打包
npm run dist

# 4. 创建GitHub Release
# 5. 更新version.json
# 6. 提交version.json
```

---

## 🆘 遇到问题？

### 常见问题

1. **推送失败** → 检查Personal Access Token
2. **更新不显示** → 等待5分钟让GitHub缓存更新
3. **下载失败** → 确认Release已发布且EXE已上传

### 获取帮助

- 📖 详细指南：`GITHUB-UPLOAD-GUIDE.md`
- 🔧 配置检查：运行 `check-update-config.cmd`
- 📤 快速上传：运行 `upload-to-github.cmd`

---

**🎉 开始享受现代化的软件分发体验吧！**
