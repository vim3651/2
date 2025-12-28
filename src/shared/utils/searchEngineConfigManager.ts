/**
 * 搜索引擎配置管理器
 * 支持用户自定义搜索引擎配置
 */

import type { WebSearchProviderConfig } from '../types';

// 配置存储键
const SEARCH_ENGINE_CONFIG_KEY = 'custom-search-engines';

// 搜索引擎配置接口
export interface CustomSearchEngineConfig {
  id: string;
  name: string;
  apiHost: string;
  apiKey?: string;
  enabled: boolean;
  type: 'tavily' | 'bing' | 'exa' | 'bocha' | 'firecrawl' | 'cloudflare-ai-search' | 'custom';
  description?: string;
  customHeaders?: Record<string, string>;
  timeout?: number;
  maxResults?: number;
  // Cloudflare 专用字段
  accountId?: string;
  autoragName?: string;
}

/**
 * 搜索引擎配置管理器
 */
export class SearchEngineConfigManager {
  /**
   * 保存搜索引擎配置到本地存储
   */
  static saveConfig(config: CustomSearchEngineConfig[]): void {
    try {
      localStorage.setItem(SEARCH_ENGINE_CONFIG_KEY, JSON.stringify(config));
      console.log('[Search Engine Config Manager] 搜索引擎配置已保存:', config);
    } catch (error) {
      console.error('[Search Engine Config Manager] 保存搜索引擎配置失败:', error);
    }
  }

  /**
   * 从本地存储加载搜索引擎配置
   */
  static loadConfig(): CustomSearchEngineConfig[] {
    try {
      const configStr = localStorage.getItem(SEARCH_ENGINE_CONFIG_KEY);
      if (configStr) {
        const config = JSON.parse(configStr);
        console.log('[Search Engine Config Manager] 搜索引擎配置已加载:', config);
        return config;
      }
    } catch (error) {
      console.error('[Search Engine Config Manager] 加载搜索引擎配置失败:', error);
    }
    return [];
  }

