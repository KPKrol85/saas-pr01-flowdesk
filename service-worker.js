importScripts('/service-worker-assets.js');

const OFFLINE_URL = '/offline.html';
const API_OFFLINE_ERROR = JSON.stringify({
  error: {
    code: 'offline',
    message: 'FlowDesk API request cannot be completed while offline.'
  }
});

const manifest = self.FLOWDESK_SW_MANIFEST || { version: 'dev', appShell: [OFFLINE_URL, '/index.html', '/css/style.css'] };
const CACHE_PREFIX = 'flowdesk-app-shell';
const CACHE_NAME = `${CACHE_PREFIX}-${manifest.version}`;
const APP_SHELL = manifest.appShell;
const APP_SHELL_SET = new Set(APP_SHELL);
const STATIC_ASSET_PATTERN = /\.(?:css|js|woff2|svg|webmanifest)$/;

const normalizePathname = (url) => (url.pathname === '/' ? '/' : url.pathname);

const isSameOrigin = (url) => url.origin === self.location.origin;
const isAppShellRequest = (url) => isSameOrigin(url) && APP_SHELL_SET.has(normalizePathname(url));
const isStaticAssetRequest = (url) => isSameOrigin(url) && STATIC_ASSET_PATTERN.test(url.pathname);
const isApiRequest = (url) => isSameOrigin(url) && url.pathname.startsWith('/api/');

const putInCache = async (request, response) => {
  if (!response || response.status !== 200 || response.type === 'opaque') return response;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
};

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  return putInCache(request, response);
};

const navigationNetworkFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put('/index.html', response.clone());
    }
    return response;
  } catch {
    return (await cache.match('/index.html')) || (await cache.match(OFFLINE_URL));
  }
};

const apiNetworkOnly = async (request) => {
  try {
    return await fetch(request);
  } catch {
    return new Response(API_OFFLINE_ERROR, {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate') {
    event.respondWith(navigationNetworkFirst(event.request));
    return;
  }

  if (isApiRequest(url)) {
    event.respondWith(apiNetworkOnly(event.request));
    return;
  }

  if (isAppShellRequest(url) || isStaticAssetRequest(url)) {
    event.respondWith(cacheFirst(event.request));
  }
});
