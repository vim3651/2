/**
 * GitHub Pages CORS 代理配置
 * 
 * 注意：GitHub Pages 是静态托管服务，无法运行 Node.js 服务器
 * 以下是前端配置，需要配合外部代理服务使用
 */

// 配置代理服务端点
const CORS_PROXY_ENDPOINTS = {
  // 免费的公共代理服务
  PUBLIC_PROXY: 'https://api.allorigins.win/raw?url=',
  // 或者使用 CORS Anywhere（不稳定）
  CORS_ANYWHERE: 'https://cors-anywhere.herokuapp.com/',
  // 自定义代理服务（推荐）
  CUSTOM_PROXY: 'https://your-custom-proxy.com/proxy?url='
};

// 当前使用的代理服务
const CURRENT_PROXY = CORS_PROXY_ENDPOINTS.PUBLIC_PROXY;

/**
 * 为请求添加代理
 */
function addProxyToUrl(url) {
  // 检查是否为外部请求（需要代理）
  const parsedUrl = new URL(url, window.location.href);
  const isExternal = parsedUrl.origin !== window.location.origin;
  
  if (isExternal) {
    // 使用代理包装外部请求
    return CURRENT_PROXY + encodeURIComponent(url);
  }
  
  return url;
}

/**
 * 通用代理 fetch 函数
 */
async function proxyFetch(url, options = {}) {
  const proxiedUrl = addProxyToUrl(url);
  return fetch(proxiedUrl, options);
}

// 导出供全局使用
window.CorsProxy = {
  addProxyToUrl,
  proxyFetch,
  endpoints: CORS_PROXY_ENDPOINTS
};

console.log('GitHub Pages CORS 代理配置已加载');