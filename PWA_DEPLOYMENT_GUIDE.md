# AetherLink PWA 部署指南

本指南介绍如何将 AetherLink 部署为 PWA（渐进式 Web 应用）并发布到 Netlify。

## PWA 功能特性

AetherLink PWA 版本包含以下功能：

### 1. 核心 PWA 功能
- **离线访问** - 应用缓存关键资源，支持离线使用
- **主屏幕安装** - 可安装到设备主屏幕，像原生应用一样使用
- **推送通知** - 支持接收实时通知（如果浏览器支持）
- **全屏体验** - 安装后提供类似原生应用的全屏体验

### 2. 自定义配置功能
- **自定义 MCP 服务器** - 用户可添加自己的 MCP 服务
- **自定义搜索引擎** - 支持配置多种网络搜索提供者
- **配置持久化** - 配置保存在浏览器本地存储中

### 3. 跨域解决方案
- **内置代理服务** - 解决 MCP 和网络搜索的跨域问题
- **多平台适配** - 在不同平台使用最适合的网络策略

## 部署到 Netlify

### 方法 1: 一键部署到 Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/AetherLink)

### 方法 2: 手动部署

1. **克隆仓库**
```bash
git clone https://github.com/your-username/AetherLink.git
cd AetherLink
```

2. **安装依赖**
```bash
npm install
```

3. **构建应用**
```bash
npm run build:pwa
```

4. **本地预览**（可选）
```bash
npm run preview:pwa
```

5. **部署到 Netlify**
   - 登录 Netlify 控制台
   - 点击 "New site from Git"
   - 选择你的仓库
   - 设置构建命令: `npm run netlify:build`
   - 设置发布目录: `dist`
   - 部署！

## 自定义 MCP 服务器配置

PWA 版本支持用户自定义 MCP 服务器：

1. 访问 PWA 设置页面 (`/pwa-settings`)
2. 点击 "添加 MCP 服务器"
3. 输入服务器名称、URL 和 API 密钥
4. 保存配置

支持的 MCP 服务器类型：
- HTTP/HTTPS 服务器
- SSE (Server-Sent Events) 服务器
- 自定义 MCP 实现

## 自定义搜索引擎配置

支持多种网络搜索提供者：

- **Tavily** - AI 驱动的搜索
- **Bing Free** - 免费的 Bing 搜索
- **Exa** - 语义搜索
- **Bocha** - 中文搜索
- **自定义** - 支持自定义搜索 API

## 跨域问题解决方案

AetherLink PWA 版本通过以下方式解决跨域问题：

1. **移动端** - 使用 Capacitor CORS Bypass 插件
2. **桌面端** - 使用内置代理服务
3. **Web 环境** - 通过 Service Worker 和代理处理

## 环境要求

- **Node.js** >= 22.0.0
- **npm** >= 10.0.0
- 现代浏览器（支持 PWA 功能）

## 配置持久化

所有自定义配置（MCP 服务器、搜索引擎）都保存在浏览器本地存储中：
- 配置仅在当前设备和浏览器中有效
- 清除浏览器数据会导致配置丢失
- 建议导出配置备份

## 故障排除

### PWA 安装问题
- 确保网站通过 HTTPS 访问
- 检查 manifest.webmanifest 文件是否正确
- 确认 Service Worker 已正确注册

### MCP 功能不工作
- 检查服务器 URL 是否正确
- 确认 API 密钥是否有效
- 查看浏览器控制台是否有错误信息

### 网络搜索问题
- 验证 API 密钥是否正确配置
- 检查网络连接是否正常
- 确认搜索提供者是否支持

## 开发与调试

### 本地开发
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build:pwa
```

### 本地预览生产版本
```bash
npm run preview:pwa
```

### 验证 PWA 配置
```bash
npm run pwa:validate
```

## 安全考虑

- API 密钥仅在客户端存储，不传输到服务器
- 建议使用具有适当权限限制的 API 密钥
- 定期检查和更新自定义服务器配置

## 支持

如遇到问题，请检查：
1. 浏览器控制台错误信息
2. 网络请求状态
3. PWA 安装状态
4. Service Worker 注册状态

更多帮助请查看项目文档或提交 issue。