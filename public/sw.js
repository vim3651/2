/**
 * Service Worker for AetherLink PWA
 * 提供离线缓存和PWA功能支持
 */

const CACHE_NAME = 'aetherlink-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/static/js/*.js',
  '/static/css/*.css'
];

// 安装Service Worker时缓存资源
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 缓存已打开');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] 资源已缓存');
        return self.skipWaiting(); // 立即激活新版本
      })
      .catch((error) => {
        console.error('[Service Worker] 缓存失败:', error);
      })
  );
});

// 激活Service Worker时清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活中...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] 激活完成');
      return self.clients.claim(); // 接管所有页面
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  // 对于MCP和网络搜索请求，使用网络优先策略
  if (event.request.url.includes('/mcp') || 
      event.request.url.includes('/search') ||
      event.request.url.includes('/api')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 如果请求成功，返回响应
          if (response && response.status === 200) {
            return response;
          }
          throw new Error('Network request failed');
        })
        .catch(() => {
          // 网络请求失败时，返回错误响应（不使用缓存）
          return new Response('Network Error', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
  } else {
    // 对于静态资源，使用缓存优先策略
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // 如果找到缓存，返回缓存
          if (response) {
            return response;
          }
          // 否则发起网络请求
          return fetch(event.request);
        })
    );
  }
});

// 处理消息事件（用于与页面通信）
self.addEventListener('message', (event) => {
  console.log('[Service Worker] 收到消息:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 推送通知处理
self.addEventListener('push', (event) => {
  console.log('[Service Worker] 收到推送:', event.data);
  
  const payload = event.data ? event.data.json() : {};
  const title = payload.title || 'AetherLink';
  const options = {
    body: payload.body || '您有一条新消息',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-192.png',
    tag: payload.tag || 'aetherlink-notification'
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] 通知被点击');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data ? event.notification.data.url : '/')
  );
});