  /**
   * 添加新的搜索引擎配置
   */
  static addConfig(config: Omit<CustomSearchEngineConfig, 'id'>): CustomSearchEngineConfig {
    const newConfig: CustomSearchEngineConfig = {
      ...config,
      id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const configs = this.loadConfig();
    configs.push(newConfig);
    this.saveConfig(configs);
    
    return newConfig;
  }

  /**
   * 更新搜索引擎配置
   */
  static updateConfig(config: CustomSearchEngineConfig): void {
    const configs = this.loadConfig();
    const index = configs.findIndex(c => c.id === config.id);
    if (index !== -1) {
      configs[index] = config;
      this.saveConfig(configs);
    }
  }

  /**
   * 删除搜索引擎配置
   */
  static deleteConfig(id: string): void {
    const configs = this.loadConfig();
    const filteredConfigs = configs.filter(c => c.id !== id);
    this.saveConfig(filteredConfigs);
  }

  /**
   * 根据 ID 获取搜索引擎配置
   */
  static getConfigById(id: string): CustomSearchEngineConfig | undefined {
    const configs = this.loadConfig();
    return configs.find(c => c.id === id);
  }

  /**
   * 获取所有启用的搜索引擎配置
   */
  static getEnabledConfigs(): CustomSearchEngineConfig[] {
    const configs = this.loadConfig();
    return configs.filter(c => c.enabled);
  }

  /**
   * 测试搜索引擎连接
   */
  static async testConnection(config: CustomSearchEngineConfig): Promise<boolean> {
    try {
      // 根据搜索引擎类型选择测试方法
      switch (config.type) {
        case 'tavily':
          return await this.testTavilyConnection(config);
        case 'exa':
          return await this.testExaConnection(config);
        case 'bocha':
          return await this.testBochaConnection(config);
        case 'firecrawl':
          return await this.testFirecrawlConnection(config);
        case 'cloudflare-ai-search':
          return await this.testCloudflareConnection(config);
        case 'bing':
          // Bing 免费搜索无法通过 API 测试，返回 true
          return true;
        case 'custom':
          return await this.testCustomConnection(config);
        default:
          return false;
      }
    } catch (error) {
      console.error(`[Search Engine Config Manager] 搜索引擎连接测试失败: ${config.name}`, error);
      return false;
    }
  }

  /**
   * 测试 Tavily 连接
   */
  private static async testTavilyConnection(config: CustomSearchEngineConfig): Promise<boolean> {
    if (!config.apiKey) {
      console.error('[Search Engine Config Manager] Tavily API 密钥未配置');
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 10000);

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          query: 'test',
          max_results: 1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`[Search Engine Config Manager] Tavily 测试结果: ${response.status}`);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Search Engine Config Manager] Tavily 测试失败:', error);
      return false;
    }
  }

  /**
   * 测试 Exa 连接
   */
  private static async testExaConnection(config: CustomSearchEngineConfig): Promise<boolean> {
    if (!config.apiKey) {
      console.error('[Search Engine Config Manager] Exa API 密钥未配置');
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 10000);

    try {
      const response = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey
        },
        body: JSON.stringify({
          query: 'test',
          numResults: 1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`[Search Engine Config Manager] Exa 测试结果: ${response.status}`);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Search Engine Config Manager] Exa 测试失败:', error);
      return false;
    }
  }

  /**
   * 测试 Bocha 连接
   */
  private static async testBochaConnection(config: CustomSearchEngineConfig): Promise<boolean> {
    if (!config.apiKey) {
      console.error('[Search Engine Config Manager] Bocha API 密钥未配置');
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 10000);

    try {
      const response = await fetch('https://api.bocha.ai/v1/web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          query: 'test',
          count: 1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`[Search Engine Config Manager] Bocha 测试结果: ${response.status}`);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Search Engine Config Manager] Bocha 测试失败:', error);
      return false;
    }
  }

  /**
   * 测试 Firecrawl 连接
   */
  private static async testFirecrawlConnection(config: CustomSearchEngineConfig): Promise<boolean> {
    if (!config.apiKey) {
      console.error('[Search Engine Config Manager] Firecrawl API 密钥未配置');
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 10000);

    try {
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          query: 'test',
          limit: 1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`[Search Engine Config Manager] Firecrawl 测试结果: ${response.status}`);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Search Engine Config Manager] Firecrawl 测试失败:', error);
      return false;
    }
  }

  /**
   * 测试 Cloudflare AI Search 连接
   */
  private static async testCloudflareConnection(config: CustomSearchEngineConfig): Promise<boolean> {
    if (!config.apiKey || !config.accountId || !config.autoragName) {
      console.error('[Search Engine Config Manager] Cloudflare 配置不完整');
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 10000);

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/autorag/rags/${config.autoragName}/search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            query: 'test',
            max_num_results: 1
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      console.log(`[Search Engine Config Manager] Cloudflare 测试结果: ${response.status}`);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Search Engine Config Manager] Cloudflare 测试失败:', error);
      return false;
    }
  }

  /**
   * 测试自定义搜索引擎连接
   */
  private static async testCustomConnection(config: CustomSearchEngineConfig): Promise<boolean> {
    if (!config.apiHost) {
      console.error('[Search Engine Config Manager] 自定义搜索引擎 API Host 未配置');
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 10000);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.customHeaders
      };

      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const response = await fetch(config.apiHost, {
        method: 'GET', // 或根据需要使用 POST
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`[Search Engine Config Manager] 自定义搜索引擎测试结果: ${response.status}`);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Search Engine Config Manager] 自定义搜索引擎测试失败:', error);
      return false;
    }
  }

  /**
   * 导出配置为 JSON
   */
  static exportConfig(): string {
    const configs = this.loadConfig();
    return JSON.stringify(configs, null, 2);
  }

  /**
   * 从 JSON 导入配置
   */
  static importConfig(jsonStr: string): boolean {
    try {
      const configs = JSON.parse(jsonStr);
      if (Array.isArray(configs)) {
        this.saveConfig(configs);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[Search Engine Config Manager] 导入配置失败:', error);
      return false;
    }
  }
}

// 导出默认实例
export default new SearchEngineConfigManager();