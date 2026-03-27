// ATTEMPT 4.26: SERVICE WORKER NAVIGATION INTERCEPTOR
// This worker aim to bypass Next.js 16 Router Cache by forcing a fresh network fetch on navigation.

const CACHE_NAME = 'navigation-bypass-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only intercept navigation requests (full page loads/back-forward)
  if (event.request.mode === 'navigate') {
    console.log('[SW] Intercepting navigation to:', event.request.url);
    
    event.respondWith(
      fetch(event.request, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }).catch(() => {
        // Fallback to standard fetch if something goes wrong
        return fetch(event.request);
      })
    );
  }
});
