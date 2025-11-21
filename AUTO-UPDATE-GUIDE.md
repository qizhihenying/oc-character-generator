# 自动更新系统指南

## 🎯 功能说明

软件现在支持**在线自动检测更新**，当有新版本时会弹出通知，点击即可下载升级！

---

## ✨ 功能特点

### 1. 自动检测
- ✅ 启动时自动检查更新
- ✅ 每小时后台检查一次
- ✅ 无需手动操作

### 2. 友好提示
- ✅ 右上角弹出通知
- ✅ 显示版本号和更新内容
- ✅ 一键下载新版本

### 3. 灵活控制
- ✅ 可以稍后提醒
- ✅ 支持强制更新模式
- ✅ 显示当前版本

---

## 🔧 工作原理

### 架构图

```
┌─────────────┐
│  软件启动   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 检查更新API │ ← 从 GitHub/服务器获取 version.json
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  比较版本   │
└──────┬──────┘
       │
       ▼
   有新版本？
       │
    是 │ 否
       │  └─→ 不显示
       ▼
┌─────────────┐
│ 显示通知    │
└──────┬──────┘
       │
       ▼
  用户点击下载
       │
       ▼
┌─────────────┐
│ 打开下载链接│
└─────────────┘
```

---

## 📝 配置文件

### version.json 格式

```json
{
  "version": "1.2.0",
  "releaseDate": "2025-11-21",
  "downloadUrl": "https://github.com/YOUR_USERNAME/oc-character-generator/releases/download/v1.2.0/OC人设盲盒-Setup-1.2.0.exe",
  "changelog": [
    "新增人物一致性模式",
    "新增特征锁定功能",
    "优化中文提示词格式",
    "修复已知问题"
  ],
  "forceUpdate": false
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | string | 版本号（如 "1.2.0"） |
| `releaseDate` | string | 发布日期 |
| `downloadUrl` | string | 下载链接 |
| `changelog` | array | 更新内容列表 |
| `forceUpdate` | boolean | 是否强制更新 |

---

## 🚀 部署方法

### 方法1：使用 GitHub Releases（推荐）

#### 步骤1：创建 GitHub 仓库

```bash
# 1. 在 GitHub 创建新仓库
# 2. 初始化本地仓库
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/oc-character-generator.git
git push -u origin main
```

#### 步骤2：上传 version.json

```bash
# 将 version.json 放在仓库根目录
git add public/version.json
git commit -m "Add version.json"
git push
```

#### 步骤3：创建 Release

1. 打包软件：`npm run dist`
2. 在 GitHub 仓库页面点击 "Releases"
3. 点击 "Create a new release"
4. 填写信息：
   - Tag: `v1.2.0`
   - Title: `v1.2.0 - 人物一致性模式`
   - Description: 复制更新内容
5. 上传文件：`dist-electron/OC人设盲盒 Setup 1.2.0.exe`
6. 点击 "Publish release"

#### 步骤4：获取下载链接

发布后，右键点击 EXE 文件 → 复制链接地址

格式：
```
https://github.com/YOUR_USERNAME/oc-character-generator/releases/download/v1.2.0/OC人设盲盒-Setup-1.2.0.exe
```

#### 步骤5：更新 version.json

```json
{
  "version": "1.2.0",
  "downloadUrl": "上面复制的链接",
  ...
}
```

#### 步骤6：更新代码中的 URL

编辑 `src/utils/updateChecker.ts`：

```typescript
private updateCheckUrl = 'https://raw.githubusercontent.com/YOUR_USERNAME/oc-character-generator/main/public/version.json';
```

---

### 方法2：使用自己的服务器

#### 步骤1：上传文件

将以下文件上传到服务器：
- `version.json` - 版本信息
- `OC人设盲盒 Setup 1.2.0.exe` - 安装程序

#### 步骤2：配置 URL

编辑 `src/utils/updateChecker.ts`：

```typescript
private updateCheckUrl = 'https://your-domain.com/version.json';
```

编辑 `version.json`：

```json
{
  "downloadUrl": "https://your-domain.com/OC人设盲盒-Setup-1.2.0.exe"
}
```

#### 步骤3：配置 CORS

如果使用自己的服务器，需要配置 CORS：

**Nginx 配置：**
```nginx
location /version.json {
    add_header Access-Control-Allow-Origin *;
}
```

**Apache 配置：**
```apache
<FilesMatch "version\.json">
    Header set Access-Control-Allow-Origin "*"
</FilesMatch>
```

---

### 方法3：使用 CDN

#### 推荐的免费 CDN：

1. **jsDelivr**
   ```
   https://cdn.jsdelivr.net/gh/YOUR_USERNAME/oc-character-generator@main/public/version.json
   ```

2. **Statically**
   ```
   https://cdn.statically.io/gh/YOUR_USERNAME/oc-character-generator/main/public/version.json
   ```

---

## 📱 发布新版本流程

### 完整流程

```bash
# 1. 更新版本号
# 编辑 package.json: "version": "1.3.0"
# 编辑 src/utils/updateChecker.ts: currentVersion = '1.3.0'

