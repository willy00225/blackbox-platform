import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary' // ✅ Import ajouté
import './index.css'

// URL de l'API Backend (en dur pour la production)
const API_URL = 'https://blackbox-platform-production-7339.up.railway.app'

// ====== NETTOYAGE DES ANCIENS CACHES ET SERVICE WORKERS ======
// 1. Supprime tous les caches existants (pour éviter les versions obsolètes)
if ('caches' in window) {
  caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => caches.delete(key)))
  }).then(() => {
    console.log('🧹 Tous les anciens caches ont été supprimés.')
  })
}

// 2. Désenregistre tous les Service Workers actifs (cause de la page blanche)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister()
      console.log('🗑️ Service Worker désenregistré.')
    })
  })
}

// ====== RENDU NORMAL DE L'APPLICATION ======
// NOTE : On ne réenregistre pas de Service Worker pour le moment.
// Cela garantit que tous les utilisateurs chargent la version la plus récente.
// Nous le réactiverons plus tard avec une version corrigée et sécurisée.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary> {/* ✅ Enveloppement pour capturer les erreurs */}
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)