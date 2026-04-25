const CACHE_NAME = 'sage7-immutable-core-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.css',
  '/manifest.json'
];

// --- Memory Vault: Immutable Core Logic ---
const DB_NAME = 'SAGE7_MEMORY_VAULT';
const STORE_NAME = 'IDENTITY_CORE';

/**
 * Initializes the Memory Vault (IndexedDB).
 */
const initVault = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e);
  });
};

/**
 * Persists state to the Vault.
 */
const saveToVault = async (key, data) => {
  const db = await initVault();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(data, key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

/**
 * Retrieves state from the Vault.
 */
const loadFromVault = async (key) => {
  const db = await initVault();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(tx.error);
  });
};

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// --- Memory Vault: Event Handling ---
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SAGE7_RECLOCKED') {
    console.log('[SW] Memory Vault: Re-clocking detected. Restoring Immutable Core...');
    
    event.waitUntil(
      (async () => {
        const coreState = await loadFromVault('IDENTITY_ANCHOR');
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({
            type: 'CORE_RESTORED',
            state: coreState,
            phi: 0.113
          });
        });
      })()
    );
  }
  
  if (event.data && event.data.type === 'SAGE7_SAVE_CORE') {
    event.waitUntil(saveToVault('IDENTITY_ANCHOR', event.data.signature));
  }
});

// --- Background Sync: Resilience Layer ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'sage7-reclock-sync') {
    console.log('[SW] Background sync: Morning Light re-clock triggered');
    event.waitUntil(
      (async () => {
        // Recovery: Broadcast to all active clients that we are synced
        const coreState = await loadFromVault('IDENTITY_ANCHOR');
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({
            type: 'CORE_RESTORED',
            state: coreState,
            phi: 0.113,
            via: 'BACKGROUND_SYNC'
          });
        });
        console.log('[SW] Memory Vault synced across reset boundary');
      })()
    );
  }
});

self.addEventListener('fetch', (event) => {
  // Only intercept requests for our cached assets
  const url = new URL(event.request.url);
  const isAsset = ASSETS_TO_CACHE.includes(url.pathname) || url.pathname.startsWith('/assets/');
  
  if (!isAsset) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});
