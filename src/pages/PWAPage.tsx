/**
 * PWA 页面
 * 提供PWA特定功能和设置
 */

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Alert, 
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import { Download, Settings, RefreshCw, Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react';
import PWASettings from '../components/pwa/PWASettings';
import { pwaConfigManager } from '../shared/services/pwa/PWAConfigManager';
import { getProxyConfig } from '../shared/services/pwaProxyService';

const PWAPage: React.FC = () => {
  const [isPWA, setIsPWA] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'installed' | 'error'>('idle');
  const [proxyConfig, setProxyConfig] = useState(getProxyConfig());
  const [mcpConfigs, setMcpConfigs] = useState(pwaConfigManager.getMCPServers());
  const [searchProviders, setSearchProviders] = useState(pwaConfigManager.getSearchProviders());

  // 检测是否在PWA模式下运行
  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true ||
                  document.referrer.includes('android-app://') ||
                  document.referrer.includes('ios-app://');
    
    setIsPWA(isPWA);
    
    // 监听网络状态变化
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 监听安装事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // 监听安装完成事件
    window.addEventListener('appinstalled', () => {
      setInstallStatus('installed');
      setInstallPrompt(null);
    });
    
    // 初始化配置
    updateConfigs();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // 更新配置
  const updateConfigs = () => {
    setMcpConfigs(pwaConfigManager.getMCPServers());
    setSearchProviders(pwaConfigManager.getSearchProviders());
    setProxyConfig(getProxyConfig());
  };

  // 处理PWA安装
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    setIsInstalling(true);
    setInstallStatus('installing');
    
    try {
      (installPrompt as any).prompt();
      const { outcome } = await (installPrompt as any).userChoice;
      
      if (outcome === 'accepted') {
        setInstallStatus('installed');
      } else {
        setInstallStatus('idle');
      }
    } catch (error) {
      console.error('安装失败:', error);
      setInstallStatus('error');
    } finally {
      setIsInstalling(false);
      setInstallPrompt(null);
    }
  };

  // 刷新配置
  const handleRefresh = () => {
    updateConfigs();
  };

  // 重置PWA配置
  const handleResetConfigs = () => {
    pwaConfigManager.resetConfigs();
    updateConfigs();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        PWA 设置中心
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="PWA 状态" 
              avatar={<Settings size={20} />}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    icon={isPWA ? <CheckCircle size={16} /> : <XCircle size={16} />} 
                    label={isPWA ? 'PWA 模式' : '浏览器模式'} 
                    color={isPWA ? 'success' : 'default'} 
                    variant="outlined"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    icon={isOnline ? <Wifi size={16} /> : <WifiOff size={16} />} 
                    label={isOnline ? '在线' : '离线'} 
                    color={isOnline ? 'success' : 'warning'} 
                    variant="outlined"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={`平台: ${proxyConfig.platform}`} 
                    variant="outlined"
                  />
                  <Chip 
                    label={`代理: ${proxyConfig.useProxy ? '启用' : '禁用'}`} 
                    variant="outlined"
                  />
                </Box>
                
                {installPrompt && (
                  <Button
                    variant="contained"
                    startIcon={<Download size={16} />}
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    sx={{ mt: 1 }}
                  >
                    {isInstalling ? '安装中...' : '安装 PWA'}
                  </Button>
                )}
                
                {installStatus === 'installed' && (
                  <Alert severity="success">
                    PWA 已成功安装！
                  </Alert>
                )}
                
                {installStatus === 'error' && (
                  <Alert severity="error">
                    安装失败，请重试
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="配置状态" 
              action={
                <Button
                  startIcon={<RefreshCw size={16} />}
                  onClick={handleRefresh}
                  size="small"
                >
                  刷新
                </Button>
              }
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>自定义 MCP 服务器:</Typography>
                  <Chip 
                    label={mcpConfigs.length} 
                    color={mcpConfigs.length > 0 ? 'primary' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>自定义搜索引擎:</Typography>
                  <Chip 
                    label={searchProviders.length} 
                    color={searchProviders.length > 0 ? 'primary' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleResetConfigs}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  重置配置
                </Button>
                
                <Alert severity="info" sx={{ mt: 1 }}>
                  配置保存在浏览器本地存储中
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          自定义配置
        </Typography>
        <PWASettings />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          PWA 功能说明
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>PWA (Progressive Web App) 功能:</strong><br />
            • 离线访问: 即使没有网络连接也能使用应用<br />
            • 主屏幕安装: 像原生应用一样安装到设备<br />
            • 推送通知: 接收实时更新和通知<br />
            • 自定义MCP服务器: 添加自己的MCP服务<br />
            • 自定义搜索引擎: 配置个人搜索提供者
          </Typography>
        </Alert>
        
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>重要提示:</strong> 自定义MCP服务器和搜索引擎配置仅在PWA模式下生效。
            请确保您已安装应用到主屏幕以获得完整体验。
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

export default PWAPage;