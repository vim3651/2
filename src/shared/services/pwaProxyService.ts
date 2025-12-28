/**
 * PWA代理服务
 * 用于在PWA模式下处理MCP和网络搜索的跨域请求
 */

import { isTauri, isCapacitor, isWeb } from '../utils/platformDetection';

import type { ProxyRequestOptions, ProxyResponse } from '../types/pwa';

/**
 * 检查是否需要使用代理
 */
function shouldUseProxy(url: string): boolean {
  // 在移动端和Tauri环境下不需要代理
  if (isCapacitor() || isTauri()) {
    return false;
  }
  
  // 检查是否为跨域请求
  try {
    const currentUrl = new URL(window.location.href);
    const targetUrl = new URL(url);
    return currentUrl.origin !== targetUrl.origin;
  } catch {
    return true; // 如果URL解析失败，假设需要代理
  }
}

/**
 * 通过代理发送请求
 */
async function proxyRequest(options: ProxyRequestOptions): Promise<ProxyResponse> {
  const { url, method = 'GET', headers = {}, body, timeout = 30000 } = options;
  
  // 构建代理URL
  const proxyUrl = `http://localhost:8888/proxy?url=${encodeURIComponent(url)}`;
  
  const proxyHeaders = {
    ...headers,
    'X-Original-URL': url,
    'X-Requested-With': 'PWA-Proxy',
  };
  
  const proxyOptions: RequestInit = {
    method,
    headers: proxyHeaders,
    ...(body && { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    signal: AbortSignal.timeout(timeout)
  };
  
  const response = await fetch(proxyUrl, proxyOptions);
  
  let data;
  try {
    data = await response.json();
  } catch {
    data = await response.text();
  }
  
  return {
    status: response.status,
    statusText: response.statusText,
    data,
    headers: Object.fromEntries(response.headers.entries())
  };
}

/**
 * 通用代理请求函数
 */
export async function universalProxyRequest(options: ProxyRequestOptions): Promise<ProxyResponse> {
  // 移动端和Tauri直接使用原生能力
  if (isCapacitor() || isTauri()) {
    // 移动端和Tauri环境直接使用fetch，依赖原生CORS绕过
    const response = await fetch(options.url, {
      method: options.method,
      headers: options.headers,
      body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
      signal: AbortSignal.timeout(options.timeout || 30000)
    });
    
    let data;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  }
  
  // PWA/Web环境使用代理
  if (shouldUseProxy(options.url)) {
    return await proxyRequest(options);
  }
  
  // 同源请求直接使用fetch
  const response = await fetch(options.url, {
    method: options.method,
    headers: options.headers,
    body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
    signal: AbortSignal.timeout(options.timeout || 30000)
  });
  
  let data;
  try {
    data = await response.json();
  } catch {
    data = await response.text();
  }
  
  return {
    status: response.status,
    statusText: response.statusText,
    data,
    headers: Object.fromEntries(response.headers.entries())
  };
}

/**
 * MCP请求代理
 */
export async function mcpProxyRequest(url: string, options: Omit<ProxyRequestOptions, 'url'> = {}): Promise<ProxyResponse> {
  return universalProxyRequest({
    url,
    ...options
  });
}

/**
 * 网络搜索请求代理
 */
export async function webSearchProxyRequest(url: string, options: Omit<ProxyRequestOptions, 'url'> = {}): Promise<ProxyResponse> {
  return universalProxyRequest({
    url,
    ...options
  });
}

/**
 * 检查代理服务器是否可用
 */
export async function checkProxyAvailability(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:8888/health');
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 获取代理配置
 */
export function getProxyConfig(): { 
  proxyAvailable: boolean; 
  useProxy: boolean; 
  platform: string 
} {
  const isNative = isCapacitor();
  const isTauriApp = isTauri();
  const platform = isNative ? 'capacitor' : (isTauriApp ? 'tauri' : 'web');
  
  return {
    proxyAvailable: !isNative && !isTauriApp, // 仅在Web/PWA环境下可用
    useProxy: !isNative && !isTauriApp,      // 仅在Web/PWA环境下使用
    platform
  };
}