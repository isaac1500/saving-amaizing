// src/index.js
import 'disable-react-error-overlay';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    const updatePrompt = window.confirm('New version available! Update now?');
    if (updatePrompt) {
      window.location.reload();
    }
  },
  onSuccess: () => {
    console.log('PWA successfully installed');
  }
});

// DEBUG: Check if service worker is registered
// Add this code to check service worker status
setTimeout(() => {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg) {
      console.log('✅ Service Worker registered successfully:', reg);
      console.log('Service Worker scope:', reg.scope);
      console.log('Service Worker active:', reg.active);
      console.log('Service Worker waiting:', reg.waiting);
      console.log('Service Worker installing:', reg.installing);
    } else {
      console.log('❌ No Service Worker registered');
    }
  }).catch(err => {
    console.error('Error checking service worker:', err);
  });
}, 2000); // Delay to ensure registration completes

// Also check manifest
fetch('/manifest.json')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Manifest loaded successfully:', data);
    console.log('App name:', data.name);
    console.log('App short name:', data.short_name);
    console.log('Icons count:', data.icons?.length);
  })
  .catch(err => {
    console.error('❌ Failed to load manifest:', err);
  });

// Check if install prompt is available
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('✅ Install prompt is available! User can install the app.');
  console.log('Install prompt event:', e);
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Store the event for later use
  window.deferredPrompt = e;
});

// Check if app is already installed
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ App is running in standalone mode (installed)');
} else {
  console.log('📱 App is running in browser mode (not installed)');
}

reportWebVitals();