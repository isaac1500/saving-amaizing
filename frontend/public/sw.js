// public/sw.js
const CACHE_NAME = 'savings-group-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json',
  '/offline.html'
];

// Cache names for different content types
const CACHES = {
  static: `${CACHE_NAME}-static`,
  images: `${CACHE_NAME}-images`,
  api: `${CACHE_NAME}-api`,
  firestore: `${CACHE_NAME}-firestore`
};

// Install event - cache static assets and activate immediately
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  // Activate immediately without waiting
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHES.static).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!Object.values(CACHES).includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Helper: Should we cache this request?
const shouldCache = (request) => {
  const url = new URL(request.url);
  
  // Cache our own API calls
  if (url.pathname.includes('/api/')) {
    return true;
  }
  
  // Cache static assets
  if (request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'font') {
    return true;
  }
  
  // Cache images including logo.png
  if (request.destination === 'image' || url.pathname.includes('logo.png')) {
    return true;
  }
  
  // Cache Firestore data (read-only GET requests)
  if (url.hostname.includes('firestore.googleapis.com') && request.method === 'GET') {
    return true;
  }
  
  return false;
};

// Helper: Get cache based on request type
const getCache = (request) => {
  const url = new URL(request.url);
  
  if (url.hostname.includes('firestore.googleapis.com')) {
    return CACHES.firestore;
  }
  if (request.destination === 'image' || url.pathname.includes('logo.png')) {
    return CACHES.images;
  }
  if (url.pathname.includes('/api/')) {
    return CACHES.api;
  }
  return CACHES.static;
};

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Don't cache non-GET requests
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }
  
  // Skip Firebase auth endpoints (they need to be fresh)
  if (url.hostname.includes('identitytoolkit.googleapis.com')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Skip if we shouldn't cache
  if (!shouldCache(request)) {
    event.respondWith(fetch(request));
    return;
  }
  
  const cacheName = getCache(request);
  
  event.respondWith(
    caches.open(cacheName).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          // Cache the network response for future
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((error) => {
          console.log('[Service Worker] Fetch failed:', error);
          // Return cached response if offline
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page for HTML requests
          if (request.headers.get('Accept') && request.headers.get('Accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
          // Return logo.png as fallback for image requests
          if (request.destination === 'image') {
            return caches.match('/logo.png');
          }
          throw error;
        });
        
        // Return cached response immediately if available, else wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// Background sync for offline transactions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync event:', event.tag);
  
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

// Sync pending transactions when back online
async function syncTransactions() {
  const db = await openIndexedDB();
  const pendingTxs = await getPendingTransactions(db);
  
  for (const tx of pendingTxs) {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx)
      });
      
      if (response.ok) {
        await deletePendingTransaction(db, tx.id);
        // Send notification
        self.registration.showNotification('Transaction Synced', {
          body: `Your ${tx.type} of ${tx.amount} has been synced`,
          icon: '/logo.png',
          badge: '/logo.png'
        });
      }
    } catch (err) {
      console.error('Failed to sync transaction:', err);
    }
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Your savings group has updates',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      transactionId: data.transactionId
    },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Savings Group Update', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

// Helper: Open IndexedDB for offline storage
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SavingsGroupDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingTransactions')) {
        db.createObjectStore('pendingTransactions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getPendingTransactions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingTransactions'], 'readonly');
    const store = transaction.objectStore('pendingTransactions');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deletePendingTransaction(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingTransactions'], 'readwrite');
    const store = transaction.objectStore('pendingTransactions');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}