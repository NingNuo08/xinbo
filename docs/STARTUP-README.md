# 心波 - 一键启动脚本使用说明

## 系统要求

| 项目 | 要求 |
|------|------|
| 操作系统 | Windows 10 及以上 |
| Node.js | v14.0.0 及以上 (推荐 v18.0.0+) |
| npm | 随 Node.js 自动安装 |
| PowerShell | Windows 10 自带 |

## 快速开始

### 方法一：双击启动（推荐）

1. 双击 `Start-Project.bat` 文件
2. 等待环境检测和服务启动
3. 浏览器将自动打开网站

### 方法二：PowerShell 启动

```powershell
# 右键点击 Start-Project.ps1 -> 使用 PowerShell 运行
# 或在 PowerShell 中执行：
.\Start-Project.ps1
```

### 方法三：命令行启动

```cmd
Start-Project.bat
```

## 启动参数

| 参数 | 说明 |
|------|------|
| `-SkipBrowser` | 启动服务但不打开浏览器 |
| `-FrontendOnly` | 仅启动前端服务 |
| `-BackendOnly` | 仅启动后端服务 |

**使用示例：**

```powershell
# 仅启动前端
.\Start-Project.ps1 -FrontendOnly

# 仅启动后端
.\Start-Project.ps1 -BackendOnly

# 启动所有服务但不打开浏览器
.\Start-Project.ps1 -SkipBrowser
```

## 配置说明

配置文件：`start-config.json`

### 前端配置

```json
"frontend": {
  "name": "前端服务",
  "relativePath": ".",
  "startCommand": "npm run dev",
  "port": 5173,
  "url": "http://localhost:5173",
  "startupTimeout": 30,
  "requiredFiles": ["package.json", "vite.config.ts"]
}
```

### 后端配置

```json
"backend": {
  "name": "后端服务",
  "relativePath": "server",
  "startCommand": "npm run start",
  "port": 8080,
  "url": "ws://localhost:8080",
  "startupTimeout": 15,
  "requiredFiles": ["package.json", "server.js"]
}
```

### 浏览器配置

```json
"browser": {
  "autoOpen": true,
  "url": "http://localhost:5173",
  "delaySeconds": 5
}
```

### Node.js 版本要求

```json
"nodejs": {
  "minimumVersion": "14.0.0",
  "recommendedVersion": "18.0.0"
}
```

## 功能特性

### 环境预检查

- Node.js 安装检测
- Node.js 版本兼容性检测
- npm 包管理器检测
- 项目目录结构完整性检测
- 端口占用检测

### 服务管理

- 前后端服务并行启动
- 依赖自动安装提示
- 实时启动状态显示
- 进程生命周期管理

### 用户体验

- 彩色状态指示（成功/警告/错误）
- 友好的错误提示
- 浏览器自动打开
- Ctrl+C 优雅退出

## 常见问题

### Q1: 提示 "Node.js 未安装"

**解决方案：**
1. 访问 https://nodejs.org
2. 下载 LTS (长期支持) 版本
3. 安装完成后重新运行脚本

### Q2: 提示 "端口被占用"

**解决方案：**

方法一：关闭占用端口的程序
```powershell
# 查看端口占用
netstat -ano | findstr :5173
netstat -ano | findstr :8080

# 根据PID结束进程
taskkill /PID <进程ID> /F
```

方法二：修改配置文件端口
```json
// 修改 start-config.json
"frontend": {
  "port": 5174,
  "url": "http://localhost:5174"
}
```

### Q3: 提示 "依赖未安装"

**解决方案：**
1. 脚本会提示是否安装依赖，输入 Y 确认
2. 或手动安装：
```cmd
cd f:\01BC\xlgb
npm install
cd server
npm install
```

### Q4: PowerShell 执行策略限制

**解决方案：**
```powershell
# 临时允许脚本执行
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 或直接使用 .bat 文件启动
```

### Q5: 浏览器未自动打开

**解决方案：**
1. 检查默认浏览器设置
2. 手动访问 http://localhost:5173

### Q6: 服务启动后立即关闭

**可能原因：**
- 依赖安装不完整
- 端口冲突
- 配置文件错误

**解决方案：**
1. 删除 node_modules 文件夹
2. 重新运行 `npm install`
3. 检查 start-config.json 格式

## 目录结构

```
f:\01BC\xlgb\
├── Start-Project.bat      # 批处理启动入口
├── Start-Project.ps1      # PowerShell 主脚本
├── start-config.json      # 配置文件
├── package.json           # 前端依赖配置
├── vite.config.ts         # Vite 配置
├── src/                   # 前端源码
├── public/                # 静态资源
└── server/                # 后端服务
    ├── package.json       # 后端依赖配置
    └── server.js          # 后端入口文件
```

## 故障排除流程

```
开始
  │
  ├─→ Node.js 是否安装？
  │     └─ 否 → 安装 Node.js
  │
  ├─→ 端口是否被占用？
  │     └─ 是 → 关闭占用程序或修改端口
  │
  ├─→ 依赖是否安装？
  │     └─ 否 → 运行 npm install
  │
  ├─→ 配置文件是否正确？
  │     └─ 否 → 检查 JSON 格式
  │
  └─→ 重新运行启动脚本
```

## 技术支持

如遇其他问题，请检查：
1. Node.js 版本是否符合要求
2. 网络连接是否正常
3. 防火墙是否阻止了端口访问
4. 杀毒软件是否拦截了脚本执行

---

**心波** - 实时心率监控平台  
版本: 1.0.0
