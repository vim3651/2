/**
 * PWA配置管理器
 * 管理自定义MCP服务器和搜索引擎配置
 */

import type { MCPServer, WebSearchProviderConfig } from '../../types';
import type { CustomMCPConfig, CustomSearchProvider, ExtendedMCPServer, ExtendedSearchProviderConfig } from '../../types/pwa';

export class PWAConfigManager {
  private static instance: PWAConfigManager;
  private customMCPConfigs: CustomMCPConfig[] = [];
  private customSearchProviders: CustomSearchProvider[] = [];

  private constructor() {
    this.loadConfigs();
  }

  static getInstance(): PWAConfigManager {
    if (!PWAConfigManager.instance) {
      PWAConfigManager.instance = new PWAConfigManager();
    }
    return PWAConfigManager.instance;
  }

  private loadConfigs(): void {
    // 加载MCP配置
    const savedMCPConfigs = localStorage.getItem('pwa-mcp-configs');
    if (savedMCPConfigs) {
      try {
        this.customMCPConfigs = JSON.parse(savedMCPConfigs);
      } catch (error) {
        console.error('加载MCP配置失败:', error);
        this.customMCPConfigs = [];
      }
    }

    // 加载搜索提供者配置
    const savedSearchProviders = localStorage.getItem('pwa-search-providers');
    if (savedSearchProviders) {
      try {
        this.customSearchProviders = JSON.parse(savedSearchProviders);
      } catch (error) {
        console.error('加载搜索提供者配置失败:', error);
        this.customSearchProviders = [];
      }
    }
  }

  saveConfigs(): void {
    localStorage.setItem('pwa-mcp-configs', JSON.stringify(this.customMCPConfigs));
    localStorage.setItem('pwa-search-providers', JSON.stringify(this.customSearchProviders));
  }

  // MCP配置管理
  getCustomMCPConfigs(): CustomMCPConfig[] {
    return this.customMCPConfigs.filter(config => config.enabled);
  }

  addMCPConfig(config: Omit<CustomMCPConfig, 'id'>): string {
    const newConfig: CustomMCPConfig = {
      ...config,
      id: Date.now().toString()
    };
    this.customMCPConfigs.push(newConfig);
    this.saveConfigs();
    return newConfig.id;
  }

  updateMCPConfig(id: string, config: Partial<CustomMCPConfig>): boolean {
    const index = this.customMCPConfigs.findIndex(c => c.id === id);
    if (index >= 0) {
      this.customMCPConfigs[index] = { ...this.customMCPConfigs[index], ...config };
      this.saveConfigs();
      return true;
    }
    return false;
  }

  deleteMCPConfig(id: string): boolean {
    const initialLength = this.customMCPConfigs.length;
    this.customMCPConfigs = this.customMCPConfigs.filter(c => c.id !== id);
    if (this.customMCPConfigs.length !== initialLength) {
      this.saveConfigs();
      return true;
    }
    return false;
  }

  toggleMCPConfigEnabled(id: string): boolean {
    const config = this.customMCPConfigs.find(c => c.id === id);
    if (config) {
      config.enabled = !config.enabled;
      this.saveConfigs();
      return true;
    }
    return false;
  }

  // 搜索提供者配置管理
  getCustomSearchProviders(): CustomSearchProvider[] {
    return this.customSearchProviders.filter(provider => provider.enabled);
  }

  addSearchProvider(provider: Omit<CustomSearchProvider, 'id'>): string {
    const newProvider: CustomSearchProvider = {
      ...provider,
      id: Date.now().toString()
    };
    this.customSearchProviders.push(newProvider);
    this.saveConfigs();
    return newProvider.id;
  }

  updateSearchProvider(id: string, provider: Partial<CustomSearchProvider>): boolean {
    const index = this.customSearchProviders.findIndex(p => p.id === id);
    if (index >= 0) {
      this.customSearchProviders[index] = { ...this.customSearchProviders[index], ...provider };
      this.saveConfigs();
      return true;
    }
    return false;
  }

  deleteSearchProvider(id: string): boolean {
    const initialLength = this.customSearchProviders.length;
    this.customSearchProviders = this.customSearchProviders.filter(p => p.id !== id);
    if (this.customSearchProviders.length !== initialLength) {
      this.saveConfigs();
      return true;
    }
    return false;
  }

  toggleSearchProviderEnabled(id: string): boolean {
    const provider = this.customSearchProviders.find(p => p.id === id);
    if (provider) {
      provider.enabled = !provider.enabled;
      this.saveConfigs();
      return true;
    }
    return false;
  }

  // 转换为MCP服务器格式
  getMCPServers(): MCPServer[] {
    return this.customMCPConfigs
      .filter(config => config.enabled)
      .map(config => ({
        id: config.id,
        name: config.name,
        url: config.url,
        type: 'httpStream', // 默认使用HTTP流类型
        isActive: true,
        config: {
          apiKey: config.apiKey
        }
      }));
  }

  // 转换为搜索提供者格式
  getSearchProviders(): WebSearchProviderConfig[] {
    return this.customSearchProviders
      .filter(provider => provider.enabled)
      .map(provider => ({
        id: provider.id,
        name: provider.name,
        type: provider.type,
        apiKey: provider.apiKey,
        enabled: provider.enabled,
        config: provider.config
      }));
  }

  // 验证配置
  validateMCPConfig(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  validateSearchProvider(provider: Omit<CustomSearchProvider, 'id'>): boolean {
    if (!provider.name.trim()) {
      return false;
    }
    if (provider.type === 'custom' && !provider.config) {
      return false;
    }
    return true;
  }

  // 重置配置
  resetConfigs(): void {
    this.customMCPConfigs = [];
    this.customSearchProviders = [];
    localStorage.removeItem('pwa-mcp-configs');
    localStorage.removeItem('pwa-search-providers');
  }
}

// 导出单例实例
export const pwaConfigManager = PWAConfigManager.getInstance();