# 轮询调试指南

## 🎯 问题确认

✅ **API 调用成功** - 第三方后台已显示图片  
❌ **进度未显示** - 软件界面没有显示任务进度

这说明：
1. ✅ 提交任务成功
2. ✅ 任务已创建
3. ❌ 轮询查询有问题

## 🔍 调试步骤

### 步骤 1：重启开发服务器
```bash
# 停止当前服务器（Ctrl+C）
npm run dev
```

### 步骤 2：清除浏览器缓存
- 按 `Ctrl+Shift+R` 硬刷新
- 或者按 `F12` 打开开发者工具 → Network 标签 → 勾选 "Disable cache"

### 步骤 3：提交新任务并观察日志

打开浏览器控制台（F12），应该看到以下日志序列：

#### 📤 提交阶段
```
Submitting imagine task... {botType: "MID_JOURNEY", prompt: "...", imageCount: 0}
MJ API: Task created and stored {id: "1234567890", ...}
MJ API: Total tasks: 1
MJ API: Dispatching task update event
MJGallery: Task update event received
MJGallery: Updated tasks [{id: "1234567890", status: "pending", ...}]
Task submitted successfully: {id: "1234567890", ...}
```

#### 🔄 轮询阶段（3秒后开始）
```
MJ API: Starting to poll task 1234567890
MJ API: Polling task 1234567890, attempt 1/60
MJ API: Querying task at URL: https://api.vectorengine.ai/mj/task/1234567890/fetch
MJ API: Query response status: 200
MJ API: Query response data: {code: 1, result: {status: "IN_PROGRESS", progress: "10%", ...}}
MJ API: Task 1234567890 status: IN_PROGRESS, progress: 10%
MJ API: Task 1234567890 processing, progress: 10%
MJ API: Updating task 1234567890 status to processing {progress: 10}
MJ API: Dispatching update event for task 1234567890
MJGallery: Task update event received
MJGallery: Updated tasks [{id: "1234567890", status: "processing", progress: 10, ...}]
```

#### ✅ 完成阶段
```
MJ API: Polling task 1234567890, attempt 12/60
MJ API: Query response data: {code: 1, result: {status: "SUCCESS", imageUrl: "https://...", ...}}
MJ API: Task 1234567890 status: SUCCESS, progress: undefined
MJ API: Task 1234567890 completed successfully, imageUrl: https://...
MJ API: Updating task 1234567890 status to success {imageUrl: "https://..."}
MJ API: Dispatching update event for task 1234567890
MJGallery: Task update event received
MJGallery: Updated tasks [{id: "1234567890", status: "success", imageUrl: "https://...", ...}]
```

## 🚨 常见问题排查

### 问题 1：没有看到 "Starting to poll" 日志
**原因**：轮询没有启动

**检查**：
- 任务是否成功创建？
- 是否看到 "Task created and stored"？

### 问题 2：看到 "Query response status: 404"
**原因**：查询 API 路径错误

**检查 URL 格式**：
```
正确：https://api.vectorengine.ai/mj/task/{taskId}/fetch
错误：https://api.vectorengine.ai/mj/task/fetch/{taskId}
```

### 问题 3：看到 "Query response status: 401"
**原因**：API Key 无效或过期

**解决**：
1. 重新配置 API Key
2. 点击"测试连接"验证

### 问题 4：看到 "Query response data: {code: 0, ...}"
**原因**：API 返回错误

**检查**：
- 查看完整的 response data
- 检查 `description` 字段的错误信息

### 问题 5：一直显示 "pending"，没有进入 "processing"
**原因**：
1. 查询 API 返回的数据格式不匹配
2. 状态字段名称不对

**检查响应格式**：
```javascript
// 预期格式
{
  code: 1,
  result: {
    status: "IN_PROGRESS" | "SUCCESS" | "FAILURE",
    progress: "50%",
    imageUrl: "https://...",
    failReason: "..."
  }
}
```

### 问题 6：轮询停止了
**原因**：达到最大尝试次数（60次 = 5分钟）

**解决**：
- 检查任务是否真的超时
- 查看第三方后台任务状态
- 可能需要增加 `maxAttempts`

## 🔧 手动测试查询 API

在控制台执行：

```javascript
// 1. 获取任务 ID
const tasks = mjAPI.getAllTasks();
console.log('Tasks:', tasks);
const taskId = tasks[0]?.id;

// 2. 手动查询任务
mjAPI.queryTask(taskId).then(result => {
  console.log('Query result:', result);
}).catch(error => {
  console.error('Query error:', error);
});

// 3. 查看任务详情
console.log('Task detail:', mjAPI.getTask(taskId));
```

## 📊 API 响应格式参考

### 查询任务接口
```
GET /mj/task/{taskId}/fetch
Authorization: Bearer {API_KEY}
```

### 可能的响应

#### 任务进行中
```json
{
  "code": 1,
  "description": "Success",
  "result": {
    "status": "IN_PROGRESS",
    "progress": "35%",
    "imageUrl": null,
    "failReason": null
  }
}
```

#### 任务完成
```json
{
  "code": 1,
  "description": "Success",
  "result": {
    "status": "SUCCESS",
    "progress": "100%",
    "imageUrl": "https://cdn.example.com/image.png",
    "failReason": null
  }
}
```

#### 任务失败
```json
{
  "code": 1,
  "description": "Success",
  "result": {
    "status": "FAILURE",
    "progress": "0%",
    "imageUrl": null,
    "failReason": "Prompt contains banned words"
  }
}
```

#### API 错误
```json
{
  "code": 0,
  "description": "Task not found",
  "result": null
}
```

## 🎯 预期行为时间线

```
T+0s    : 提交任务
T+0s    : 任务创建，状态 = pending
T+0s    : UI 显示任务卡片（pending）
T+3s    : 开始第一次查询
T+3s    : 状态更新为 processing，进度 0-10%
T+8s    : 第二次查询，进度 10-20%
T+13s   : 第三次查询，进度 20-30%
...
T+60s   : 第12次查询，状态 = SUCCESS
T+60s   : UI 显示完成图片
```

## 💡 临时解决方案

如果轮询有问题，可以手动刷新任务状态：

```javascript
// 在控制台执行
const taskId = "你的任务ID";
mjAPI.queryTask(taskId).then(result => {
  if (result.code === 1 && result.result) {
    // 手动触发更新
    window.dispatchEvent(new CustomEvent('mj-task-update'));
  }
});
```

## 📝 需要提供的调试信息

如果问题仍然存在，请提供：

1. **完整的控制台日志**（从提交到轮询结束）
2. **Network 标签中的请求详情**
   - 提交请求（POST /mj/submit/imagine）
   - 查询请求（GET /mj/task/{id}/fetch）
3. **第三方后台的任务状态**
4. **任务 ID**

---

**提示**：所有调试日志会在生产版本中移除。

🔍 祝调试顺利！
