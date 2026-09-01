const CACHE_NAME = 'blackbox-v1';
const urlsToCache = ['/', '/index.html', '/manifest.json'];

// Installation du cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Activation : nettoyage des anciens caches
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
    })
  );
});

// Récupération des données (Stratégie : API en réseau, fichiers en cache)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  if (event.request.url.includes('/api/')) {
    // Pour les API, on va sur le réseau (pour avoir les pièces à jour)
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  } else {
    // Pour les fichiers statiques, on utilise le cache d'abord
    event.respondWith(
      caches.match(event.request).then((response) => response || fetch(event.request))
    );
  }
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon
  });
});

// (Optionnel) Gestion du clic sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si un onglet est déjà ouvert, on le focus
      for (const client of clientList) {
        if (client.url.includes('/')) {
          return client.focus();
        }
      }
      // Sinon on ouvre l'application
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});