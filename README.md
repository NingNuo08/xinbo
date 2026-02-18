# 心波 - 实时心率监控系统

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.0.8-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-3.3.6-38B2AC?style=flat-square&logo=tailwindcss" alt="TailwindCSS">
</p>

<p align="center">
  <strong>通过蓝牙连接智能手表，实时监控心率数据</strong>
</p>

---

## 项目简介

**心波** 是一个基于 Web Bluetooth API 的实时心率监控系统。用户可以通过蓝牙连接智能手表或心率带设备，实时获取并展示心率数据，支持历史记录查看和数据统计分析。

## 功能特性

- **蓝牙连接** - 支持 Web Bluetooth API，兼容大多数智能手表和心率带设备
- **实时监控** - 实时显示心率数据，自动更新
- **数据统计** - 提供心率趋势图、分布图、区间统计等分析功能
- **响应式设计** - 适配桌面端和移动端设备
- **一键启动** - 提供 Windows 批处理脚本，双击即可启动服务

## 技术栈

本项目前端采用 React 18 配合 TypeScript 进行开发，使用 Vite 5 作为构建工具，样式方案选用 TailwindCSS 3。图表展示使用 Recharts 库，图标来自 Lucide React。后端服务基于 Node.js，通过 WebSocket 实现实时数据通信。

## 快速开始

### 环境要求

使用本项目需要 Node.js v14.0.0 及以上版本，推荐使用 v18.0.0+。同时需要 npm 或 yarn 包管理器，以及支持 Web Bluetooth API 的浏览器（如 Chrome、Edge、Opera）。注意 Web Bluetooth API 需要在 HTTPS 环境或 localhost 下使用。

### 安装步骤

首先克隆项目到本地：

```bash
git clone https://github.com/NingNuo08/xinbo.git
cd xinbo
```

然后安装依赖：

```bash
npm install
cd server
npm install
cd ..
```

### 启动项目

Windows 用户可以直接双击 `Start-Project.bat` 文件一键启动前后端服务。

也可以手动启动：

```bash
# 启动后端服务
cd server
npm run start

# 新开终端，启动前端服务
npm run dev
```

启动后访问 http://localhost:5173 即可使用。

## 使用说明

打开网站后，点击"连接心率设备"按钮，在弹出的设备列表中选择您的智能手表或心率带。连接成功后，系统将自动开始接收心率数据。切换到"数据统计"标签页可以查看历史数据分析。

## 项目结构

前端源码位于 `src` 目录下，其中 `components` 目录包含 React 组件（Header、Footer、HeartRateMonitor、StatsPanel），`hooks` 目录包含自定义 Hooks（如蓝牙心率 Hook），`types` 目录包含 TypeScript 类型定义。后端服务位于 `server` 目录，包含 WebSocket 服务器。启动脚本和配置文件位于项目根目录。

## 兼容性

### 浏览器支持

Chrome、Edge、Opera 浏览器完全支持，Firefox 和 Safari 不支持 Web Bluetooth API。

### 设备支持

支持标准 Bluetooth Heart Rate Service（UUID: 0x180D）的设备，包括 Apple Watch、Garmin 心率带/手表、Polar 心率带/手表、小米手环/手表、华为手环/手表，以及其他支持心率广播的 BLE 设备。

## 注意事项

Web Bluetooth API 需要在 HTTPS 环境或 localhost 下使用。首次使用需要在系统蓝牙设置中配对设备。浏览器会请求蓝牙权限，请点击允许。

## 免责声明

本系统提供的心率数据仅供参考，不构成任何医疗建议。如有健康问题，请咨询专业医疗人员。本系统不对因使用或依赖本系统数据而导致的任何损失或损害承担责任。

## 开源协议

本项目采用 MIT License 开源协议。

## 作者

[NingNuo08](https://github.com/NingNuo08)

---

<p align="center">
  如果觉得这个项目有帮助，欢迎 ⭐ Star 支持！
</p>
