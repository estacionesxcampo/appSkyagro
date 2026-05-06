'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams } from 'next/navigation';

export default function LoteDetail() {
  const params = useParams();
  const idStr = (params?.id as string) || '';
  
  const [pointData, setPointData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch detail for the specific station
  useEffect(() => {
    const fetchPointDetail = async () => {
      try {
        const decodedName = decodeURIComponent(idStr);
        const res = await fetch(`/api/map/station?nombre=${encodeURIComponent(decodedName)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            setPointData(data);
          }
        }
      } catch (error) {
        console.error('Error fetching point detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPointDetail();
  }, [idStr]);

  // Fallback title logic if data is not yet loaded
  const displayTitle = pointData?.nombre || decodeURIComponent(idStr).split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Mapping real data to the UI format
  const data = {
    temp: pointData ? `${pointData.temperatura || '--'}°C` : '...',
    tempMax: pointData?.max_temperatura || '--',
    tempMin: pointData?.min_temperatura || '--',
    humidity: pointData ? `${pointData.humedad || '--'}%` : '...',
    humidityMax: pointData?.max_humedad || '--',
    humidityMin: pointData?.min_humedad || '--',
    wind: pointData ? `${pointData.viento || '--'} km/h` : '...',
    windMax: pointData?.max_viento || '--',
    rain24h: pointData ? `${pointData.lluvia_24 || '0.0'} mm` : '...',
    rainMonth: pointData ? `${pointData.lluvia_mes || '0.0'} mm` : '...',
    rainYear: pointData ? `${pointData.lluvia_ano || '0.0'} mm` : '...',
    status: pointData?.condiciones_pulverizacion || 'ÓPTIMA',
    fireRisk: pointData?.riesgo_incendio || 'Bajo'
  };

  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.4, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.4, 1));

  return (
    <main ref={containerRef} className="relative w-full min-h-[calc(100dvh-88px)] pt-20 pb-16 flex flex-col items-center justify-start pointer-events-auto overflow-y-auto bg-stone-100">
      {/* Loading Modal */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1c19]/90 backdrop-blur-xl pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 p-10 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 border border-white/20"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#647B4E]/10 border-t-[#647B4E] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#647B4E] animate-pulse">monitoring</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-[#1a1c19] font-black text-2xl font-headline tracking-tight">Generando Datos</h3>
              <p className="text-[#1a1c19]/60 text-sm font-medium max-w-[200px]">Por favor aguarde unos segundos mientras procesamos la información...</p>
            </div>
          </motion.div>
        </div>
      )}



      {/* Content Container */}
      <div className="w-full h-full z-40 relative transition-all duration-500">
        <div className="p-6">
          <div className="mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1 block">Monitoreo Agro Climatico</span>
            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight leading-none font-headline">{displayTitle}</h2>
            {pointData?.ciudad && (
              <p className="text-sm font-bold text-primary mt-1 uppercase tracking-wider">{pointData.ciudad}</p>
            )}
            <p className="text-[10px] font-medium text-on-surface-variant mt-1 uppercase tracking-tight">Última actualización: {pointData?.fecha || '24/05/2024'}</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3 mb-6">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-white/50 p-3 sm:p-4 rounded-3xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-lg sm:text-xl">thermostat</span>
                  <p className="text-[9px] sm:text-[11px] font-bold text-outline uppercase tracking-wider truncate">Temperatura</p>
                </div>
                <p className="text-xl sm:text-2xl font-black text-on-surface font-headline">{data.temp}</p>
                <p className="text-[8px] sm:text-[9px] font-medium text-on-surface-variant leading-tight mt-1">Máx: {data.tempMax}°C / Mín: {data.tempMin}°C<br/>(últimas 24 hs)</p>
              </div>
              <div className="bg-white/50 p-3 sm:p-4 rounded-3xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-lg sm:text-xl">humidity_mid</span>
                  <p className="text-[9px] sm:text-[11px] font-bold text-outline uppercase tracking-wider truncate">Humedad</p>
                </div>
                <p className="text-xl sm:text-2xl font-black text-on-surface font-headline">{data.humidity}</p>
                <p className="text-[8px] sm:text-[9px] font-medium text-on-surface-variant leading-tight mt-1">Máx: {data.humidityMax}% / Mín: {data.humidityMin}%<br/>(últimas 24 hs)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white/50 p-3 sm:p-4 rounded-3xl border border-white/50 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-stone-100">
                    <span className="material-symbols-outlined text-lg sm:text-xl">air</span>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[11px] font-bold text-outline uppercase tracking-wider">Viento</p>
                    <p className="text-lg sm:text-xl font-black text-on-surface font-headline">{data.wind}</p>
                  </div>
                </div>
                <p className="text-[8px] sm:text-[10px] font-bold text-on-surface-variant bg-stone-200/50 px-2 py-1 rounded-lg">Ráfaga máx: {data.windMax} km/h</p>
              </div>
              
              <div className="bg-white/50 p-3 sm:p-4 rounded-3xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <span className="material-symbols-outlined text-primary text-lg sm:text-xl">rainy</span>
                  <p className="text-[9px] sm:text-[11px] font-bold text-outline uppercase tracking-wider">Precipitación</p>
                </div>
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  <div className="text-center">
                    <p className="text-[8px] font-semibold text-outline mb-0.5">Últimas 24h</p>
                    <p className="text-xs sm:text-sm font-black text-on-surface font-headline">{data.rain24h}</p>
                  </div>
                  <div className="text-center border-x border-stone-300/30">
                    <p className="text-[8px] font-semibold text-outline mb-0.5">Mes actual</p>
                    <p className="text-xs sm:text-sm font-black text-on-surface font-headline">{data.rainMonth}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-semibold text-outline mb-0.5">Año actual</p>
                    <p className="text-xs sm:text-sm font-black text-on-surface font-headline">{data.rainYear}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`relative overflow-hidden p-5 rounded-3xl text-white shadow-lg transition-colors duration-500 ${
            data.status === 'Condiciones Ideales' ? 'bg-gradient-to-br from-[#506231] to-[#6b7e4a]' :
            data.status === 'Condiciones no Ideales' ? 'bg-gradient-to-br from-[#8d6e63] to-[#a1887f]' :
            'bg-gradient-to-br from-[#c62828] to-[#ef5350]'
          }`}>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Condiciones para Pulverización:</p>
                <h3 className="text-xl font-extrabold tracking-tight font-headline mt-1 uppercase">PULVERIZACIÓN:<br/>{data.status}</h3>
              </div>
              <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
                <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>
                  {data.status === 'Condiciones Ideales' ? 'check_circle' : 
                   data.status === 'Condiciones no Ideales' ? 'warning' : 'error'}
                </span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          </div>

          <div className={`relative overflow-hidden p-5 rounded-3xl text-white shadow-lg transition-colors duration-500 mt-4 ${
            data.fireRisk === 'Bajo' ? 'bg-gradient-to-br from-[#506231] to-[#6b7e4a]' :
            data.fireRisk === 'Medio' ? 'bg-gradient-to-br from-[#8d6e63] to-[#a1887f]' :
            data.fireRisk === 'Alto' ? 'bg-gradient-to-br from-[#f57c00] to-[#ffa726]' :
            'bg-gradient-to-br from-[#c62828] to-[#ef5350]'
          }`}>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Alerta de Riesgo:</p>
                <h3 className="text-xl font-extrabold tracking-tight font-headline mt-1 uppercase">RIESGO DE INCENDIO:<br/>{data.fireRisk}</h3>
              </div>
              <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
                <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>
                  local_fire_department
                </span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          </div>
        </div>
      </div>
      
    </main>
  );
}
