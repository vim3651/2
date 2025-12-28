import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'  // SWC 高性能编译，基于 Rust，比 Babel 快 10-75 倍
import solidPlugin from 'vite-plugin-solid'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// Rolldown-Vite + OXC + SolidJS 混合配置
// OXC 处理 React（高性能且与 rolldown 深度集成）
// SolidJS 用于性能关键页面
export default defineConfig(({ mode }) => ({
  base: './', // 使用相对路径，支持 GitHub Pages 部署
  plugins: [
    // SolidJS 插件 - 必须在 React 之前，处理 .solid.tsx 文件
    // 注意：vite-plugin-solid 尚未完全兼容 Rolldown，会有 esbuildOptions 警告（不影响功能）
    solidPlugin({
      include: /\.solid\.(tsx|jsx|ts|js)$/,
    }),
    // SWC 高性能 React 插件（基于 Rust，比 Babel 快 10-75 倍）
    react(),
    // 🖼️ 图片优化插件 - 仅在构建时启用，开发环境跳过
    ...(mode === 'production' ? [
      ViteImageOptimizer({
        // PNG 优化 (有损压缩，质量 80)
        png: {
          quality: 80, // 0-100，推荐 70-85
        },
        // JPEG 优化
        jpeg: {
          quality: 85, // 0-100，推荐 80-90
        },
        // SVG 优化 (移除无用代码)
        svg: {
          multipass: true,
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  cleanupNumericValues: false,
                  removeViewBox: false,
                },
              },
            },
          ],
        },
        // 缓存优化结果，避免重复处理
        cache: true,
        cacheLocation: 'node_modules/.cache/vite-plugin-image-optimizer',
      })
    ] : []),
    // 注意：Rolldown-Vite 内置了类型检查和优化，不需要额外插件
  ],


  // 开发服务器配置
  server: {
    port: 5173,
    host: process.env.TAURI_DEV_HOST || '0.0.0.0', // 使用 Tauri 提供的主机地址
    cors: false, // 完全禁用 CORS 检查
    strictPort: true, // 严格端口模式
    // 允许访问映射盘符路径（解决 J:/K: 盘符映射问题）
    fs: {
      allow: [
        'J:/Cherry/AetherLink-app3',
        'K:/Cherry/AetherLink-app3',
      ],
      strict: false, // 放宽文件系统限制（解决 J:/K: 盘符映射问题）
    },
    // 预热常用文件，提升首次加载速度
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx', './src/shared/store/index.ts'],
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    // 配置 HMR WebSocket 以支持 Tauri 移动端
    hmr: process.env.TAURI_DEV_HOST ? {
      protocol: 'ws',
      host: process.env.TAURI_DEV_HOST,
      port: 5174,
    } : {
      port: 5174
      // 不指定 host，Vite 会自动使用正确的地址（如 localhost）
    }
    // 注意：CORS 代理已迁移到独立的 scripts/cors-proxy.js
    // 所有跨域请求通过 http://localhost:8888/proxy 统一处理
  },

  // 预定义代理配置，用于生产环境构建
  preview: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
  },

  // 构建配置 - Rolldown-Vite 会自动使用内置优化
  build: {
    sourcemap: false, // 生产环境不生成sourcemap
    target: 'es2022', // 现代浏览器目标，生成更小的代码
    outDir: 'dist',
    rollupOptions: {
      // Rolldown 自动启用多线程优化，无需手动配置
      output: {
        // 使用 static 目录结构
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 500,
    // 注意：Rolldown 已自动启用持久化缓存（通过 cacheDir）
  },
  // 优化依赖预构建 - Rolldown-Vite 会自动优化
  optimizeDeps: {
    // 明确指定入口，排除 docs 目录（使用 ! 前缀）
    entries: ['index.html', '!docs/**'],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'redux-persist',
      'react-redux',
      'lodash',
      '@emotion/react',
      '@emotion/styled',
      'axios',
      'solid-js',
      'solid-js/web',
      'capacitor-advanced-file-manager',
    ],
    // 移除 force: true，避免每次都重新构建
    // force: true
    // 注意：Rolldown-Vite 使用内置优化，不需要 esbuildOptions
    // 启用持久化缓存
    holdUntilCrawlEnd: false, // 提前开始预构建，不等待所有依赖扫描完成
  },

  // 缓存配置 - 持久化缓存目录
  cacheDir: 'node_modules/.vite',
  
  // Rolldown 性能优化配置
  experimental: {
    // 启用 Rolldown 的实验性优化特性
    hmrPartialAccept: true, // HMR 部分接受优化
  },

  // 解析配置
  resolve: {
    alias: {
      '@': '/src',
    },
    // 处理符号链接问题
    preserveSymlinks: false,
  },

  // 定义全局常量
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  },
}))
