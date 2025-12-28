import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  Typography,
  useTheme,
  Box,
  ListSubheader,
  Avatar,
  useMediaQuery,
  InputBase,
  Paper
} from '@mui/material';
import type { Model } from '../../../shared/types';
import { useSelector } from 'react-redux';
import type { SelectChangeEvent } from '@mui/material';
import { selectProviders } from '../../../shared/store/selectors/settingsSelectors';
import { UnifiedModelDisplay } from './UnifiedModelDisplay';
import { getModelIdentityKey, modelMatchesIdentity, parseModelIdentityKey } from '../../../shared/utils/modelUtils';
import { getProviderIcon, getModelOrProviderIcon } from '../../../shared/utils/providerIcons';

interface DropdownModelSelectorProps {
  selectedModel: Model | null;
  availableModels: Model[];
  handleModelSelect: (model: Model) => void;
  displayStyle?: 'icon' | 'text';
}

export const DropdownModelSelector: React.FC<DropdownModelSelectorProps> = ({
  selectedModel,
  availableModels,
  handleModelSelect,
  displayStyle = 'text'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const providers = useSelector(selectProviders);

  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getProviderName = React.useCallback((providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      return provider.name;
    }
    return providerId;
  }, [providers]);

  const groupedModels = React.useMemo(() => {
    const groups: { [key: string]: Model[] } = {};

    const filteredModels = searchTerm
      ? availableModels.filter(model => {
          const searchTermLower = searchTerm.toLowerCase();
          const modelName = model.name.toLowerCase();
          const modelDescription = model.description ? model.description.toLowerCase() : '';
          
          const nameMatch = modelName.includes(searchTermLower);
          const descriptionMatch = modelDescription.includes(searchTermLower);
          
          if (nameMatch || descriptionMatch) return true;
          
          const searchTerms = searchTermLower.split(' ').filter(term => term.length > 0);
          if (searchTerms.length > 1) {
            return searchTerms.every(term => 
              modelName.includes(term) || modelDescription.includes(term)
            );
          }
          
          return false;
        })
      : availableModels;

    filteredModels.forEach(model => {
      const providerId = model.provider || model.providerType || 'unknown';
      if (!groups[providerId]) {
        groups[providerId] = [];
      }
      groups[providerId].push(model);
    });

    const sortedGroups = Object.keys(groups).sort((a, b) => {
      const indexA = providers.findIndex(p => p.id === a);
      const indexB = providers.findIndex(p => p.id === b);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      const nameA = getProviderName(a);
      const nameB = getProviderName(b);
      return nameA.localeCompare(nameB);
    });

    return { groups, sortedGroups };
  }, [availableModels, getProviderName, providers, searchTerm]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const identityValue = event.target.value;
    if (!identityValue || typeof identityValue !== 'string') return;

    setOpen(false);
    
    requestAnimationFrame(() => {
      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement?.getAttribute('role') === 'option') {
        activeElement.blur();
      }
    });

    try {
      const identity = parseModelIdentityKey(identityValue);
      if (!identity) {
        console.error('无法解析模型标识:', identityValue);
        return;
      }

      const model = availableModels.find(m =>
        modelMatchesIdentity(m, identity, m.provider)
      );

      if (model) {
        setTimeout(() => {
          handleModelSelect(model);
        }, 0);
      }
    } catch (error) {
      console.error('处理模型选择时出错:', error);
    }
  };

  const getIdentityValue = React.useCallback((model: Model): string => {
    return getModelIdentityKey({ id: model.id, provider: model.provider || model.providerType || '' });
  }, []);

  const getCurrentValue = React.useCallback((): string => {
    if (!selectedModel) return '';
    const selectedIdentity = parseModelIdentityKey(getIdentityValue(selectedModel));
    if (selectedIdentity) {
      const exactMatch = availableModels.find(m =>
        modelMatchesIdentity(m, selectedIdentity, m.provider)
      );
      if (exactMatch) {
        return getIdentityValue(exactMatch);
      }
    }
    return getIdentityValue(selectedModel);
  }, [selectedModel, getIdentityValue, availableModels]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // 定义背景色，供 MenuItem 和 Paper 使用，确保一致
  const menuBackgroundColor = theme.palette.mode === 'dark' ? '#2A2A2A' : theme.palette.background.paper;

  return (
    <Box sx={{ position: 'relative' }}>
      <UnifiedModelDisplay
        selectedModel={selectedModel}
        onClick={handleOpen}
        displayStyle={displayStyle}
      />

      <Select
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
        value={getCurrentValue()}
        onChange={handleChange}
        displayEmpty
        renderValue={() => null}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          pointerEvents: open ? 'auto' : 'none',
          '& .MuiSelect-select': { padding: 0, border: 'none', bgcolor: 'transparent' },
          '& .MuiSelect-icon': { display: 'none' },
          '&:before': { display: 'none' },
          '&:after': { display: 'none' },
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
        }}
        MenuProps={{
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformOrigin: { vertical: 'top', horizontal: 'left' },
          PaperProps: {
            sx: {
              maxHeight: isMobile ? '50vh' : '70vh',
              minHeight: isMobile ? 150 : 300,
              width: isMobile ? '85vw' : 'auto',
              maxWidth: isMobile ? '85vw' : 400,
              minWidth: isMobile ? '300px' : 280,
              mt: 0.5,
              ...(isMobile && {
                maxWidth: 'calc(100vw - 32px)',
                marginLeft: 'auto',
                marginRight: 'auto'
              }),
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              bgcolor: menuBackgroundColor,
              borderRadius: 1,
              '& .MuiList-root': {
                py: 0,
                bgcolor: 'transparent',
                '&:focus': { outline: 'none' }
              }
            },
          }
        }}
      >
        {!open && selectedModel && (
          <MenuItem 
            key={getIdentityValue(selectedModel)} 
            value={getIdentityValue(selectedModel)}
            sx={{ display: 'none' }}
          />
        )}
              
        {/* 修复：搜索框添加 Sticky 定位，确保不被滚动遮挡 */}
        {open && (
          <MenuItem 
            disableRipple 
            sx={{ 
              p: 0, 
              m: 0, 
              borderBottom: 1, 
              borderColor: 'divider',
              position: 'sticky', // 关键：粘性定位
              top: 0,             // 关键：固定在顶部
              zIndex: 20,         // 关键：层级高于 ListSubheader (通常是 1)
              bgcolor: menuBackgroundColor, // 关键：不透明背景
              '&:hover': {
                bgcolor: menuBackgroundColor // 防止悬停变色
              }
            }}
          >
            <Box sx={{ p: 1, width: '100%' }}>
              <Paper
                elevation={0}
                sx={{
                  p: '4px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: theme.palette.mode === 'dark' ? '#3A3A3A' : '#F5F5F5',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`, // 微调边框让其更明显
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? '#404040' : '#eaeaea',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem' }}>
                    🔍
                  </Typography>
                  <InputBase
                    placeholder="搜索模型..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                      flex: 1,
                      fontSize: '0.9rem',
                      '& .MuiInputBase-input': { py: 0.5, px: 1 }
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()} // 防止按键事件冒泡导致菜单选择移动
                  />
                  {searchTerm && (
                    <Box
                      component="button"
                      onClick={() => setSearchTerm('')}
                      sx={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: theme.palette.text.secondary,
                        fontSize: '1rem',
                        p: 0.5,
                        minWidth: 'auto',
                        borderRadius: '4px',
                        '&:hover': { bgcolor: theme.palette.mode === 'dark' ? '#555' : '#dadada' }
                      }}
                    >
                      ✕
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          </MenuItem>
        )}
                
        {open && groupedModels.sortedGroups.flatMap((providerId) => {
          const providerName = getProviderName(providerId);
          const models = groupedModels.groups[providerId];
        
          return [
            <ListSubheader
              key={`header-${providerId}`}
              sx={{
                bgcolor: menuBackgroundColor, // 与菜单背景一致
                fontWeight: 600,
                fontSize: '0.8rem',
                py: 0.75,
                px: 2,
                minHeight: 32,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                position: 'sticky',
                top: 0, // 这里的 top:0 会让标题在滚动到搜索框下方时自动“潜入”下方，或者被搜索框覆盖（因为搜索框 zIndex 高）
                zIndex: 10,
                borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                '&:not(:first-of-type)': {
                  borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
                }
              }}
            >
              <Avatar
                src={getProviderIcon(providerId, theme.palette.mode === 'dark')}
                alt={providerName}
                sx={{
                  width: 16,
                  height: 16,
                  bgcolor: 'transparent',
                  fontSize: '0.65rem'
                }}
              >
                {providerName[0]}
              </Avatar>
              {providerName}
            </ListSubheader>,
            
            ...models.map((model) => {
              const identityValue = getIdentityValue(model);
        
              return (
                <MenuItem
                  key={identityValue}
                  value={identityValue}
                  sx={{
                    py: 1,
                    pl: 3,
                    pr: 2,
                    minHeight: 40,
                    bgcolor: 'transparent',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                    },
                    '&.Mui-selected': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.1)',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.15)'
                      }
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', maxWidth: '100%' }}>
                    <Avatar
                      src={getModelOrProviderIcon(model.id, model.provider || model.providerType || '', theme.palette.mode === 'dark')}
                      alt={model.name}
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: 'transparent',
                        fontSize: '0.7rem',
                        flexShrink: 0
                      }}
                    >
                      {model.name[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%'
                        }}
                        title={model.name}
                      >
                        {model.name}
                      </Typography>
                      {model.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            fontSize: '0.75rem',
                            lineHeight: 1.2,
                            mt: 0.25,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%'
                          }}
                          title={model.description}
                        >
                          {model.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </MenuItem>
              );
            }).filter(Boolean)
          ].filter(Boolean);
        })}
      </Select>
    </Box>
  );
};

export default DropdownModelSelector;
