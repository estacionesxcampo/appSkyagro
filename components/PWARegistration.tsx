'use client';

import { useEffect } from 'react';

export default function PWARegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registrado con éxito:', registration.scope);
        } catch (error) {
          console.error('Error al registrar el Service Worker:', error);
        }
      };

      registerServiceWorker();
    }
  }, []);

  return null;
}
