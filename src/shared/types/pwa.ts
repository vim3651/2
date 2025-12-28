/**
 * PWA 相关类型定义
 */

// 自定义MCP配置
export interface CustomMCPConfig {
  id: string;
  name: string;
  url: string;
  apiKey?: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 自定义搜索提供者
export interface CustomSearchProvider {
  id: string;
  name: string;
  type: 'tavily' | 'bing-free' | 'exa' | 'bocha' | 'firecrawl' | 'custom';
  apiKey?: string;
  enabled: boolean;
  config?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// PWA配置存储
export interface PWAConfigStorage {
  mcpConfigs: CustomMCPConfig[];
  searchProviders: CustomSearchProvider[];
  lastUpdated: string;
}

// 代理配置
export interface ProxyConfig {
  proxyAvailable: boolean;
  useProxy: boolean;
  platform: 'capacitor' | 'tauri' | 'web';
}

// 代理请求选项
export interface ProxyRequestOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

// 代理响应
export interface ProxyResponse {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
}

// PWA状态
export interface PWAState {
  isPWA: boolean;
  isOnline: boolean;
  canInstall: boolean;
  installPrompt: any;
  installStatus: 'idle' | 'installing' | 'installed' | 'error';
  proxyConfig: ProxyConfig;
  customMCPConfigs: CustomMCPConfig[];
  customSearchProviders: CustomSearchProvider[];
}

// MCP服务器配置（扩展）
export interface ExtendedMCPServer {
  id: string;
  name: string;
  url: string;
  type: string;
  isActive: boolean;
  config?: {
    apiKey?: string;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
}

// 搜索提供者配置（扩展）
export interface ExtendedSearchProviderConfig {
  id: string;
  name: string;
  type: string;
  apiKey?: string;
  enabled: boolean;
  config?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}