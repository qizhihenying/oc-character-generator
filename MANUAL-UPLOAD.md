# 手动上传到GitHub指南

## 🚀 简单3步完成上传

### 第1步：初始化Git仓库

打开命令提示符（CMD），进入项目目录：

```bash
cd C:\Users\邱\CascadeProjects\oc-character-generator
```

运行以下命令：

```bash
# 初始化Git仓库
git init

# 配置用户信息（替换为你的信息）
git config --global user.name "qizhihenying"
git config --global user.email "你的邮箱@example.com"

# 添加远程仓库
git remote add origin https://github.com/qizhihenying/oc-character-generator.git
```

---

### 第2步：添加和提交文件

```bash
# 添加所有文件
git add .

# 检查状态
git status

# 提交文件
git commit -m "Initial commit - OC Character Generator v1.3.0"
```

---

### 第3步：推送到GitHub

```bash
# 设置主分支
git branch -M main

# 推送到GitHub
git push -u origin main
```

**认证信息：**
- 用户名：`qizhihenying`
- 密码：Personal Access Token（不是GitHub密码）

**获取Personal Access Token：**
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择 "repo" 权限
4. 复制生成的token作为密码使用

---

## 🎯 如果遇到问题

### 问题1：编码错误
如果看到乱码，使用英文版命令：

```bash
# 设置编码
chcp 65001

# 或者直接使用英文命令
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 问题2：认证失败
确保使用：
- 用户名：qizhihenying
- 密码：Personal Access Token（不是GitHub密码）

### 问题3：推送失败
检查：
1. 网络连接是否正常
2. 仓库地址是否正确
3. 仓库是否设置为Public

---

## ✅ 成功标志

推送成功后会看到类似信息：
```
Enumerating objects: 100, done.
Counting objects: 100% (100/100), done.
Delta compression using up to 8 threads
Compressing objects: 100% (95/95), done.
Writing objects: 100% (100/100), 1.23 MiB | 2.34 MiB/s, done.
Total 100 (delta 5), reused 0 (delta 0), pack-reused 0
To https://github.com/qizhihenying/oc-character-generator.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## 🔄 下一步：创建Release

上传成功后：

1. **打包软件**
   ```bash
   npm run dist
   ```

2. **访问GitHub仓库**
   ```
   https://github.com/qizhihenying/oc-character-generator
   ```

3. **创建Release**
   - 点击 "Releases" → "Create a new release"
   - Tag: `v1.3.0`
   - Title: `v1.3.0 - 高级选项系统`
   - 上传 `dist-electron` 中的EXE文件

4. **更新version.json**
   - 复制EXE下载链接
   - 更新 `public/version.json` 中的 downloadUrl
   - 提交更新

---

**按照这个手动步骤操作，应该就能成功上传了！** 🎉
