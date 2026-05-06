'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as htmlToImage from 'html-to-image';

export default function Informes() {
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

  const displayTitle = pointData?.nombre || decodeURIComponent(idStr).split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const lastUpdate = pointData?.fecha || 'Cargando...';

  const [reportType, setReportType] = useState<'resumen' | 'detallado'>('resumen');
  
  // Dates
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [fechaDesde, setFechaDesde] = useState(firstDayOfMonthStr);
  const [fechaHasta, setFechaHasta] = useState(todayStr);

  const [isFetchingGraph, setIsFetchingGraph] = useState(false);
  const [isGraphGenerated, setIsGraphGenerated] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [solarChartData, setSolarChartData] = useState<any>(null);
  const [evapoChartData, setEvapoChartData] = useState<any>(null);
  const [soilTempChartData, setSoilTempChartData] = useState<any>(null);
  const [soilMoistureChartData, setSoilMoistureChartData] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleGenerarInforme = async () => {
    if (!pointData?.codigo) return;
    setIsFetchingGraph(true);
    setIsGraphGenerated(false);
    
    try {
      const condicion = reportType === 'resumen' ? 'daily' : 'hourly';
      const url = `http://3.209.148.75/skyagro/procesos_appsmith/generador_reportes_json_condiciones.php?estacion=${pointData.codigo}&fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}&condicion=${condicion}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const labels = data.map((item: any) => {
            let d = item.dia || item.fecha || '';
            if (d.includes('-')) {
              const parts = d.split('-');
              if (parts[0].length === 4) { // yyyy-mm-dd
                d = `${parts[2]}/${parts[1]}/${parts[0]}`;
              }
            }
            if (condicion === 'hourly' && item.hora) {
               return `${d} ${item.hora.toString().padStart(2, '0')}:00`;
            }
            return d;
          });

          const temp = data.map((item: any) => parseFloat(item.temperatura || '0'));
          const maxTemp = data.map((item: any) => parseFloat(item.max_temperatura || '0'));
          const minTemp = data.map((item: any) => parseFloat(item.min_temperatura || '0'));
          const dewPoint = data.map((item: any) => parseFloat(item.punto_rocio || '0'));
          
          const hum = data.map((item: any) => parseFloat(item.humedad || '0'));
          const maxHum = data.map((item: any) => parseFloat(item.maxima_humedad || item.max_humedad || '0'));
          const minHum = data.map((item: any) => parseFloat(item.minima_humedad || item.min_humedad || '0'));
          
          const windSpeed = data.map((item: any) => parseFloat(item.viento || '0'));
          const gusts = data.map((item: any) => parseFloat(item.rafaga || '0'));
          
          const rain = data.map((item: any) => parseFloat(item.lluvia || '0'));

          setChartData({
            labels,
            temp, maxTemp, minTemp, dewPoint,
            hum, maxHum, minHum,
            windSpeed, gusts,
            rain
          });
          
          // Fetch Solar Radiation from Open-Meteo
          try {
            const lat = pointData.latitud;
            const lon = pointData.longitud;
            // Fetch hourly data to always have W/m2 base
            const solarUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${fechaDesde}&end_date=${fechaHasta}&hourly=shortwave_radiation&timezone=America/Sao_Paulo`;
            
            const solarRes = await fetch(solarUrl);
            if (solarRes.ok) {
              const sData = await solarRes.json();
              const times = sData.hourly.time;
              const values = sData.hourly.shortwave_radiation;
              
              if (reportType === 'resumen') {
                // Aggregate by day (average W/m2 for each day)
                const dailyMap = new Map<string, number[]>();
                times.forEach((t: string, i: number) => {
                  const day = t.split('T')[0];
                  if (!dailyMap.has(day)) dailyMap.set(day, []);
                  dailyMap.get(day)!.push(values[i]);
                });
                
                const labels: string[] = [];
                const aggregatedValues: number[] = [];
                dailyMap.forEach((vals, day) => {
                  const parts = day.split('-');
                  labels.push(`${parts[2]}/${parts[1]}`);
                  // Standard daily average radiation intensity
                  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                  aggregatedValues.push(Number(avg.toFixed(2)));
                });
                
                setSolarChartData({ labels, data: aggregatedValues });
              } else {
                // Detailed (Hourly)
                const formattedLabels = times.map((t: string) => {
                  const date = new Date(t);
                  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:00`;
                });
                setSolarChartData({
                  labels: formattedLabels,
                  data: values
                });
              }
            }
          } catch (err) {
            console.error('Error fetching solar data:', err);
          }

          // Fetch Evapotranspiration and ET0
          try {
            const lat = pointData.latitud;
            const lon = pointData.longitud;
            let evapoUrl = "";
            if (reportType === 'resumen') {
              // Resumen: daily sum
              evapoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${fechaDesde}&end_date=${fechaHasta}&daily=et0_fao_evapotranspiration_sum&timezone=America/Sao_Paulo`;
            } else {
              // Detallado: hourly values
              evapoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${fechaDesde}&end_date=${fechaHasta}&hourly=et0_fao_evapotranspiration,evapotranspiration&timezone=America/Sao_Paulo`;
            }

            const evapoRes = await fetch(evapoUrl);
            if (evapoRes.ok) {
              const eData = await evapoRes.json();
              if (reportType === 'resumen' && eData.daily) {
                const labels = eData.daily.time.map((t: string) => {
                  const parts = t.split('-');
                  return `${parts[2]}/${parts[1]}`;
                });
                setEvapoChartData({
                  labels,
                  et0: eData.daily.et0_fao_evapotranspiration_sum,
                  evapo: [] 
                });
              } else if (reportType === 'detallado' && eData.hourly) {
                const labels = eData.hourly.time.map((t: string) => {
                  const date = new Date(t);
                  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:00`;
                });
                setEvapoChartData({
                  labels,
                  et0: eData.hourly.et0_fao_evapotranspiration,
                  evapo: eData.hourly.evapotranspiration
                });
              }
            }
          } catch (err) {
            console.error('Error fetching evapo data:', err);
          }

          // Fetch Soil Temperature
          try {
            const lat = pointData.latitud;
            const lon = pointData.longitud;
            let soilUrl = "";
            if (reportType === 'resumen') {
              const params = "soil_temperature_0_to_7cm_mean,soil_temperature_7_to_28cm_mean,soil_temperature_28_to_100cm_mean,soil_temperature_0_to_100cm_mean";
              soilUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${fechaDesde}&end_date=${fechaHasta}&daily=${params}&timezone=America/Sao_Paulo`;
            } else {
              const params = "soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm";
              soilUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${fechaDesde}&end_date=${fechaHasta}&hourly=${params}&timezone=America/Sao_Paulo`;
            }

            const soilRes = await fetch(soilUrl);
            if (soilRes.ok) {
              const sData = await soilRes.json();
              if (reportType === 'resumen' && sData.daily) {
                const labels = sData.daily.time.map((t: string) => {
                  const parts = t.split('-');
                  return `${parts[2]}/${parts[1]}`;
                });
                setSoilTempChartData({
                  labels,
                  depth0: sData.daily.soil_temperature_0_to_7cm_mean,
                  depth6: sData.daily.soil_temperature_7_to_28cm_mean,
                  depth18: sData.daily.soil_temperature_28_to_100cm_mean,
                  depth54: sData.daily.soil_temperature_0_to_100cm_mean
                });
              } else if (reportType === 'detallado' && sData.hourly) {
                const labels = sData.hourly.time.map((t: string) => {
                  const date = new Date(t);
                  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:00`;
                });
                setSoilTempChartData({
                  labels,
                  depth0: sData.hourly.soil_temperature_0cm,
                  depth6: sData.hourly.soil_temperature_6cm,
                  depth18: sData.hourly.soil_temperature_18cm,
                  depth54: sData.hourly.soil_temperature_54cm
                });
              }
            }
          } catch (err) {
            console.error('Error fetching soil temp data:', err);
          }

          // Fetch Soil Moisture
          try {
            const lat = pointData.latitud;
            const lon = pointData.longitud;
            let moistureUrl = "";
            if (reportType === 'resumen') {
              const params = "soil_moisture_7_to_28cm_mean,soil_moisture_28_to_100cm_mean,soil_moisture_0_to_7cm_mean,soil_moisture_0_to_100cm_mean";
              moistureUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${fechaDesde}&end_date=${fechaHasta}&daily=${params}&timezone=America/Sao_Paulo`;
            } else {
              const params = "soil_moisture_0_to_7cm,soil_moisture_7_to_28cm,soil_moisture_28_to_100cm,soil_moisture_100_to_255cm";
              moistureUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${fechaDesde}&end_date=${fechaHasta}&hourly=${params}&timezone=America/Sao_Paulo`;
            }

            const moistureRes = await fetch(moistureUrl);
            if (moistureRes.ok) {
              const mData = await moistureRes.json();
              if (reportType === 'resumen' && mData.daily) {
                const labels = mData.daily.time.map((t: string) => {
                  const parts = t.split('-');
                  return `${parts[2]}/${parts[1]}`;
                });
                setSoilMoistureChartData({
                  labels,
                  depth0_7: mData.daily.soil_moisture_0_to_7cm_mean,
                  depth7_28: mData.daily.soil_moisture_7_to_28cm_mean,
                  depth28_100: mData.daily.soil_moisture_28_to_100cm_mean,
                  depth0_100: mData.daily.soil_moisture_0_to_100cm_mean
                });
              } else if (reportType === 'detallado' && mData.hourly) {
                const labels = mData.hourly.time.map((t: string) => {
                  const date = new Date(t);
                  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:00`;
                });
                setSoilMoistureChartData({
                  labels,
                  depth0_7: mData.hourly.soil_moisture_0_to_7cm,
                  depth7_28: mData.hourly.soil_moisture_7_to_28cm,
                  depth28_100: mData.hourly.soil_moisture_28_to_100cm,
                  depth100_255: mData.hourly.soil_moisture_100_to_255cm
                });
              }
            }
          } catch (err) {
            console.error('Error fetching soil moisture data:', err);
          }



          setIsGraphGenerated(true);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsFetchingGraph(false);
    }
  };

  const handleExportExcel = () => {
    if (!chartData) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Fecha,Temperatura (C),Max Temp (C),Min Temp (C),Punto de Rocio (C),Humedad (%),Max Hum (%),Min Hum (%),Viento (km/h),Rafaga (km/h),Lluvia (mm),Radiacion Solar\n";
    chartData.labels.forEach((label: string, i: number) => {
      const solarVal = solarChartData?.data?.[i] || '0';
      csvContent += `${label},${chartData.temp[i]},${chartData.maxTemp[i]},${chartData.minTemp[i]},${chartData.dewPoint[i]},${chartData.hum[i]},${chartData.maxHum[i]},${chartData.minHum[i]},${chartData.windSpeed[i]},${chartData.gusts[i]},${chartData.rain[i]},${solarVal}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SkyAgro_Informe_${reportType}_${fechaDesde}_${fechaHasta}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareImage = async (targetId: string = 'informe-grafico-export') => {
    const element = document.getElementById(targetId);
    if (!element) return;
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const filter = (node: HTMLElement) => {
        if (node?.classList?.contains('export-ignore')) return false;
        return true;
      };
      const blob = await htmlToImage.toBlob(element, { 
        backgroundColor: '#ffffff', 
        pixelRatio: isMobile ? 1.5 : 2,
        cacheBust: true,
        filter: filter
      });
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `SkyAgro_Informe_${reportType}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Hubo un error al generar la imagen.");
    }
  };

  const handleExportExcelSolar = () => {
    if (!solarChartData) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Fecha/Hora,Radiacion Solar (W/m2)\n";
    solarChartData.labels.forEach((label: string, i: number) => {
      csvContent += `${label},${solarChartData.data[i]}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SkyAgro_RadiacionSolar_${fechaDesde}_${fechaHasta}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcelEvapo = () => {
    if (!evapoChartData) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += reportType === 'resumen' ? "Fecha,ET0 (mm)\n" : "Fecha/Hora,Evapotranspiracion (mm),ET0 (mm)\n";
    evapoChartData.labels.forEach((label: string, i: number) => {
      const etVal = evapoChartData.et0?.[i] || '0';
      if (reportType === 'resumen') {
        csvContent += `${label},${etVal}\n`;
      } else {
        const eVal = evapoChartData.evapo?.[i] || '0';
        csvContent += `${label},${eVal},${etVal}\n`;
      }
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SkyAgro_Evapotranspiracion_${fechaDesde}_${fechaHasta}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcelSoil = () => {
    if (!soilTempChartData) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Fecha/Hora,0 cm (C),6 cm (C),18 cm (C),54 cm (C)\n";
    soilTempChartData.labels.forEach((label: string, i: number) => {
      csvContent += `${label},${soilTempChartData.depth0[i]},${soilTempChartData.depth6[i]},${soilTempChartData.depth18[i]},${soilTempChartData.depth54[i]}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SkyAgro_TempSuelo_${fechaDesde}_${fechaHasta}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcelMoisture = () => {
    if (!soilMoistureChartData) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    if (reportType === 'resumen') {
      csvContent += "Fecha,0-7 cm (m3/m3),7-28 cm (m3/m3),28-100 cm (m3/m3),0-100 cm (m3/m3)\n";
      soilMoistureChartData.labels.forEach((label: string, i: number) => {
        csvContent += `${label},${soilMoistureChartData.depth0_7[i]},${soilMoistureChartData.depth7_28[i]},${soilMoistureChartData.depth28_100[i]},${soilMoistureChartData.depth0_100[i]}\n`;
      });
    } else {
      csvContent += "Fecha/Hora,0-7 cm (m3/m3),7-28 cm (m3/m3),28-100 cm (m3/m3),100-255 cm (m3/m3)\n";
      soilMoistureChartData.labels.forEach((label: string, i: number) => {
        csvContent += `${label},${soilMoistureChartData.depth0_7[i]},${soilMoistureChartData.depth7_28[i]},${soilMoistureChartData.depth28_100[i]},${soilMoistureChartData.depth100_255[i]}\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SkyAgro_HumedadSuelo_${fechaDesde}_${fechaHasta}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className="p-6 md:p-8">
          <section className="mb-8">
            <p className="text-primary font-bold text-[11px] uppercase tracking-[0.15em]">Informes Históricos</p>
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">{displayTitle}</h1>
            <p className="text-[11px] text-on-surface-variant font-bold uppercase tracking-tight mt-1">Última actualización: {lastUpdate}</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
            <div className="space-y-6">
              <div className="bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/50">
                <h3 className="text-primary font-extrabold text-[12px] uppercase tracking-wider flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-sm">layers</span>
                  Tipo de Informe:
                </h3>
                <div className="grid grid-cols-2 gap-2 p-1 bg-stone-200/50 rounded-full">
                  <button 
                    onClick={() => setReportType('resumen')}
                    className={`${reportType === 'resumen' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-white/50'} py-2 rounded-full text-xs font-extrabold transition-all active:scale-95`}>
                    Resumen
                  </button>
                  <button 
                    onClick={() => setReportType('detallado')}
                    className={`${reportType === 'detallado' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-white/50'} py-2 rounded-full text-xs font-bold transition-all active:scale-95`}>
                    Detallado
                  </button>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/50">
                <h3 className="text-primary font-extrabold text-[12px] uppercase tracking-wider flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  Rango de Fechas
                </h3>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-[9px] absolute -top-2 left-4 bg-white/80 px-1.5 text-primary font-extrabold tracking-wider z-10 rounded">DESDE</label>
                    <input 
                      className="w-full h-12 bg-white/50 border-none rounded-xl px-4 text-on-surface text-sm font-semibold focus:ring-2 focus:ring-primary outline-none" 
                      type="date" 
                      value={fechaDesde} 
                      onChange={(e) => setFechaDesde(e.target.value)} 
                    />
                  </div>
                  <div className="relative">
                    <label className="text-[9px] absolute -top-2 left-4 bg-white/80 px-1.5 text-primary font-extrabold tracking-wider z-10 rounded">HASTA</label>
                    <input 
                      className="w-full h-12 bg-white/50 border-none rounded-xl px-4 text-on-surface text-sm font-semibold focus:ring-2 focus:ring-primary outline-none" 
                      type="date" 
                      value={fechaHasta} 
                      onChange={(e) => setFechaHasta(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 flex flex-col justify-between">
              <div>
                <h3 className="text-primary font-extrabold text-[12px] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Información del Informe
                </h3>
                <p className="text-sm text-on-surface-variant mb-6">
                  Este informe generará automáticamente los datos de Temperatura, Punto de Rocío, Humedad, Viento, Ráfaga, Lluvia, Radiación Solar, Evapotranspiración, Temperatura y Humedad de Suelo para el rango seleccionado.
                </p>
              </div>

              <div className="mt-8 px-2 md:px-8">
                <button 
                  onClick={handleGenerarInforme}
                  disabled={isFetchingGraph || !pointData?.codigo}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-full font-extrabold text-xs shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  {isFetchingGraph ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span className="material-symbols-outlined text-base">monitoring</span>
                  )}
                  {isFetchingGraph ? 'Procesando...' : 'Generar Informe'}
                </button>
              </div>
            </div>
          </div>

          {isGraphGenerated && (
            <div className="flex flex-col gap-6 mt-6">
              <motion.div 
                id="informe-grafico-export"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/50 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/50"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-start mb-8 gap-4">
                  <div>
                    <h4 className="font-headline text-xl font-extrabold tracking-tight">Vista Previa del Gráfico</h4>
                    <p className="text-on-surface-variant text-xs font-semibold mt-1">Configuración actual del informe</p>
                  </div>
                </div>

                <div className="h-[500px] w-full mb-10 rounded-3xl relative">
                  {chartData && (
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={{
                        chart: {
                          backgroundColor: 'transparent',
                          style: { fontFamily: 'inherit' },
                          height: 500,
                          zoomType: 'x'
                        },
                        title: { text: undefined },
                        xAxis: [{
                          categories: chartData.labels,
                          crosshair: true,
                          labels: { style: { color: '#666', fontWeight: 'bold', fontSize: '10px' } }
                        }],
                        yAxis: [
                          { // Primary yAxis (Temperatura)
                            labels: { format: '{value}°C', style: { color: '#E53935', fontWeight: 'bold' } },
                            title: { text: 'Temperatura (°C)', style: { color: '#E53935' } },
                            gridLineColor: 'rgba(0,0,0,0.05)',
                          },
                          { // Secondary yAxis (Lluvia)
                            title: { text: 'Lluvia (mm)', style: { color: '#00A3E0' } },
                            labels: { format: '{value} mm', style: { color: '#00A3E0', fontWeight: 'bold' } },
                            opposite: true,
                            gridLineWidth: 0,
                            min: 0
                          },
                          { // Tertiary yAxis (Humedad)
                            title: { text: 'Humedad (%)', style: { color: '#5A32A3' } },
                            labels: { format: '{value}%', style: { color: '#5A32A3', fontWeight: 'bold' } },
                            opposite: true,
                            gridLineWidth: 0,
                            min: 0,
                            max: 100
                          },
                          { // Quaternary yAxis (Viento)
                            title: { text: 'Viento (km/h)', style: { color: '#43A047' } },
                            labels: { format: '{value} km/h', style: { color: '#43A047', fontWeight: 'bold' } },
                            opposite: true,
                            gridLineWidth: 0,
                            min: 0
                          }
                        ],
                        tooltip: {
                          shared: true,
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: '#eee',
                          shadow: true,
                          style: { fontSize: '12px' }
                        },
                        legend: {
                          layout: 'horizontal',
                          align: 'center',
                          verticalAlign: 'bottom',
                          itemStyle: { fontWeight: '600', fontSize: '11px', color: '#333' }
                        },
                        series: [
                          { name: 'Lluvia', type: 'column', yAxis: 1, data: chartData.rain, color: '#00A3E0', tooltip: { valueSuffix: ' mm' } },
                          { name: 'Temperatura', type: 'spline', data: chartData.temp, color: '#E53935', tooltip: { valueSuffix: ' °C' }, marker: { enabled: false } },
                          { name: 'Temp. Máxima', type: 'spline', data: chartData.maxTemp, color: '#FF7043', dashStyle: 'ShortDash', tooltip: { valueSuffix: ' °C' }, marker: { enabled: false } },
                          { name: 'Temp. Mínima', type: 'spline', data: chartData.minTemp, color: '#FFA726', dashStyle: 'ShortDash', tooltip: { valueSuffix: ' °C' }, marker: { enabled: false } },
                          { name: 'Punto de Rocío', type: 'spline', data: chartData.dewPoint, color: '#8D6E63', dashStyle: 'Dot', tooltip: { valueSuffix: ' °C' }, marker: { enabled: false } },
                          { name: 'Humedad', type: 'spline', yAxis: 2, data: chartData.hum, color: '#5A32A3', tooltip: { valueSuffix: ' %' }, marker: { enabled: false } },
                          { name: 'Humedad Máxima', type: 'spline', yAxis: 2, data: chartData.maxHum, color: '#7E57C2', dashStyle: 'ShortDash', tooltip: { valueSuffix: ' %' }, marker: { enabled: false }, visible: false },
                          { name: 'Humedad Mínima', type: 'spline', yAxis: 2, data: chartData.minHum, color: '#B39DDB', dashStyle: 'ShortDash', tooltip: { valueSuffix: ' %' }, marker: { enabled: false }, visible: false },
                          { name: 'Viento', type: 'spline', yAxis: 3, data: chartData.windSpeed, color: '#43A047', tooltip: { valueSuffix: ' km/h' }, marker: { enabled: false } },
                          { name: 'Ráfaga', type: 'spline', yAxis: 3, data: chartData.gusts, color: '#81C784', dashStyle: 'ShortDash', tooltip: { valueSuffix: ' km/h' }, marker: { enabled: false }, visible: false }
                        ],
                        responsive: {
                          rules: [{
                            condition: { maxWidth: 500 },
                            chartOptions: {
                              yAxis: [
                                { labels: { style: { fontSize: '8px' } }, title: { text: null } },
                                { labels: { style: { fontSize: '8px' } }, title: { text: null } },
                                { labels: { style: { fontSize: '8px' } }, title: { text: null } },
                                { labels: { style: { fontSize: '8px' } }, title: { text: null } }
                              ],
                              legend: { itemStyle: { fontSize: '9px' } }
                            }
                          }]
                        },
                        credits: { enabled: false }
                      }}
                    />
                  )}
                </div>

                <div className="flex flex-row justify-center gap-6 mt-6 export-ignore">
                  <button 
                    onClick={handleExportExcel} 
                    className="w-[52px] h-[52px] flex items-center justify-center bg-[#566B38] text-white rounded-[1.2rem] shadow-md hover:opacity-90 transition-all active:scale-95"
                    title="Exportar a Excel"
                  >
                    <span className="material-symbols-outlined text-[26px]">description</span>
                  </button>
                  <button 
                    onClick={() => handleShareImage('informe-grafico-export')} 
                    className="w-[52px] h-[52px] flex items-center justify-center bg-[#0C6D21] text-white rounded-[1.2rem] shadow-md hover:opacity-90 transition-all active:scale-95"
                    title="Compartir"
                  >
                    <span className="material-symbols-outlined text-[26px]">share</span>
                  </button>
                </div>
              </motion.div>

              {/* Gráfico de Radiación Solar */}
              <motion.div 
                id="informe-solar-export"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/50 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/50"
              >
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary">light_mode</span>
                  <div>
                    <h4 className="font-headline text-xl font-extrabold tracking-tight">Radiación Solar</h4>
                    <p className="text-on-surface-variant text-xs font-semibold mt-1">Intensidad de radiación en W/m²</p>
                  </div>
                </div>

                <div className="h-[400px] w-full rounded-3xl relative">
                  {solarChartData && (
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={{
                        chart: {
                          type: 'areaspline',
                          backgroundColor: 'transparent',
                          height: 400
                        },
                        title: { text: undefined },
                        xAxis: {
                          categories: solarChartData.labels,
                          labels: { 
                            style: { color: '#666', fontWeight: 'bold', fontSize: '10px' },
                            rotation: reportType === 'detallado' ? -45 : 0
                          }
                        },
                        yAxis: {
                          title: { text: 'Radiación (W/m²)' },
                          labels: { format: '{value} W' }
                        },
                        tooltip: {
                          shared: true,
                          valueSuffix: ' W/m²'
                        },
                        plotOptions: {
                          areaspline: {
                            fillColor: {
                              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                              stops: [
                                [0, 'rgba(255, 112, 67, 0.5)'],
                                [1, 'rgba(255, 112, 67, 0)']
                              ]
                            },
                            marker: { enabled: false },
                            lineWidth: 3,
                            color: '#FF7043'
                          }
                        },
                        series: [{
                          name: 'Radiación Solar',
                          data: solarChartData.data
                        }],
                        credits: { enabled: false }
                      }}
                    />
                  )}
                </div>

                <div className="flex flex-row justify-center gap-6 mt-6 export-ignore">
                  <button 
                    onClick={handleExportExcelSolar} 
                    className="w-[52px] h-[52px] flex items-center justify-center bg-[#566B38] text-white rounded-[1.2rem] shadow-md hover:opacity-90 transition-all active:scale-95"
                    title="Exportar a Excel"
                  >
                    <span className="material-symbols-outlined text-[26px]">description</span>
                  </button>
                  <button 
                    onClick={() => handleShareImage('informe-solar-export')} 
                    className="w-[52px] h-[52px] flex items-center justify-center bg-[#0C6D21] text-white rounded-[1.2rem] shadow-md hover:opacity-90 transition-all active:scale-95"
                    title="Compartir"
                  >
                    <span className="material-symbols-outlined text-[26px]">share</span>
                  </button>
                </div>
              </motion.div>

              {/* Gráfico de Evapotranspiración y ET0 */}
              <motion.div 
                id="informe-evapo-export"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/50 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/50"
              >
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary">opacity</span>
                  <div>
                    <h4 className="font-headline text-xl font-extrabold tracking-tight">Evapotranspiración y ET0</h4>
                    <p className="text-on-surface-variant text-xs font-semibold mt-1">Análisis hídrico en mm</p>
                  </div>
                </div>

                <div className="h-[400px] w-full rounded-3xl relative">
                  {evapoChartData && (
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={{
                        chart: {
                          type: 'spline',
                          backgroundColor: 'transparent',
                          height: 400
                        },
                        title: { text: undefined },
                        xAxis: {
                          categories: evapoChartData.labels,
                          labels: { 
                            style: { color: '#666', fontWeight: 'bold', fontSize: '10px' },
                            rotation: reportType === 'detallado' ? -45 : 0
                          }
                        },
                        yAxis: {
                          title: { text: 'Milímetros (mm)' },
                          labels: { format: '{value} mm' }
                        },
                        tooltip: {
                          shared: true,
                          valueSuffix: ' mm'
                        },
                        legend: {
                          align: 'center',
                          verticalAlign: 'bottom',
                          itemStyle: { fontWeight: '600', fontSize: '11px', color: '#333' }
                        },
                        series: [
                          ...(reportType === 'detallado' ? [{
                            name: 'Evapotranspiración',
                            data: evapoChartData.evapo,
                            color: '#00A3E0',
                            marker: { enabled: true, radius: 4 }
                          }] : []),
                          {
                            name: 'ET0',
                            data: evapoChartData.et0,
                            color: '#5A32A3',
                            marker: { enabled: true, radius: 4, symbol: 'diamond' }
                          }
                        ],
                        credits: { enabled: false }
                      }}
                    />
                  )}
                </div>

                <div className="flex flex-row justify-center gap-6 mt-6 export-ignore">
                  <button 
                    onClick={handleExportExcelEvapo} 
                    className="w-[52px] h-[52px] flex items-center justify-center bg-[#566B38] text-white rounded-[1.2rem] shadow-md hover:opacity-90 transition-all active:scale-95"
                    title="Exportar a Excel"
                  >
                    <span className="material-symbols-outlined text-[26px]">description</span>
                  </button>
                  <button 
                    onClick={() => handleShareImage('informe-evapo-export')} 
                    className="w-[52px] h-[52px] flex items-center justify-center bg-[#0C6D21] text-white rounded-[1.2rem] shadow-md hover:opacity-90 transition-all active:scale-95"
                    title="Compartir"
                  >
                    <span className="material-symbols-outlined text-[26px]">share</span>
                  </button>
                </div>
              </motion.div>

              {/* Gráfico de Temperatura de Suelo */}
              <motion.div 
                id="informe-soil-export"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/50 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/50"
              >
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary">thermostat</span>
                  <div>
                    <h4 className="font-headline text-xl font-extrabold tracking-tight">Temperatura de Suelo</h4>
                    <p className="text-on-surface-variant text-xs font-semibold mt-1">Monitoreo en diferentes profundidades</p>
                  </div>
                </div>

                <div className="h-[400px] w-full rounded-3xl relative">
                  {soilTempChartData && (
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={{
                        chart: {
                          type: 'spline',
                          backgroundColor: 'transparent',
                          height: 400
                        },
                        title: { text: undefined },
                        xAxis: {
                          categories: soilTempChartData.labels,
                          labels: { 
                            style: { color: '#666', fontWeight: 'bold', fontSize: '10px' },
                            rotation: reportType === 'detallado' ? -45 : 0
                          }
                        },
                        yAxis: {
                          title: { text: 'Temperatura (°C)' },
                          labels: { format: '{value}°C' }
                        },
                        tooltip: {
                          shared: true,
                          valueSuffix: ' °C'
                        },
                        legend: {
                          align: 'center',
                          verticalAlign: 'bottom',
                          itemStyle: { fontWeight: '600', fontSize: '11px', color: '#333' }
                        },
                        series: [
                          { name: '0 cm', data: soilTempChartData.depth0, color: '#E53935' },
                          { name: '6 cm', data: soilTempChartData.depth6, color: '#FFB300' },
                          { name: '18 cm', data: soilTempChartData.depth18, color: '#43A047' },
                          { name: '54 cm', data: soilTempChartData.depth54, color: '#1E88E5' }
                        ],
                        credits: { enabled: false }
                      }}
                    />
                  )}
                </div>

                <div className="flex flex-row justify-center gap-6 mt-6 export-ignore">
                  <button 
                    onClick={handleExportExcelSoil} 
                    className="w-[52px] h-[52px] flex items-center justify-center bg-[#566B38] text-white rounded-[1.2rem] shadow-md hover:opacity-90 transition-all active:scale-95"
                    title="Exportar a Excel"
                  >
                    <span className="material-symbols-outlined text-[26px]">description</span>
                  </button>
                  <button 
                    onClick={() => handleShareImage('informe-soil-export')} 
                    className="w-[52px] h-[52px] flex items-center justify-center bg-[#0C6D21] text-white rounded-[1.2rem] shadow-md hover:opacity-90 transition-all active:scale-95"
                    title="Compartir"
                  >
                    <span className="material-symbols-outlined text-[26px]">share</span>
                  </button>
                </div>
              </motion.div>

              {/* Gráfico de Humedad de Suelo */}
              <motion.div 
                id="informe-moisture-export"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/50 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/50"
              >
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary">water_drop</span>
                  <div>
                    <h4 className="font-headline text-xl font-extrabold tracking-tight">Humedad de Suelo</h4>
                    <p className="text-on-surface-variant text-xs font-semibold mt-1">Nivel de humedad en m³/m³</p>
                  </div>
                </div>

                <div className="h-[400px] w-full rounded-3xl relative">
                  {soilMoistureChartData && (
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={{
                        chart: {
                          type: 'areaspline',
                          backgroundColor: 'transparent',
                          height: 400
                        },
                        title: { text: undefined },
                        xAxis: {
                          categories: soilMoistureChartData.labels,
                          labels: { 
                            style: { color: '#666', fontWeight: 'bold', fontSize: '10px' },
                            rotation: reportType === 'detallado' ? -45 : 0
                          }
                        },
                        yAxis: {
                          title: { text: 'Humedad (m³/m³)' },
                          labels: { format: '{value}' }
                        },
                        tooltip: {
                          shared: true,
                          valueSuffix: ' m³/m³'
                        },
                        legend: {
                          align: 'center',
                          verticalAlign: 'bottom',
                          itemStyle: { fontWeight: '600', fontSize: '11px', color: '#333' }
                        },
                        plotOptions: {
                          areaspline: {
                            fillOpacity: 0.1,
                            marker: { enabled: false },
                            lineWidth: 3
                          }
                        },
                        series: [
                          { name: '0-7 cm', data: soilMoistureChartData.depth0_7, color: '#BBDEFB' },
                          { name: '7-28 cm', data: soilMoistureChartData.depth7_28, color: '#64B5F6' },
                          { name: '28-100 cm', data: soilMoistureChartData.depth28_100, color: '#2196F3' },
                          ...(reportType === 'resumen' ? [
                            { name: '0-100 cm', data: soilMoistureChartData.depth0_100, color: '#1565C0' }
                          ] : [
                            { name: '100-255 cm', data: soilMoistureChartData.depth100_255, color: '#1565C0' }
                          ])
                        ],
                        credits: { enabled: false }
                      }}
                    />
                  )}
                </div>

                <div className="flex flex-row justify-center gap-6 mt-6 export-ignore">
                  <button 
                    onClick={handleExportExcelMoisture} 
                    className="w-[52px] h-[52px] flex items-center justify-center bg-[#566B38] text-white rounded-[1.2rem] shadow-md hover:opacity-90 transition-all active:scale-95"
                    title="Exportar a Excel"
                  >
                    <span className="material-symbols-outlined text-[26px]">description</span>
                  </button>
                  <button 
                    onClick={() => handleShareImage('informe-moisture-export')} 
                    className="w-[52px] h-[52px] flex items-center justify-center bg-[#0C6D21] text-white rounded-[1.2rem] shadow-md hover:opacity-90 transition-all active:scale-95"
                    title="Compartir"
                  >
                    <span className="material-symbols-outlined text-[26px]">share</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

    </main>
  );
}
