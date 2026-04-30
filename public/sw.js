// Finperso service worker — minimal offline-first shell.
// Bump CACHE_VERSION when you ship breaking changes to assets that should
// be re-fetched.

const CACHE_VERSION = 'finperso-v2'
const PRECACHE_URLS = [
  '/',
  '/login',
  '/register',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// Strategy:
// - Firebase / Firestore / auth: bypass entirely (network only).
// - Same-origin GET navigation: network-first, fallback to cache, then to /.
// - Same-origin GET asset: cache-first, populate on miss.
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // Bypass cross-origin (Firebase, Google APIs, fonts CDN, etc.).
  if (url.origin !== self.location.origin) return

  // Bypass dev HMR and Next internals — they need fresh responses.
  if (url.pathname.startsWith('/_next/webpack-hmr')) return
  if (url.pathname.startsWith('/api/')) return

  // Page navigations: network first.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {})
          return res
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match('/'))
        )
    )
    return
  }

  // Static assets: cache first.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req)
        .then((res) => {
          // Only cache successful, basic responses.
          if (res.ok && res.type === 'basic') {
            const copy = res.clone()
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {})
          }
          return res
        })
        .catch(() => cached)
    })
  )
})

// Allow the app to trigger an immediate update.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})
