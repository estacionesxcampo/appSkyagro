'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

// Mapeo de códigos de iconos de Azure Maps a Material Symbols
const weatherIconMap: Record<number, { icon: string, fill: boolean, color: string }> = {
  1: { icon: 'wb_sunny', fill: true, color: 'text-orange-400' }, // Sunny
  2: { icon: 'wb_sunny', fill: true, color: 'text-orange-300' }, // Mostly Sunny
  3: { icon: 'partly_cloudy_day', fill: true, color: 'text-orange-200' }, // Partly Sunny
  4: { icon: 'partly_cloudy_day', fill: false, color: 'text-gray-400' }, // Intermittent Clouds
  5: { icon: 'filter_drama', fill: false, color: 'text-gray-300' }, // Hazy Sunshine
  6: { icon: 'cloud', fill: true, color: 'text-gray-400' }, // Mostly Cloudy
  7: { icon: 'cloud', fill: true, color: 'text-gray-500' }, // Cloudy
  8: { icon: 'cloud', fill: true, color: 'text-gray-600' }, // Dreary (Overcast)
  11: { icon: 'foggy', fill: true, color: 'text-gray-400' }, // Fog
  12: { icon: 'rainy', fill: true, color: 'text-blue-400' }, // Showers
  13: { icon: 'rainy', fill: true, color: 'text-blue-500' }, // Mostly Cloudy with Showers
  14: { icon: 'rainy', fill: true, color: 'text-blue-300' }, // Partly Sunny with Showers
  15: { icon: 'thunderstorm', fill: true, color: 'text-yellow-500' }, // Thunderstorms
  16: { icon: 'thunderstorm', fill: true, color: 'text-yellow-600' }, // Mostly Cloudy with Thunderstorms
  17: { icon: 'thunderstorm', fill: true, color: 'text-yellow-400' }, // Partly Sunny with Thunderstorms
  18: { icon: 'rainy', fill: true, color: 'text-blue-600' }, // Rain
  19: { icon: 'ac_unit', fill: false, color: 'text-blue-200' }, // Flurries
  20: { icon: 'ac_unit', fill: false, color: 'text-blue-300' }, // Mostly Cloudy with Flurries
  21: { icon: 'ac_unit', fill: false, color: 'text-blue-100' }, // Partly Sunny with Flurries
  22: { icon: 'snowing', fill: true, color: 'text-blue-200' }, // Snow
  23: { icon: 'snowing', fill: true, color: 'text-blue-300' }, // Mostly Cloudy with Snow
  24: { icon: 'ac_unit', fill: true, color: 'text-cyan-200' }, // Ice
  25: { icon: 'ac_unit', fill: true, color: 'text-cyan-300' }, // Sleet
  26: { icon: 'ac_unit', fill: true, color: 'text-blue-400' }, // Freezing Rain
  29: { icon: 'ac_unit', fill: true, color: 'text-blue-200' }, // Rain and Snow
  30: { icon: 'thermostat', fill: true, color: 'text-red-500' }, // Hot
  31: { icon: 'ac_unit', fill: true, color: 'text-blue-500' }, // Cold
  32: { icon: 'air', fill: true, color: 'text-gray-400' }, // Windy
  33: { icon: 'bedtime', fill: true, color: 'text-indigo-300' }, // Clear (Night)
  34: { icon: 'bedtime', fill: true, color: 'text-indigo-200' }, // Mostly Clear (Night)
  35: { icon: 'partly_cloudy_night', fill: true, color: 'text-indigo-400' }, // Partly Cloudy (Night)
  36: { icon: 'partly_cloudy_night', fill: true, color: 'text-indigo-500' }, // Intermittent Clouds (Night)
  37: { icon: 'filter_drama', fill: false, color: 'text-indigo-200' }, // Hazy (Night)
  38: { icon: 'cloud', fill: true, color: 'text-indigo-600' }, // Mostly Cloudy (Night)
  39: { icon: 'rainy', fill: true, color: 'text-blue-400' }, // Showers (Night)
  40: { icon: 'rainy', fill: true, color: 'text-blue-500' }, // Mostly Cloudy with Showers (Night)
  41: { icon: 'thunderstorm', fill: true, color: 'text-yellow-500' }, // Thunderstorms (Night)
  42: { icon: 'thunderstorm', fill: true, color: 'text-yellow-600' }, // Mostly Cloudy with Thunderstorms (Night)
  43: { icon: 'snowing', fill: true, color: 'text-blue-200' }, // Flurries (Night)
  44: { icon: 'snowing', fill: true, color: 'text-blue-300' }, // Mostly Cloudy with Flurries (Night)
};

