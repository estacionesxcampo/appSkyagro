'use client';
import { useState, useRef, useEffect } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

type LayerType = 'temp' | 'humidity' | 'wind' | 'rain';

export default function Home() {
  const [activeLayer, setActiveLayer] = useState<LayerType>('temp');
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<any[]>([]);

  // Cargar puntos desde la API
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const res = await fetch('/api/map/points');
        if (res.ok) {
          const data = await res.json();
          setPoints(data);
        }
      } catch (error) {
        console.error('Error al cargar puntos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPoints();
  }, []);

  // Inicializar Google Maps
  useEffect(() => {
    if (loading || !mapRef.current) return;

    setOptions({
      key: 'AIzaSyC_TYJkAFXws36pSTZQkWO7xGDTjkbFu90',
      v: 'weekly',
    });

    importLibrary('maps').then(({ Map }) => {
      if (!mapRef.current) return;

      // Calcular centro inicial
      let center = { lat: -25.3, lng: -57.1 }; // Default Paraguay
      if (points.length > 0) {
        const avgLat = points.reduce((acc, p) => acc + parseFloat(p.latitud), 0) / points.length;
        const avgLng = points.reduce((acc, p) => acc + parseFloat(p.longitud), 0) / points.length;
        center = { lat: avgLat, lng: avgLng };
      }

      googleMap.current = new Map(mapRef.current, {
        center,
        zoom: 14,
        mapTypeId: 'hybrid',
        disableDefaultUI: true,
        zoomControl: false,
        backgroundColor: '#1a1c19',
        mapId: 'DEMO_MAP_ID'
      });

      // Si hay puntos, ajustar el mapa para que se vean todos
      if (points.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        points.forEach(p => bounds.extend({ lat: parseFloat(p.latitud), lng: parseFloat(p.longitud) }));
        googleMap.current.fitBounds(bounds);
      }

      renderMarkers(window.google);
    });
  }, [loading]);

  // Actualizar marcadores cuando cambian los puntos o la capa activa
  useEffect(() => {
    if (googleMap.current && typeof google !== 'undefined') {
      renderMarkers(google);
    }
  }, [points, activeLayer]);

  const renderMarkers = (googleObj: any) => {
    // Limpiar marcadores anteriores
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    if (!googleMap.current) return;

    points.forEach((point) => {
      const position = { lat: parseFloat(point.latitud), lng: parseFloat(point.longitud) };

      const content = document.createElement('div');
      content.className = 'custom-marker-container';

      const value = getMarkerValueText(point);

      content.innerHTML = `
        <div class="custom-marker-circle ${activeLayer}">
          ${value}
        </div>
        <div class="custom-marker-label">
          ${point.nombre}
        </div>
      `;

      // Clase personalizada para el overlay
      class CustomOverlay extends googleObj.maps.OverlayView {
        private element: HTMLElement;
        private pos: google.maps.LatLng;

        constructor(element: HTMLElement, pos: google.maps.LatLng) {
          super();
          this.element = element;
          this.pos = pos;
        }

        onAdd() {
          const pane = this.getPanes()?.overlayMouseTarget;
          pane?.appendChild(this.element);
        }

        draw() {
          const projection = this.getProjection();
          if (!projection) return;
          const pixel = projection.fromLatLngToDivPixel(this.pos);
          if (pixel) {
            this.element.style.left = pixel.x + 'px';
            this.element.style.top = pixel.y + 'px';
          }
        }

        onRemove() {
          if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
          }
        }
      }

      const overlay = new CustomOverlay(content, new googleObj.maps.LatLng(position.lat, position.lng));
      overlay.setMap(googleMap.current);
      markersRef.current.push(overlay);

      content.addEventListener('click', () => {
        window.location.href = `/lote/${point.id || point.nombre}`;
      });
    });
  };

  const getMarkerValueText = (point: any) => {
    const round = (val: any) => {
      if (val === undefined || val === null || val === '') return '--';
      const num = parseFloat(val);
      return isNaN(num) ? '--' : Math.round(num);
    };

    switch (activeLayer) {
      case 'temp': return `${round(point.temperatura)}°`;
      case 'humidity': return `<span style="font-size: 12px">${round(point.humedad)}%</span>`;
      case 'wind': return `<div style="line-height: 1.1"><span style="font-size: 12px">${round(point.viento)}</span><br/><span style="font-size: 8px; opacity: 0.8">km/h</span></div>`;
      case 'rain': return `<div style="line-height: 1.1"><span style="font-size: 12px">${round(point.lluvia_24)}</span><br/><span style="font-size: 8px; opacity: 0.8">mm</span></div>`;
    }
  };

  return (
    <main className="relative w-full h-[calc(100dvh-88px)] overflow-hidden bg-[#1a1c19]">
      {/* Cargando Modal */}
      {loading && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#1a1c19]/80 backdrop-blur-md">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 border-4 border-[#647B4E]/20 border-t-[#647B4E] rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className="text-[#1a1c19] font-bold text-lg">Cargando Mapa</h3>
              <p className="text-[#1a1c19]/60 text-sm">Sincronizando puntos de monitoreo...</p>
            </div>
          </div>
        </div>
      )}

      <div ref={mapRef} className="absolute inset-0 z-0" />

      <div className={`absolute inset-0 pointer-events-none z-10 mix-blend-overlay opacity-20 transition-colors duration-500 ${activeLayer === 'temp' ? 'bg-orange-500' :
          activeLayer === 'humidity' ? 'bg-cyan-500' :
            activeLayer === 'wind' ? 'bg-neutral-400' :
              activeLayer === 'rain' ? 'bg-blue-600' : 'bg-transparent'
        }`}></div>

      <div className="absolute inset-0 z-40 w-full h-full pointer-events-none">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-6 pointer-events-auto items-start">
          <div className="bg-[#E2E8DD]/90 backdrop-blur-md rounded-full shadow-2xl border border-white/20 p-2 flex flex-col gap-2">
            <button onClick={() => setActiveLayer('temp')} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${activeLayer === 'temp' ? 'bg-[#647B4E] text-white shadow-lg' : 'text-[#647B4E] hover:bg-[#647B4E]/10'}`}>
              <span className="material-symbols-outlined text-[24px]" style={activeLayer === 'temp' ? { fontVariationSettings: "'FILL' 1" } : {}}>thermostat</span>
            </button>
            <button onClick={() => setActiveLayer('humidity')} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${activeLayer === 'humidity' ? 'bg-[#647B4E] text-white shadow-lg' : 'text-[#647B4E] hover:bg-[#647B4E]/10'}`}>
              <span className="material-symbols-outlined text-[24px]" style={activeLayer === 'humidity' ? { fontVariationSettings: "'FILL' 1" } : {}}>water_drop</span>
            </button>
            <button onClick={() => setActiveLayer('wind')} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${activeLayer === 'wind' ? 'bg-[#647B4E] text-white shadow-lg' : 'text-[#647B4E] hover:bg-[#647B4E]/10'}`}>
              <span className="material-symbols-outlined text-[24px]" style={activeLayer === 'wind' ? { fontVariationSettings: "'FILL' 1" } : {}}>air</span>
            </button>
            <button onClick={() => setActiveLayer('rain')} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${activeLayer === 'rain' ? 'bg-[#647B4E] text-white shadow-lg' : 'text-[#647B4E] hover:bg-[#647B4E]/10'}`}>
              <span className="material-symbols-outlined text-[24px]" style={activeLayer === 'rain' ? { fontVariationSettings: "'FILL' 1" } : {}}>cloudy_snowing</span>
            </button>
          </div>

          {/* Etiqueta dinámica de capa */}
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/40 animate-in fade-in slide-in-from-left-4 duration-500">
            <span className="text-[#647B4E] font-bold text-[10px] whitespace-nowrap uppercase tracking-widest">
              {activeLayer === 'temp' && 'Temperatura Actual'}
              {activeLayer === 'humidity' && 'Humedad Actual'}
              {activeLayer === 'wind' && 'Viento Actual'}
              {activeLayer === 'rain' && 'Lluvia en las Ultimas 24 hs.'}
            </span>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-marker-container {
          position: absolute;
          transform: translate(-50%, -50%);
          cursor: pointer;
          pointer-events: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 100;
          transition: transform 0.2s ease-out;
        }
        .custom-marker-container:hover {
          transform: translate(-50%, -50%) scale(1.15);
          z-index: 1000;
        }
        .custom-marker-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #007AFF, #0056b3);
          backdrop-filter: blur(8px);
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .custom-marker-circle.temp { background: linear-gradient(135deg, #f97316, #ea580c); box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4); }
        .custom-marker-circle.humidity { background: linear-gradient(135deg, #06b6d4, #0891b2); box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4); }
        .custom-marker-circle.wind { background: linear-gradient(135deg, #737373, #525252); box-shadow: 0 4px 15px rgba(115, 115, 115, 0.4); }
        .custom-marker-circle.rain { background: linear-gradient(135deg, #2563eb, #1d4ed8); box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4); }

        .custom-marker-container:hover .custom-marker-circle {
          transform: scale(1.15);
          z-index: 1000;
        }
        .custom-marker-label {
          margin-top: 6px;
          background: #1a1c19;
          color: white;
          font-size: 10px;
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          opacity: 0;
          transform: translateY(5px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .custom-marker-container:hover .custom-marker-label {
          opacity: 1;
          transform: translateY(0);
        }

        /* Soporte para vista en celulares (siempre visible) */
        @media (max-width: 768px) {
          .custom-marker-label {
            opacity: 1;
            transform: translateY(0);
            font-size: 8px;
            padding: 2px 6px;
          }
          .custom-marker-circle {
            width: 38px;
            height: 38px;
            font-size: 11px;
          }
        }
      `}</style>
    </main>
  );
}
