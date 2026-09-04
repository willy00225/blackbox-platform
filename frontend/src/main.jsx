import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// URL de l'API Backend (en dur pour la production)
const API_URL = 'https://blackbox-platform-production-7339.up.railway.app'

// ====== CONFIGURATION ======
// Mettre à `false` lorsque le service worker corrigé sera prêt
const CLEANUP_ON_START = true

// ====== NETTOYAGE DES ANCIENS CACHES ET SERVICE WORKERS ======
if (CLEANUP_ON_START) {
  // 1. Supprime tous les caches existants
  if ('caches' in window) {
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => caches.delete(key)))
    }).catch((err) => {
      // En production, ne pas afficher d'erreur dans la console
      if (import.meta.env.DEV) {
        console.warn('Erreur lors du nettoyage des caches:', err)
      }
    })
  }

  // 2. Désenregistre tous les Service Workers actifs
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister()
      })
    }).catch((err) => {
      if (import.meta.env.DEV) {
        console.warn('Erreur lors du désenregistrement des SW:', err)
      }
    })
  }
}

// ====== RENDU DE L'APPLICATION ======
// Note : Tant que CLEANUP_ON_START est true, l'application se charge depuis le réseau.
// Les notifications push et la PWA hors ligne seront désactivées.
// Nous réactiverons plus tard un service worker corrigé (avec skipWaiting, clients.claim, etc.)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)