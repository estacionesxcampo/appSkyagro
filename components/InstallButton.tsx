'use client';

import { useState, useEffect } from 'react';
import { Download, Monitor, Smartphone } from 'lucide-react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar si es iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevenir que el navegador muestre su propio prompt automáticamente
      e.preventDefault();
      // Guardar el evento para dispararlo después
      setDeferredPrompt(e);
      // Mostrar nuestro botón
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Si ya está instalada, no mostramos nada
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsVisible(false);
    });

    // En iOS siempre mostramos el botón si no está en modo standalone
    if (isIOSDevice && !(window.navigator as any).standalone) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert('Para instalar en iOS: presiona el botón "Compartir" y selecciona "Agregar a la pantalla de inicio".');
      return;
    }

    if (!deferredPrompt) return;

    // Mostrar el prompt
    deferredPrompt.prompt();

    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuario respondió al prompt de instalación: ${outcome}`);

    // Limpiar el prompt guardado
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="mt-4 flex justify-center">
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center px-4 py-2 border border-green-600 rounded-lg text-sm font-medium text-green-600 bg-white hover:bg-green-50 transition-colors shadow-sm gap-2"
      >
        <Download className="h-4 w-4" />
        Instalar App
      </button>
    </div>
  );
}
