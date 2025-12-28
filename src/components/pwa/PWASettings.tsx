/**
 * PWA设置组件
 * 提供自定义MCP服务器和搜索引擎选择功能
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Switch,
  FormControlLabel,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from 'lucide-react';
import { useStore } from '../../shared/store';
import { MCPServer, WebSearchProviderConfig } from '../../shared/types';

interface CustomMCPConfig {
  id: string;
  name: string;
  url: string;
  apiKey?: string;
  enabled: boolean;
}

interface CustomSearchProvider {
  id: string;
  name: string;
  type: 'tavily' | 'bing-free' | 'exa' | 'bocha' | 'custom';
  apiKey?: string;
  enabled: boolean;
  config?: Record<string, any>;
}

const PWASettings: React.FC = () => {
  const [customMCPConfigs, setCustomMCPConfigs] = useState<CustomMCPConfig[]>([]);
  const [customSearchProviders, setCustomSearchProviders] = useState<CustomSearchProvider[]>([]);
  const [newMCPConfig, setNewMCPConfig] = useState<Omit<CustomMCPConfig, 'id'> & { id?: string }>({
    name: '',
    url: '',
    apiKey: '',
    enabled: true
  });
  const [newSearchProvider, setNewSearchProvider] = useState<Omit<CustomSearchProvider, 'id'> & { id?: string }>({
    name: '',
    type: 'tavily',
    apiKey: '',
    enabled: true
  });
  const [editingMCPId, setEditingMCPId] = useState<string | null>(null);
  const [editingSearchId, setEditingSearchId] = useState<string | null>(null);
  const [showMCPForm, setShowMCPForm] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // 从localStorage加载配置
  useEffect(() => {
    const savedMCPConfigs = localStorage.getItem('pwa-mcp-configs');
    const savedSearchProviders = localStorage.getItem('pwa-search-providers');
    
    if (savedMCPConfigs) {
      try {
        setCustomMCPConfigs(JSON.parse(savedMCPConfigs));
      } catch {
        setCustomMCPConfigs([]);
      }
    }
    
    if (savedSearchProviders) {
      try {
        setCustomSearchProviders(JSON.parse(savedSearchProviders));
      } catch {
        setCustomSearchProviders([]);
      }
    }
  }, []);

  // 保存配置到localStorage
  const saveConfig = (key: string, config: any) => {
    localStorage.setItem(key, JSON.stringify(config));
  };

  const handleAddMCPConfig = () => {
    if (!newMCPConfig.name || !newMCPConfig.url) {
      return;
    }
    
    const config: CustomMCPConfig = {
      ...newMCPConfig,
      id: Date.now().toString()
    };
    
    const updated = [...customMCPConfigs, config];
    setCustomMCPConfigs(updated);
    saveConfig('pwa-mcp-configs', updated);
    
    setNewMCPConfig({
      name: '',
      url: '',
      apiKey: '',
      enabled: true
    });
    setShowMCPForm(false);
  };

  const handleUpdateMCPConfig = () => {
    if (!editingMCPId || !newMCPConfig.name || !newMCPConfig.url) {
      return;
    }
    
    const updated = customMCPConfigs.map(config => 
      config.id === editingMCPId ? { ...newMCPConfig, id: editingMCPId } as CustomMCPConfig : config
    );
    
    setCustomMCPConfigs(updated);
    saveConfig('pwa-mcp-configs', updated);
    
    setEditingMCPId(null);
    setNewMCPConfig({
      name: '',
      url: '',
      apiKey: '',
      enabled: true
    });
  };

  const handleDeleteMCPConfig = (id: string) => {
    const updated = customMCPConfigs.filter(config => config.id !== id);
    setCustomMCPConfigs(updated);
    saveConfig('pwa-mcp-configs', updated);
  };

  const handleAddSearchProvider = () => {
    if (!newSearchProvider.name) {
      return;
    }
    
    const provider: CustomSearchProvider = {
      ...newSearchProvider,
      id: Date.now().toString()
    };
    
    const updated = [...customSearchProviders, provider];
    setCustomSearchProviders(updated);
    saveConfig('pwa-search-providers', updated);
    
    setNewSearchProvider({
      name: '',
      type: 'tavily',
      apiKey: '',
      enabled: true
    });
    setShowSearchForm(false);
  };

  const handleUpdateSearchProvider = () => {
    if (!editingSearchId || !newSearchProvider.name) {
      return;
    }
    
    const updated = customSearchProviders.map(provider => 
      provider.id === editingSearchId ? { ...newSearchProvider, id: editingSearchId } as CustomSearchProvider : provider
    );
    
    setCustomSearchProviders(updated);
    saveConfig('pwa-search-providers', updated);
    
    setEditingSearchId(null);
    setNewSearchProvider({
      name: '',
      type: 'tavily',
      apiKey: '',
      enabled: true
    });
  };

  const handleDeleteSearchProvider = (id: string) => {
    const updated = customSearchProviders.filter(provider => provider.id !== id);
    setCustomSearchProviders(updated);
    saveConfig('pwa-search-providers', updated);
  };

  const startEditMCP = (config: CustomMCPConfig) => {
    setEditingMCPId(config.id);
    setNewMCPConfig({
      name: config.name,
      url: config.url,
      apiKey: config.apiKey,
      enabled: config.enabled
    });
  };

  const startEditSearch = (provider: CustomSearchProvider) => {
    setEditingSearchId(provider.id);
    setNewSearchProvider({
      name: provider.name,
      type: provider.type,
      apiKey: provider.apiKey,
      enabled: provider.enabled,
      config: provider.config
    });
  };

  const cancelEdit = () => {
    setEditingMCPId(null);
    setEditingSearchId(null);
    setNewMCPConfig({
      name: '',
      url: '',
      apiKey: '',
      enabled: true
    });
    setNewSearchProvider({
      name: '',
      type: 'tavily',
      apiKey: '',
      enabled: true
    });
  };

  const toggleMCPEnabled = (id: string) => {
    const updated = customMCPConfigs.map(config => 
      config.id === id ? { ...config, enabled: !config.enabled } : config
    );
    setCustomMCPConfigs(updated);
    saveConfig('pwa-mcp-configs', updated);
  };

  const toggleSearchEnabled = (id: string) => {
    const updated = customSearchProviders.map(provider => 
      provider.id === id ? { ...provider, enabled: !provider.enabled } : provider
    );
    setCustomSearchProviders(updated);
    saveConfig('pwa-search-providers', updated);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        PWA 设置
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        在PWA模式下自定义MCP服务器和网络搜索引擎配置
      </Alert>

      {/* MCP 服务器配置 */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            MCP 服务器配置
          </Typography>
          <IconButton onClick={() => toggleSection('mcp')}>
            {expandedSection === 'mcp' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={expandedSection === 'mcp' || expandedSection === null}>
          <List>
            {customMCPConfigs.map((config) => (
              <ListItem key={config.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                <ListItemText
                  primary={config.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {config.url}
                      </Typography>
                      <br />
                      <Chip 
                        label={config.enabled ? '启用' : '禁用'} 
                        size="small" 
                        color={config.enabled ? 'success' : 'default'}
                        sx={{ mt: 1 }}
                      />
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.enabled}
                        onChange={() => toggleMCPEnabled(config.id)}
                        color="primary"
                      />
                    }
                    label=""
                  />
                  <IconButton edge="end" onClick={() => startEditMCP(config)}>
                    <EditIcon size={16} />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDeleteMCPConfig(config.id)}>
                    <DeleteIcon size={16} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {(editingMCPId || showMCPForm) && (
            <Box sx={{ mt: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                {editingMCPId ? '编辑 MCP 服务器' : '添加 MCP 服务器'}
              </Typography>
              <TextField
                fullWidth
                label="服务器名称"
                value={newMCPConfig.name}
                onChange={(e) => setNewMCPConfig({ ...newMCPConfig, name: e.target.value })}
                margin="normal"
                size="small"
              />
              <TextField
                fullWidth
                label="服务器 URL"
                value={newMCPConfig.url}
                onChange={(e) => setNewMCPConfig({ ...newMCPConfig, url: e.target.value })}
                margin="normal"
                size="small"
              />
              <TextField
                fullWidth
                label="API 密钥 (可选)"
                value={newMCPConfig.apiKey || ''}
                onChange={(e) => setNewMCPConfig({ ...newMCPConfig, apiKey: e.target.value })}
                margin="normal"
                size="small"
                type="password"
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={editingMCPId ? <SaveIcon size={16} /> : <AddIcon size={16} />}
                  onClick={editingMCPId ? handleUpdateMCPConfig : handleAddMCPConfig}
                >
                  {editingMCPId ? '更新' : '添加'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon size={16} />}
                  onClick={cancelEdit}
                >
                  取消
                </Button>
              </Box>
            </Box>
          )}

          {!editingMCPId && (
            <Button
              startIcon={<AddIcon size={16} />}
              onClick={() => {
                setShowMCPForm(true);
                setNewMCPConfig({
                  name: '',
                  url: '',
                  apiKey: '',
                  enabled: true
                });
              }}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              添加 MCP 服务器
            </Button>
          )}
        </Collapse>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* 网络搜索提供者配置 */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            网络搜索提供者配置
          </Typography>
          <IconButton onClick={() => toggleSection('search')}>
            {expandedSection === 'search' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={expandedSection === 'search' || expandedSection === null}>
          <List>
            {customSearchProviders.map((provider) => (
              <ListItem key={provider.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                <ListItemText
                  primary={provider.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        类型: {provider.type}
                      </Typography>
                      <br />
                      <Chip 
                        label={provider.enabled ? '启用' : '禁用'} 
                        size="small" 
                        color={provider.enabled ? 'success' : 'default'}
                        sx={{ mt: 1 }}
                      />
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={provider.enabled}
                        onChange={() => toggleSearchEnabled(provider.id)}
                        color="primary"
                      />
                    }
                    label=""
                  />
                  <IconButton edge="end" onClick={() => startEditSearch(provider)}>
                    <EditIcon size={16} />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDeleteSearchProvider(provider.id)}>
                    <DeleteIcon size={16} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {(editingSearchId || showSearchForm) && (
            <Box sx={{ mt: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                {editingSearchId ? '编辑搜索提供者' : '添加搜索提供者'}
              </Typography>
              <TextField
                fullWidth
                label="提供者名称"
                value={newSearchProvider.name}
                onChange={(e) => setNewSearchProvider({ ...newSearchProvider, name: e.target.value })}
                margin="normal"
                size="small"
              />
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>类型</InputLabel>
                <Select
                  value={newSearchProvider.type}
                  label="类型"
                  onChange={(e) => setNewSearchProvider({ 
                    ...newSearchProvider, 
                    type: e.target.value as any 
                  })}
                >
                  <MenuItem value="tavily">Tavily</MenuItem>
                  <MenuItem value="bing-free">Bing Free</MenuItem>
                  <MenuItem value="exa">Exa</MenuItem>
                  <MenuItem value="bocha">Bocha</MenuItem>
                  <MenuItem value="custom">自定义</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="API 密钥 (可选)"
                value={newSearchProvider.apiKey || ''}
                onChange={(e) => setNewSearchProvider({ ...newSearchProvider, apiKey: e.target.value })}
                margin="normal"
                size="small"
                type="password"
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={editingSearchId ? <SaveIcon size={16} /> : <AddIcon size={16} />}
                  onClick={editingSearchId ? handleUpdateSearchProvider : handleAddSearchProvider}
                >
                  {editingSearchId ? '更新' : '添加'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon size={16} />}
                  onClick={cancelEdit}
                >
                  取消
                </Button>
              </Box>
            </Box>
          )}

          {!editingSearchId && (
            <Button
              startIcon={<AddIcon size={16} />}
              onClick={() => {
                setShowSearchForm(true);
                setNewSearchProvider({
                  name: '',
                  type: 'tavily',
                  apiKey: '',
                  enabled: true
                });
              }}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              添加搜索提供者
            </Button>
          )}
        </Collapse>
      </Paper>

      <Alert severity="info">
        配置将保存在浏览器本地存储中，仅在当前设备和浏览器中有效。
        重新安装PWA或清除浏览器数据将导致配置丢失。
      </Alert>
    </Box>
  );
};

export default PWASettings;