const getIcon = (code: number) => weatherIconMap[code] || { icon: 'wb_sunny', fill: false, color: 'text-gray-400' };

// Funciones para el cálculo de Delta T (Pulverización Agrícola)
const calculateDeltaT = (t: number, rh: number) => {
  // Fórmula de Stull para Temperatura de Bulbo Húmedo (Tw)
  const tw = t * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) 
             + Math.atan(t + rh) 
             - Math.atan(rh - 1.676331) 
             + 0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) 
             - 4.686035;
  return t - tw;
};

const getDeltaTStatus = (deltaT: number) => {
  if (deltaT < 2) return { 
    label: 'Bajo', 
    color: 'text-blue-600', 
    bg: 'bg-blue-50', 
    msg: 'Aire muy húmedo/frío. Alto riesgo de deriva excesiva y lavado.' 
  };
  if (deltaT <= 8) return { 
    label: 'Ideal', 
    color: 'text-green-600', 
    bg: 'bg-green-50', 
    msg: 'Condiciones seguras para pulverizar.' 
  };
  if (deltaT <= 10) return { 
    label: 'Precaución', 
    color: 'text-orange-500', 
    bg: 'bg-orange-50', 
    msg: 'Condiciones marginales, riesgo moderado de evaporación.' 
  };
  return { 
    label: 'Alto', 
    color: 'text-red-600', 
    bg: 'bg-red-50', 
    msg: 'Aire muy seco/caliente. Gotas se evaporan rápidamente (baja eficacia).' 
  };
};

// Función para el cálculo de Riesgo de Helada
const getFrostRisk = (t: number, rh: number, wind: number, dewPoint?: number) => {
  // Si no viene el punto de rocío, lo calculamos (Magnus-Tetens)
  const td = dewPoint !== undefined ? dewPoint : (() => {
    const a = 17.625;
    const b = 243.04;
    const alpha = ((a * t) / (b + t)) + Math.log(rh / 100);
    return (b * alpha) / (a - alpha);
  })();

  if (t > 7) return { label: 'Sin Riesgo', color: 'text-green-600', bg: 'bg-green-50', msg: 'Condiciones seguras para el cultivo.' };
  
  let score = 0;
  if (t <= 0) score = 4;
  else if (t <= 2) score = 3;
  else if (t <= 4) score = 2;
  else score = 1;

  // Agravantes
  if (wind < 10) score += 1; // Viento calmo = más riesgo de helada por radiación
  if (td <= 0) score += 1;   // Punto de rocío bajo = riesgo de helada negra

  if (score >= 5) return { label: 'Crítico', color: 'text-red-700', bg: 'bg-red-50', msg: 'Riesgo inminente de helada severa.' };
  if (score >= 4) return { label: 'Alto', color: 'text-red-600', bg: 'bg-red-50', msg: 'Alta probabilidad de formación de hielo.' };
  if (score >= 3) return { label: 'Moderado', color: 'text-orange-600', bg: 'bg-orange-50', msg: 'Riesgo de helada blanca (escarcha).' };
  return { label: 'Bajo', color: 'text-yellow-700', bg: 'bg-yellow-50', msg: 'Temperaturas bajas, monitorear de cerca.' };
};

