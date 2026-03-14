'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Register service worker hanya di production
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('✅ ServiceWorker registered successfully:', registration.scope);
          },
          (err) => {
            console.log('❌ ServiceWorker registration failed:', err);
          }
        );
      });
    }

    // Log di development
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 PWA features disabled in development mode');
    }
  }, []);

  return null;
}