/**
 * MCP 服务配置管理器
 * 支持用户自定义 MCP 服务器配置
 */

import type { MCPServer } from '../types';

// 配置存储键
const MCP_CONFIG_KEY = 'custom-mcp-servers';

// MCP 服务器配置接口
export interface CustomMCPConfig {
  id: string;
  name: string;
  url: string;
  apiKey?: string;
  enabled: boolean;
  type?: 'sse' | 'http' | 'stdio';
  description?: string;
}

/**
 * MCP 配置管理器
 */
export class MCPConfigManager {
  /**
   * 保存 MCP 服务器配置到本地存储
   */
  static saveConfig(config: CustomMCPConfig[]): void {
    try {
      localStorage.setItem(MCP_CONFIG_KEY, JSON.stringify(config));
      console.log('[MCP Config Manager] MCP 服务器配置已保存:', config);
    } catch (error) {
      console.error('[MCP Config Manager] 保存 MCP 配置失败:', error);
    }
  }

  /**
   * 从本地存储加载 MCP 服务器配置
   */
  static loadConfig(): CustomMCPConfig[] {
    try {
      const configStr = localStorage.getItem(MCP_CONFIG_KEY);
      if (configStr) {
        const config = JSON.parse(configStr);
        console.log('[MCP Config Manager] MCP 服务器配置已加载:', config);
        return config;
      }
    } catch (error) {
      console.error('[MCP Config Manager] 加载 MCP 配置失败:', error);
    }
    return [];
  }

  /**
   * 添加新的 MCP 服务器配置
   */
  static addConfig(config: Omit<CustomMCPConfig, 'id'>): CustomMCPConfig {
    const newConfig: CustomMCPConfig = {
      ...config,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const configs = this.loadConfig();
    configs.push(newConfig);
    this.saveConfig(configs);
    
    return newConfig;
  }

  /**
   * 更新 MCP 服务器配置
   */
  static updateConfig(config: CustomMCPConfig): void {
    const configs = this.loadConfig();
    const index = configs.findIndex(c => c.id === config.id);
    if (index !== -1) {
      configs[index] = config;
      this.saveConfig(configs);
    }
  }

  /**
   * 删除 MCP 服务器配置
   */
  static deleteConfig(id: string): void {
    const configs = this.loadConfig();
    const filteredConfigs = configs.filter(c => c.id !== id);
    this.saveConfig(filteredConfigs);
  }

  /**
   * 根据 ID 获取 MCP 服务器配置
   */
  static getConfigById(id: string): CustomMCPConfig | undefined {
    const configs = this.loadConfig();
    return configs.find(c => c.id === id);
  }

  /**
   * 获取所有启用的 MCP 服务器配置
   */
  static getEnabledConfigs(): CustomMCPConfig[] {
    const configs = this.loadConfig();
    return configs.filter(c => c.enabled);
  }

  /**
   * 测试 MCP 服务器连接
   */
  static async testConnection(config: CustomMCPConfig): Promise<boolean> {
    try {
      // 根据 MCP 服务器类型选择测试方法
      if (config.type === 'stdio') {
        // 对于 STDIO 类型，可能需要特殊处理
        console.log(`[MCP Config Manager] STDIO 类型服务器测试: ${config.name}`);
        return true; // 假设 STDIO 连接总是可用
      } else {
        // 对于 HTTP/SSE 类型，发送测试请求
        const testUrl = config.url.endsWith('/') ? config.url : config.url + '/';
        // 创建 AbortController 来实现超时
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
        
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {},
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`[MCP Config Manager] MCP 服务器测试结果: ${response.status} for ${config.name}`);
        return response.ok;
      }
    } catch (error) {
      console.error(`[MCP Config Manager] MCP 服务器连接测试失败: ${config.name}`, error);
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
      console.error('[MCP Config Manager] 导入配置失败:', error);
      return false;
    }
  }
}

// 导出默认实例
export default new MCPConfigManager();