# 2. 打包新版本
npm run dist

# 3. 创建 GitHub Release
# - Tag: v1.3.0
# - 上传 EXE 文件

# 4. 更新 version.json
{
  "version": "1.3.0",
  "releaseDate": "2025-11-22",
  "downloadUrl": "新版本的下载链接",
  "changelog": [
    "新功能1",
    "新功能2"
  ],
  "forceUpdate": false
}

# 5. 提交更新
git add public/version.json
git commit -m "Release v1.3.0"
git push

# 6. 等待几分钟让 CDN 更新缓存
```

---

## 🎨 自定义更新通知

### 修改通知样式

编辑 `src/components/UpdateNotification.tsx`：

```typescript
// 修改位置
<div className="fixed top-4 right-4 z-50">  // 右上角
<div className="fixed bottom-4 right-4 z-50"> // 右下角
<div className="fixed top-4 left-4 z-50">   // 左上角

// 修改颜色
className="bg-gradient-to-r from-purple-500 to-pink-500"
className="bg-gradient-to-r from-blue-500 to-cyan-500"
```

### 修改检查频率

编辑 `src/components/UpdateNotification.tsx`：

```typescript
// 每小时检查一次（默认）
const interval = setInterval(checkForUpdates, 60 * 60 * 1000);

// 每30分钟检查一次
const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

// 每天检查一次
const interval = setInterval(checkForUpdates, 24 * 60 * 60 * 1000);
```

---

## 🔍 测试更新功能

### 本地测试

#### 方法1：修改当前版本号

编辑 `src/utils/updateChecker.ts`：

```typescript
private currentVersion = '1.0.0'; // 改成较低版本
```

然后运行 `npm run electron:dev`，应该会显示更新通知。

#### 方法2：使用本地 JSON

1. 创建测试文件 `public/test-version.json`：
```json
{
  "version": "9.9.9",
  "releaseDate": "2025-11-21",
  "downloadUrl": "https://example.com/test.exe",
  "changelog": ["测试更新"],
  "forceUpdate": false
}
```

2. 修改 `updateChecker.ts`：
```typescript
private updateCheckUrl = 'http://localhost:5173/test-version.json';
```

3. 运行 `npm run dev`

---

## ⚠️ 注意事项

### 1. 版本号格式

必须使用语义化版本号：`主版本.次版本.修订号`

```
✅ 正确：1.2.0, 1.2.1, 2.0.0
❌ 错误：1.2, v1.2.0, 1.2.0-beta
```

### 2. 下载链接

- 必须是直接下载链接（不能是网页）
- 必须支持 HTTPS
- 必须可公开访问

### 3. CORS 问题

如果更新检查失败，可能是 CORS 问题：
- 使用 GitHub Raw 或 jsDelivr 可以避免
- 自己的服务器需要配置 CORS

### 4. 缓存问题

- GitHub Raw 有缓存（约5分钟）
- jsDelivr 有缓存（可以用 `?v=timestamp` 绕过）
- 建议等待几分钟后测试

---

## 🐛 常见问题

### Q1: 更新通知不显示？

**检查清单：**
1. ✅ version.json 的 URL 是否正确？
2. ✅ version.json 的版本号是否大于当前版本？
3. ✅ 网络是否正常？
4. ✅ 浏览器控制台有无错误？

### Q2: 点击下载没反应？

**可能原因：**
- downloadUrl 链接错误
- 浏览器拦截了弹窗

**解决方案：**
- 检查链接是否可访问
- 允许浏览器弹窗

### Q3: 如何禁用自动检查？

编辑 `src/components/UpdateNotification.tsx`：

```typescript
useEffect(() => {
  // 注释掉这些代码
  // checkForUpdates();
  // const interval = setInterval(checkForUpdates, 60 * 60 * 1000);
  // return () => clearInterval(interval);
}, []);
```

### Q4: 如何添加手动检查按钮？

在 Header 组件中添加：

```typescript
<button onClick={() => updateChecker.checkForUpdates()}>
  检查更新
</button>
```

---

## 📊 更新统计（可选）

### 添加下载统计

可以使用 Google Analytics 或自己的统计服务：

```typescript
const handleDownload = () => {
  // 发送统计
  gtag('event', 'download', {
    version: updateInfo.version
  });
  
  // 下载
  updateChecker.downloadUpdate(updateInfo.downloadUrl);
};
```

---

## 🎉 总结

现在你的软件支持：

- ✅ 自动检测更新
- ✅ 友好的更新通知
- ✅ 一键下载升级
- ✅ 强制更新模式
- ✅ 灵活的配置

**用户体验：**
1. 打开软件
2. 右上角弹出"发现新版本"
3. 点击"立即下载"
4. 下载并安装新版本

**开发者体验：**
1. 打包新版本
2. 上传到 GitHub Releases
3. 更新 version.json
4. 用户自动收到通知

---

**开始使用自动更新系统吧！** 🚀✨
