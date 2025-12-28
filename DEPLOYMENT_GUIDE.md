# AetherLink 部署和配置指南

## 目录
1. [GitHub Pages 部署](#github-pages-部署)
2. [Netlify 部署](#netlify-部署)
3. [MCP 服务自定义配置](#mcp-服务自定义配置)
4. [搜索引擎自定义配置](#搜索引擎自定义配置)
5. [跨域问题解决方案](#跨域问题解决方案)

## GitHub Pages 部署

### 跨域问题解决方案

GitHub Pages 是静态托管服务，无法运行 Node.js 服务器。我们通过以下方式解决跨域问题：

1. **公共代理服务**: 项目已配置使用公共代理服务来绕过 CORS 限制
2. **GitHub Pages 检测**: 自动检测 `.github.io` 域名并应用代理

### 部署步骤

1. 构建项目：
```bash
npm run build:pwa
```

2. 将 `dist` 目录内容推送到 GitHub Pages 分支

3. 在 GitHub 仓库设置中启用 GitHub Pages

### GitHub Pages 特殊配置

项目中已添加 `public/cors-proxy.js` 文件，自动检测 GitHub Pages 环境并使用适当的代理服务。

## Netlify 部署

### 配置文件

`netlify.toml` 文件已配置 CORS 头，支持跨域请求：

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "*"
    Access-Control-Max-Age = "86400"
```

### 部署步骤

1. 登录 Netlify 并创建新站点
2. 选择项目仓库
3. 设置构建命令：
   - 构建命令: `npm run netlify:build`
   - 发布目录: `dist`
4. 部署完成

## MCP 服务自定义配置

### 配置管理

项目包含 MCP 服务配置管理器，支持用户自定义 MCP 服务器：

```typescript
import { MCPConfigManager } from './shared/utils/mcpConfigManager';

// 添加 MCP 服务器配置
const newConfig = MCPConfigManager.addConfig({
  name: 'My MCP Server',
  url: 'https://my-mcp-server.com',
  apiKey: 'your-api-key',
  enabled: true,
  type: 'sse', // 或 'http', 'stdio'
  description: 'Custom MCP server'
});

// 获取所有启用的配置
const enabledConfigs = MCPConfigManager.getEnabledConfigs();

// 测试连接
const isConnected = await MCPConfigManager.testConnection(newConfig);
```

### 配置存储

- 配置存储在浏览器本地存储中 (`localStorage`)
- 键名: `custom-mcp-servers`
- 配置在当前设备和浏览器中有效

## 搜索引擎自定义配置

### 配置管理

项目包含搜索引擎配置管理器，支持多种搜索引擎：

```typescript
import { SearchEngineConfigManager } from './shared/utils/searchEngineConfigManager';

// 添加搜索引擎配置
const newConfig = SearchEngineConfigManager.addConfig({
  name: 'My Search Engine',
  apiHost: 'https://api.mysearch.com',
  apiKey: 'your-api-key',
  enabled: true,
  type: 'tavily', // 或 'exa', 'bocha', 'firecrawl', 'cloudflare-ai-search', 'custom'
  description: 'Custom search engine',
  timeout: 10000,
  maxResults: 10
});

// 获取所有启用的配置
const enabledConfigs = SearchEngineConfigManager.getEnabledConfigs();

// 测试连接
const isConnected = await SearchEngineConfigManager.testConnection(newConfig);
```

### 支持的搜索引擎类型

- **Tavily**: AI 驱动的搜索
- **Exa**: 神经搜索
- **Bocha**: AI 搜索
- **Firecrawl**: 网页抓取
- **Cloudflare AI Search**: 基于 Cloudflare 的搜索
- **Bing**: 免费 Bing 搜索
- **Custom**: 自定义搜索引擎

## 跨域问题解决方案

### 不同环境的处理方式

1. **本地开发环境**:
   - 使用内置 CORS 代理服务器 (`http://localhost:8888/proxy`)
   - 启动命令: `npm run dev`

2. **GitHub Pages**:
   - 自动检测 `.github.io` 域名
   - 使用公共代理服务 (`https://api.allorigins.win/raw?url=`)
   - 无需额外配置

3. **Netlify**:
   - 通过响应头配置 CORS
   - 支持跨域请求

4. **移动端**:
   - 使用 Capacitor CORS Bypass 插件
   - 直接请求外部 API

### 配置持久化

所有自定义配置（MCP 服务器、搜索引擎）都保存在浏览器本地存储中：

- 配置仅在当前设备和浏览器中有效
- 清除浏览器数据会导致配置丢失
- 建议导出配置备份

### 故障排除

#### GitHub Pages 问题
- 确保 URL 以 `.github.io` 结尾
- 检查公共代理服务是否可用
- 查看浏览器控制台是否有错误信息

#### MCP 功能不工作
- 检查服务器 URL 是否正确
- 确认 API 密钥是否有效
- 查看浏览器控制台是否有错误信息

#### 网络搜索问题
- 验证 API 密钥是否正确配置
- 检查网络连接是否正常
- 确认搜索提供者是否支持

## 分享给同学

### 部署到 Netlify

1. 将项目部署到 Netlify
2. 获取 Netlify URL
3. 同学访问 URL 即可使用

### 自定义配置

1. 同学可以访问设置页面自定义 MCP 服务器
2. 同学可以配置自己的搜索引擎 API 密钥
3. 所有配置保存在本地浏览器中

### 支持的协议

MCP 服务支持以下协议：
- SSE (Server-Sent Events)
- HTTP/HTTPS
- STDIO (标准输入输出)

通过以上配置，同学们可以自定义安装支持各种协议的 MCP 服务，并配置自己的搜索引擎。