export default function Pronostico() {
  const params = useParams();
  const idStr = (params?.id as string) || '';
  const subscriptionKey = process.env.NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY;
  
  const [pointData, setPointData] = useState<any>(null);
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([]);
  const [dailyForecast, setDailyForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(true);

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

  // Fetch forecast data once coordinates are available
  useEffect(() => {
    if (!pointData?.latitud || !pointData?.longitud || !subscriptionKey) return;

    const fetchForecasts = async () => {
      setLoadingForecast(true);
      try {
        const lat = pointData.latitud;
        const lon = pointData.longitud;

        // 12 Hours Forecast - Usando la URL exacta del usuario
        const hourlyUrl = `https://atlas.microsoft.com/weather/forecast/hourly/json?api-version=1.0&query=${lat},${lon}&duration=12&subscription-key=${subscriptionKey}&languaje=es-419&unit=metric`;
        const hourlyRes = await fetch(hourlyUrl);
        const hourlyData = await hourlyRes.json();

        // 10 Days Forecast
        const dailyUrl = `https://atlas.microsoft.com/weather/forecast/daily/json?api-version=1.0&query=${lat},${lon}&duration=10&subscription-key=${subscriptionKey}&languaje=es-419&unit=metric`;
        const dailyRes = await fetch(dailyUrl);
        const dailyData = await dailyRes.json();

        // El usuario indica que los datos están en el campo 'forecast'
        const hourlyArr = hourlyData.forecast || hourlyData.forecasts || [];
        const dailyArr = dailyData.forecast || dailyData.forecasts || [];

        setHourlyForecast(hourlyArr);
        setDailyForecast(dailyArr);

      } catch (error) {
        console.error('Error fetching forecasts:', error);
      } finally {
        setLoadingForecast(false);
      }
    };

    fetchForecasts();
  }, [pointData, subscriptionKey]);

  const displayTitle = pointData?.nombre || decodeURIComponent(idStr).split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const lastUpdate = pointData?.fecha || 'Cargando...';

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <main className="relative w-full min-h-[calc(100dvh-88px)] pt-20 pb-16 flex flex-col items-center justify-start pointer-events-auto overflow-y-auto bg-stone-100">
      {/* Loading Modal */}
      {(loading || loadingForecast) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1c19]/90 backdrop-blur-xl pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 p-10 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 border border-white/20"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#647B4E]/10 border-t-[#647B4E] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#647B4E] animate-pulse">cloud_sync</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-[#1a1c19] font-black text-2xl font-headline tracking-tight">Sincronizando Pronóstico</h3>
              <p className="text-[#1a1c19]/60 text-sm font-medium max-w-[200px]">Obteniendo datos climáticos de alta precisión para su zona...</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Content Container */}
      <div className="w-full h-full z-40 relative transition-all duration-500 max-w-7xl mx-auto">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-2">Monitor Agroclimático</p>
              <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter text-on-surface leading-none">{displayTitle}</h1>
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[11px] text-on-surface-variant font-bold uppercase tracking-widest">En tiempo real • Actualizado: {lastUpdate}</p>
              </div>
            </div>
            {pointData?.ciudad && (
              <div className="bg-white/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/50 shadow-sm self-start md:self-end">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Ubicación</p>
                <p className="text-sm font-black text-on-surface">{pointData.ciudad}</p>
              </div>
            )}
          </div>

          {/* Hourly Forecast (12 Hours) */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">schedule</span>
                Próximas Horas
              </h2>
            </div>
            
            <div className="relative">
              <div className="flex overflow-x-auto pb-6 gap-4 no-scrollbar -mx-6 px-6">
                {hourlyForecast.map((hour, i) => {
                  const iconData = getIcon(hour.iconCode);
                  return (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex-shrink-0 w-[140px] p-5 rounded-[2.5rem] border transition-all duration-300 group ${i === 0 ? 'bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-primary/20 scale-105 z-10' : 'bg-white/40 border-transparent hover:bg-white/60 hover:shadow-lg'}`}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <span className={`text-[12px] font-black uppercase tracking-widest ${i === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {i === 0 ? 'Ahora' : formatTime(hour.date)}
                        </span>
                        
                        <div className="relative py-2">
                          <span className={`material-symbols-outlined text-4xl ${iconData.color} transition-transform group-hover:scale-110 duration-500`} style={iconData.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>
                            {iconData.icon}
                          </span>
                          {(hour.rainProbability > 0) && (
                            <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md">
                              {hour.rainProbability}%
                            </div>
                          )}
                        </div>

                        <div className="text-center">
                          <p className="text-3xl font-black text-on-surface leading-none">{Math.round(hour.temperature?.value || 0)}°</p>
                          <p className="text-[11px] font-bold text-on-surface-variant mt-1">HR: {hour.relativeHumidity}%</p>
                        </div>

                        <div className="w-full pt-4 mt-2 border-t border-stone-200/50 space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase text-on-surface-variant">
                            <span>Viento</span>
                            <span className="text-on-surface text-[12px] font-black">{Math.round(hour.windGust?.speed?.value || hour.wind?.speed?.value || hour.wind?.value || 0)} <span className="text-[10px] font-black text-on-surface-variant uppercase">km/h</span></span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-black uppercase text-on-surface-variant">
                            <span>Lluvia</span>
                            <span className="text-on-surface text-[12px] font-black">{hour.rain?.value || (typeof hour.rain === 'number' ? hour.rain : 0)} <span className="text-[10px] font-black text-on-surface-variant uppercase">mm</span></span>
                          </div>
                        </div>

                        {/* Indicadores de Riesgo */}
                        <div className="w-full flex flex-col gap-6 mt-4">
                          {/* Delta T - Pulverización */}
                          {(() => {
                            const deltaT = calculateDeltaT(hour.temperature?.value || 0, hour.relativeHumidity || 0);
                            const status = getDeltaTStatus(deltaT);
                            return (
                              <div className={`w-full p-2.5 rounded-xl ${status.bg} border ${status.color.replace('text-', 'border-')}/40 shadow-sm`}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-black uppercase tracking-tighter text-on-surface-variant">Delta T</span>
                                  <span className={`text-[14px] font-black ${status.color}`}>{deltaT.toFixed(1)}</span>
                                </div>
                                <div className={`text-[10px] font-bold leading-tight ${status.color}`}>
                                  <span className="uppercase block mb-1 border-b border-current border-opacity-20 pb-0.5">{status.label}</span> 
                                  <p className="opacity-90 font-medium leading-[1.1]">{status.msg}</p>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Riesgo de Helada - Diseño diferenciado con borde lateral */}
                          {(() => {
                            const risk = getFrostRisk(
                              hour.temperature?.value || 0, 
                              hour.relativeHumidity || 0, 
                              hour.wind?.speed?.value || hour.wind?.value || 0,
                              hour.dewPoint?.value
                            );
                            return (
                              <div className={`w-full p-2.5 rounded-2xl ${risk.bg} border-l-[6px] ${risk.color.replace('text-', 'border-')} shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${risk.color.replace('text-', 'bg-')}/10`}>
                                    <span className={`material-symbols-outlined text-[14px] ${risk.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>ac_unit</span>
                                  </div>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/70">Riesgo Helada</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className={`text-[12px] font-black uppercase leading-none ${risk.color}`}>{risk.label}</span> 
                                  <p className="text-[9px] font-bold leading-[1.1] text-on-surface-variant/80 mt-0.5">
                                    {risk.msg}
                                  </p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Daily Forecast (10 Days) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <section className="lg:col-span-2">
              <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-8 border border-white/50 shadow-sm overflow-hidden relative">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">calendar_month</span>
                    Tendencia 10 Días
                  </h2>
                </div>

                <div className="flex flex-col gap-1">
                  {dailyForecast.map((day, i) => {
                    const dayIcon = getIcon(day.day.iconCode);
                    const nightIcon = getIcon(day.night.iconCode);
                    
                    return (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`group p-5 rounded-[2.2rem] transition-all duration-300 hover:bg-white/80 ${i === 0 ? 'bg-white shadow-md ring-1 ring-black/5' : 'bg-white/40 border border-white/40 mb-3'}`}
                      >
                        {/* VISTA MÓVIL: Diseño apilado por líneas solicitado */}
                        <div className="flex flex-col sm:hidden gap-4">
                          {/* Línea 1: Día */}
                          <div className="flex justify-between items-center">
                            <p className="text-base font-black text-on-surface capitalize">
                              {i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : formatDate(day.date).split(',')[0]}
                              <span className="ml-2 text-[12px] font-bold text-on-surface-variant uppercase tracking-tighter">
                                • {new Date(day.date).getDate()} {new Date(day.date).toLocaleDateString('es-PY', { month: 'short' })}
                              </span>
                            </p>
                            <span className="bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">
                              Pronóstico
                            </span>
                          </div>

                          {/* Línea 2: Descripción */}
                          <div className="bg-stone-50/80 border border-stone-200/50 px-4 py-3 rounded-2xl">
                            <p className="text-[13px] font-extrabold text-on-surface leading-snug">
                              {day.day.shortPhrase}
                            </p>
                          </div>

                          {/* Línea 3: Icono + Lluvia */}
                          <div className="flex items-center gap-3 pl-0 pr-1">
                            <div className="flex -space-x-2 flex-shrink-0">
                              <span className={`material-symbols-outlined text-4xl ${dayIcon.color} relative z-10`} style={dayIcon.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                {dayIcon.icon}
                              </span>
                              <span className={`material-symbols-outlined text-2xl ${nightIcon.color} opacity-40`} style={nightIcon.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                {nightIcon.icon}
                              </span>
                            </div>
                            <div className="flex flex-1 items-center bg-blue-50/60 py-2.5 rounded-2xl border border-blue-100/50">
                              <div className="flex-1 flex flex-col items-center">
                                <span className="text-[8px] font-black text-blue-800/60 uppercase tracking-tighter">Probabilidad</span>
                                <span className="text-[14px] font-black text-blue-700 leading-none mt-1">{day.day.rainProbability}%</span>
                              </div>
                              <div className="w-[1px] h-6 bg-blue-200/50"></div>
                              <div className="flex-1 flex flex-col items-center">
                                <span className="text-[8px] font-black text-blue-800/60 uppercase tracking-tighter">Cantidad</span>
                                <span className="text-[14px] font-black text-blue-700 leading-none mt-1">{day.day.rain?.value || 0} <span className="text-[10px]">mm</span></span>
                              </div>
                            </div>
                          </div>

                          {/* Línea 4: Temps */}
                          <div className="flex justify-between items-center pt-3 mt-1 border-t border-stone-200/60">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shadow-inner">
                                <span className="material-symbols-outlined text-orange-600 text-xl">arrow_upward</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-lg font-black text-on-surface leading-none">{Math.round(day.temperature?.maximum?.value || 0)}°</span>
                                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-tighter">Máxima</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-end text-right">
                                <span className="text-lg font-black text-on-surface leading-none opacity-70">{Math.round(day.temperature?.minimum?.value || 0)}°</span>
                                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-tighter">Mínima</span>
                              </div>
                              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shadow-inner">
                                <span className="material-symbols-outlined text-blue-600 text-xl">arrow_downward</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* VISTA ESCRITORIO: Se mantiene horizontal para pantallas grandes */}
                        <div className="hidden sm:grid grid-cols-12 items-center gap-4">
                          {/* Fecha */}
                          <div className="col-span-2">
                            <p className="text-sm font-black text-on-surface capitalize truncate">
                              {i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : formatDate(day.date).split(',')[0]}
                            </p>
                            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-tighter">
                              {new Date(day.date).getDate()} {new Date(day.date).toLocaleDateString('es-PY', { month: 'short' })}
                            </p>
                          </div>

                          {/* Icono y Frase Día */}
                          <div className="col-span-6 flex items-center gap-3">
                            <div className="flex -space-x-2 flex-shrink-0">
                              <span className={`material-symbols-outlined text-3xl ${dayIcon.color} relative z-10`} style={dayIcon.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                {dayIcon.icon}
                              </span>
                              <span className={`material-symbols-outlined text-xl ${nightIcon.color} opacity-40`} style={nightIcon.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                {nightIcon.icon}
                              </span>
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[12px] font-black text-on-surface truncate leading-tight">{day.day.shortPhrase}</p>
                              <div className="flex items-center gap-2 text-[10px] font-black text-blue-700 uppercase tracking-tighter">
                                <span>{day.day.rainProbability}% PROB.</span>
                                <span>{day.day.rain?.value || 0} MM</span>
                              </div>
                            </div>
                          </div>

                          {/* Temperaturas */}
                          <div className="col-span-4 flex items-center justify-end gap-4">
                            <div className="flex flex-col items-center w-14">
                              <span className="text-lg font-black text-on-surface leading-none">{Math.round(day.temperature?.maximum?.value || 0)}°</span>
                              <span className="text-[10px] font-black text-on-surface-variant uppercase mt-1">Máx</span>
                            </div>
                            
                            <div className="flex-1 max-w-[60px] h-1 bg-stone-200/50 rounded-full relative overflow-hidden hidden md:block">
                              <div className="absolute inset-y-0 left-[20%] right-[20%] bg-gradient-to-r from-blue-400 to-orange-400 rounded-full opacity-60"></div>
                            </div>

                            <div className="flex flex-col items-center w-14">
                              <span className="text-lg font-black text-on-surface leading-none opacity-60">{Math.round(day.temperature?.minimum?.value || 0)}°</span>
                              <span className="text-[10px] font-black text-on-surface-variant uppercase mt-1">Mín</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Sidebar / Alertas y Resumen */}
            <aside className="space-y-6">
              {/* Resumen del Día Actual */}
              <div className="bg-gradient-to-br from-primary to-[#4A5D3A] rounded-[3rem] p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-80 mb-6">Condición Hoy</h3>
                  {dailyForecast[0] && (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <span className={`material-symbols-outlined text-5xl text-white`} style={getIcon(dailyForecast[0].day.iconCode).fill ? { fontVariationSettings: "'FILL' 1" } : {}}>
                          {getIcon(dailyForecast[0].day.iconCode).icon}
                        </span>
                        <div>
                          <p className="text-4xl font-black">{Math.round(dailyForecast[0].temperature?.maximum?.value || 0)}°</p>
                          <p className="text-xs font-bold opacity-80 uppercase tracking-tighter">Máxima esperada</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium leading-relaxed mb-6 italic opacity-90">
                        "{dailyForecast[0].day.shortPhrase}. Con vientos de hasta {Math.round(dailyForecast[0].day.wind?.speed?.value || 0)} km/h."
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                          <p className="text-[10px] font-black uppercase opacity-70 mb-1">Lluvia Día</p>
                          <p className="text-base font-black">{dailyForecast[0].day.rain?.value || 0} mm</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                          <p className="text-[10px] font-black uppercase opacity-70 mb-1">Lluvia Noche</p>
                          <p className="text-base font-black">{dailyForecast[0].night.rain?.value || 0} mm</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </aside>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
