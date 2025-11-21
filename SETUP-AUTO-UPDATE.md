# 自动更新快速设置指南

## 🎯 5分钟完成设置

---

## 步骤1：创建 GitHub 仓库

### 1.1 在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 仓库名：`oc-character-generator`
3. 设置为 Public（公开）
4. 点击 "Create repository"

### 1.2 上传代码

```bash
cd C:\Users\邱\CascadeProjects\oc-character-generator

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/oc-character-generator.git
git push -u origin main
```

**替换 `YOUR_USERNAME` 为你的 GitHub 用户名**

---

## 步骤2：修改更新检查 URL

### 2.1 编辑 updateChecker.ts

打开文件：`src/utils/updateChecker.ts`

找到这一行：
```typescript
private updateCheckUrl = 'https://raw.githubusercontent.com/YOUR_USERNAME/oc-character-generator/main/version.json';
```

替换为：
```typescript
private updateCheckUrl = 'https://raw.githubusercontent.com/你的用户名/oc-character-generator/main/public/version.json';
```

### 2.2 保存并提交

```bash
git add src/utils/updateChecker.ts
git commit -m "Update version check URL"
git push
```

---

## 步骤3：发布第一个版本

### 3.1 打包软件

```bash
npm run dist
```

### 3.2 创建 Release

1. 访问你的 GitHub 仓库
2. 点击 "Releases" → "Create a new release"
3. 填写信息：
   - **Tag**: `v1.2.0`
   - **Title**: `v1.2.0 - 人物一致性模式`
   - **Description**:
     ```
     ## 新功能
     - 人物一致性模式（种子/参考图/组合）
     - 特征锁定功能
     - 自动更新系统
     
     ## 改进
     - 优化中文提示词格式
     - 修复已知问题
     ```
4. 上传文件：
   - 拖拽 `dist-electron/OC人设盲盒 Setup 1.2.0.exe`
5. 点击 "Publish release"

### 3.3 获取下载链接

发布后，右键点击 EXE 文件 → "复制链接地址"

链接格式：
```
https://github.com/YOUR_USERNAME/oc-character-generator/releases/download/v1.2.0/OC人设盲盒-Setup-1.2.0.exe
```

---

## 步骤4：更新 version.json

### 4.1 编辑文件

打开 `public/version.json`，修改为：

```json
{
  "version": "1.2.0",
  "releaseDate": "2025-11-21",
  "downloadUrl": "刚才复制的下载链接",
  "changelog": [
    "新增人物一致性模式（种子/参考图/组合）",
    "新增特征锁定功能",
    "新增自动更新系统",
    "优化中文提示词格式"
  ],
  "forceUpdate": false
}
```

### 4.2 提交更新

```bash
git add public/version.json
git commit -m "Update version.json for v1.2.0"
git push
```

---

## 步骤5：测试

### 5.1 修改测试版本

临时修改 `src/utils/updateChecker.ts`：

```typescript
private currentVersion = '1.0.0'; // 改成较低版本
```

### 5.2 运行测试

```bash
npm run electron:dev
```

### 5.3 验证

- ✅ 右上角应该显示更新通知
- ✅ 显示版本号 v1.2.0
- ✅ 显示更新内容
- ✅ 点击"立即下载"能打开下载链接

### 5.4 恢复版本号

测试完成后，恢复：

```typescript
private currentVersion = '1.2.0';
```

---

## 🎉 完成！

现在你的软件支持自动更新了！

---

## 📝 以后发布新版本

### 简化流程

```bash
# 1. 修改版本号
# package.json: "version": "1.3.0"
# updateChecker.ts: currentVersion = '1.3.0'

# 2. 打包
npm run dist

# 3. 创建 GitHub Release
# - Tag: v1.3.0
# - 上传 EXE

# 4. 更新 version.json
# - version: "1.3.0"
# - downloadUrl: 新版本链接
# - changelog: 更新内容

# 5. 提交
git add .
git commit -m "Release v1.3.0"
git push
```

---

## 💡 使用技巧

### 技巧1：使用 CDN 加速

如果 GitHub Raw 访问慢，使用 jsDelivr：

```typescript
private updateCheckUrl = 'https://cdn.jsdelivr.net/gh/YOUR_USERNAME/oc-character-generator@main/public/version.json';
```

### 技巧2：强制更新

如果有重要更新，设置：

```json
{
  "forceUpdate": true
}
```

用户将无法关闭更新通知。

### 技巧3：分阶段发布

先设置较高版本号（如 1.9.0），只有少数用户能看到，测试稳定后再改为正式版本（2.0.0）。

---

## ⚠️ 重要提醒

### 必须做的事

1. ✅ 替换 `YOUR_USERNAME` 为你的 GitHub 用户名
2. ✅ 确保 version.json 在 public 目录
3. ✅ 每次发布都要更新 version.json
4. ✅ 下载链接必须是直接下载链接

### 不要做的事

1. ❌ 不要把 version.json 放在 src 目录
2. ❌ 不要使用网页链接作为 downloadUrl
3. ❌ 不要忘记提交 version.json 的更新
4. ❌ 不要使用错误的版本号格式

---

## 🆘 遇到问题？

### 问题1：更新通知不显示

**解决：**
1. 检查 GitHub 仓库是否公开
2. 等待5分钟让 GitHub 缓存更新
3. 检查浏览器控制台是否有错误

### 问题2：下载链接打不开

**解决：**
1. 确认 Release 已发布（不是草稿）
2. 确认 EXE 文件已上传
3. 右键复制链接，确保是直接下载链接

### 问题3：版本号不对

**解决：**
1. 确保 package.json 的版本号已更新
2. 确保 updateChecker.ts 的版本号已更新
3. 确保 version.json 的版本号已更新

---

## 📞 需要帮助？

查看完整文档：`AUTO-UPDATE-GUIDE.md`

---

**开始设置自动更新吧！** 🚀
