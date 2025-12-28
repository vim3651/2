# 部署说明

## 部署到 Netlify

### 准备工作

1. 确保项目已构建完成：
   ```bash
   npm run build:pwa
   ```

2. 检查 `netlify.toml` 配置文件是否包含正确的 CORS 头配置

### 部署步骤

1. **登录 Netlify**
   - 访问 [Netlify](https://app.netlify.com/)
   - 使用 GitHub 账户登录

2. **创建新站点**
   - 点击 "New site from Git"
   - 选择你的 GitHub 仓库
   - 配置构建设置：
     - 构建命令: `npm run netlify:build`
     - 发布目录: `dist`

3. **部署**
   - 点击 "Deploy site"
   - 等待构建完成
   - 获取你的 Netlify URL

### 分享给同学

1. 将 Netlify URL 分享给同学们
2. 同学们可以访问该 URL 使用应用
3. 同学们可以在设置页面自定义配置 MCP 服务器和搜索引擎

## 自定义配置

### MCP 服务配置

1. 访问设置页面 (`/settings/mcp-server`)
2. 点击 "添加 MCP 服务器"
3. 输入服务器信息：
   - 名称：服务器名称
   - URL：服务器地址
   - API 密钥：如果需要
   - 类型：SSE、HTTP 或 STDIO
4. 保存配置

### 搜索引擎配置

1. 访问设置页面 (`/settings/web-search`)
2. 选择搜索引擎提供商
3. 输入 API 密钥（如果需要）
4. 保存配置

## 支持的协议

### MCP 服务支持的协议
- **SSE (Server-Sent Events)**: 服务器发送事件协议
- **HTTP/HTTPS**: 标准 HTTP 协议
- **STDIO**: 标准输入输出协议

### 搜索引擎支持的提供商
- **Tavily**: AI 驱动的搜索
- **Exa**: 神经搜索
- **Bocha**: AI 搜索
- **Firecrawl**: 网页抓取
- **Cloudflare AI Search**: 基于 Cloudflare 的搜索
- **Bing**: 免费 Bing 搜索
- **自定义**: 自定义搜索引擎

## GitHub Pages 部署（备选方案）

如果 Netlify 不可用，也可以部署到 GitHub Pages：

1. 构建项目：
   ```bash
   npm run build:pwa
   ```

2. 将 `dist` 目录内容推送到 GitHub 仓库的 `gh-pages` 分支

3. 在 GitHub 仓库设置中启用 GitHub Pages

**注意**: GitHub Pages 是静态托管，跨域请求通过公共代理服务处理，可能不如 Netlify 稳定。

## 故障排除

### 跨域问题
- 检查浏览器控制台是否有 CORS 错误
- 确认代理服务是否正常工作
- 验证 MCP 服务器和搜索引擎的 URL 是否正确

### MCP 服务不工作
- 检查 MCP 服务器 URL 是否可访问
- 确认 API 密钥是否正确
- 验证服务器是否支持所选协议

### 搜索引擎不工作
- 检查 API 密钥是否正确
- 确认搜索引擎提供商是否可用
- 验证网络连接是否正常

## 配置备份

所有自定义配置都保存在浏览器本地存储中：
- 配置仅在当前设备和浏览器中有效
- 清除浏览器数据会导致配置丢失
- 建议导出配置备份（如果有导出功能）