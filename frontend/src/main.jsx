import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// URL de l'API Backend (en dur pour la production)
const API_URL = 'https://blackbox-platform-production-7339.up.railway.app'

// Fonction utilitaire pour convertir la clé VAPID en Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker enregistré avec succès :', registration.scope)
      })
      .catch(error => {
        console.error("Échec de l'enregistrement du Service Worker :", error)
      })
  })
}

// Demande de permission et enregistrement de l'abonnement push
if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array('BLtV8rcv-Go7A7CBUZCz1qJkVDmj9FH_kw67Wvx0N90MQVaP64JvD0-l2jqSXV4UTfEVwcMXxUGvjuRN2M3_524')
        })
        // Envoie l'abonnement au backend si l'utilisateur est connecté
        const user = JSON.parse(localStorage.getItem('user'))
        if (user) {
          await fetch(`${API_URL}/api/notifications/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, subscription })
          })
          console.log('Abonnement push enregistré')
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement push :', error)
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)