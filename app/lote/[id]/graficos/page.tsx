'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { useParams } from 'next/navigation';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as htmlToImage from 'html-to-image';

// Define dynamic data for each selected range
const chartDataSets: Record<string, any> = {
  '24h': {
    tempHum: {
      labels: ['00:00', '06:00', '12:00', '18:00', '23:59'],
      temp: [18, 22, 28, 24, 19],
      hum: [65, 60, 45, 55, 70],
      maxTemp: [20, 24, 30, 26, 21],
      minTemp: [16, 20, 26, 22, 17],
      dewPoint: [14, 15, 12, 16, 18]
    },
    wind: {
      avg: "12.4",
      labels: ['00:00', '06:00', '12:00', '18:00', '23:59'],
      windSpeed: [10, 15, 20, 18, 12],
      gusts: [15, 22, 30, 25, 18]
    },
    rain: {
      labels: ['01/01/2024 - 00:00', '01/01/2024 - 06:00', '01/01/2024 - 12:00', '01/01/2024 - 18:00', '01/01/2024 - 23:59'],
      data: [2, 8, 22, 5, 0]
    },
    solar: {
      avg: "850",
      labels: ['06:00', '12:00', '18:00'],
      path: "M0,150 Q100,10 200,30 T400,100",
      yPulse: "30"
    },
    soilTemp: {
      labels: ['00:00', '06:00', '12:00', '18:00', '23:59'],
      data: {
        d5: "M0,50 Q100,20 200,40 T400,30",
        d8: "M0,80 Q100,50 200,70 T400,60",
        d35: "M0,130 Q100,100 200,120 T400,110",
        d50: "M0,170 Q100,150 200,160 T400,150"
      },
      legend: { d5: "28°C", d8: "25°C", d35: "21°C", d50: "18°C" }
    },
    soilHum: {
      labels: ['00:00', '06:00', '12:00', '18:00', '23:59'],
      data: {
        d5: "M0,200 L0,50 Q100,70 200,40 T400,60 L400,200 Z",
        d8: "M0,200 L0,80 Q100,100 200,70 T400,90 L400,200 Z",
        d35: "M0,200 L0,120 Q100,140 200,110 T400,130 L400,200 Z",
        d50: "M0,200 L0,150 Q100,170 200,140 T400,160 L400,200 Z"
      },
      legend: { d5: "15%", d8: "22%", d35: "28%", d50: "35%" }
    }
  },
  '7d': {
    tempHum: {
      labels: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
      temp: [22, 24, 21, 25, 23, 20, 22],
      hum: [55, 50, 65, 40, 45, 70, 60],
      maxTemp: [24, 26, 23, 27, 25, 22, 24],
      minTemp: [20, 22, 19, 23, 21, 18, 20],
      dewPoint: [15, 14, 18, 12, 13, 20, 17]
    },
    wind: {
      avg: "14.2",
      labels: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
      windSpeed: [12, 14, 11, 16, 13, 15, 12],
      gusts: [18, 20, 16, 25, 22, 24, 19]
    },
    rain: {
      labels: ['01/01/2024 - 12:00', '02/01/2024 - 12:00', '03/01/2024 - 12:00', '04/01/2024 - 12:00', '05/01/2024 - 12:00', '06/01/2024 - 12:00', '07/01/2024 - 12:00'],
      data: [0, 12, 35, 2, 0, 4, 18]
    },
    solar: {
      avg: "920",
      labels: ['Lu', 'Mi', 'Vi', 'Do'],
      path: "M0,120 Q100,20 200,40 T400,80",
      yPulse: "40"
    },
    soilTemp: {
      labels: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi'],
      data: {
        d5: "M0,40 Q100,60 200,50 T400,70",
        d8: "M0,70 Q100,90 200,80 T400,100",
        d35: "M0,110 Q100,130 200,120 T400,140",
        d50: "M0,150 Q100,170 200,160 T400,180"
      },
      legend: { d5: "26°C", d8: "24°C", d35: "20°C", d50: "17°C" }
    },
    soilHum: {
      labels: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi'],
      data: {
        d5: "M0,200 L0,60 Q100,80 200,50 T400,70 L400,200 Z",
        d8: "M0,200 L0,90 Q100,110 200,80 T400,100 L400,200 Z",
        d35: "M0,200 L0,130 Q100,150 200,120 T400,140 L400,200 Z",
        d50: "M0,200 L0,160 Q100,180 200,150 T400,170 L400,200 Z"
      },
      legend: { d5: "18%", d8: "24%", d35: "30%", d50: "38%" }
    }
  },
  'month': {
    tempHum: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      temp: [28, 29, 26, 22, 18, 15],
      hum: [40, 45, 55, 65, 75, 80],
      maxTemp: [30, 31, 28, 24, 20, 17],
      minTemp: [26, 27, 24, 20, 16, 13],
      dewPoint: [18, 20, 19, 15, 12, 10]
    },
    wind: {
      avg: "16.8",
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      windSpeed: [15, 18, 14, 12, 16, 19],
      gusts: [22, 28, 20, 18, 25, 30]
    },
    rain: {
      labels: ['15/01/2024 - 12:00', '15/02/2024 - 12:00', '15/03/2024 - 12:00', '15/04/2024 - 12:00', '15/05/2024 - 12:00', '15/06/2024 - 12:00'],
      data: [45, 120, 85, 30, 10, 60]
    },
    solar: {
      avg: "780",
      labels: ['Ene', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
      path: "M0,80 Q100,60 200,30 T400,120",
      yPulse: "30"
    },
    soilTemp: {
      labels: ['Ene', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
      data: {
        d5: "M0,60 Q100,40 200,80 T400,50",
        d8: "M0,90 Q100,70 200,110 T400,80",
        d35: "M0,130 Q100,110 200,150 T400,120",
        d50: "M0,170 Q100,150 200,190 T400,160"
      },
      legend: { d5: "29°C", d8: "27°C", d35: "22°C", d50: "19°C" }
    },
    soilHum: {
      labels: ['Ene', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
      data: {
        d5: "M0,200 L0,40 Q100,50 200,30 T400,40 L400,200 Z",
        d8: "M0,200 L0,70 Q100,80 200,60 T400,70 L400,200 Z",
        d35: "M0,200 L0,110 Q100,120 200,100 T400,110 L400,200 Z",
        d50: "M0,200 L0,140 Q100,150 200,130 T400,140 L400,200 Z"
      },
      legend: { d5: "12%", d8: "20%", d35: "26%", d50: "32%" }
    }
  }
};

export default function Graficos() {
  const params = useParams();
  const idStr = (params?.id as string) || '';
  
  const [pointData, setPointData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dynamic24hData, setDynamic24hData] = useState<any>(null);
  const [loading24h, setLoading24h] = useState(false);
  const [dynamic7dData, setDynamic7dData] = useState<any>(null);
  const [loading7d, setLoading7d] = useState(false);
  const [dynamicMonthData, setDynamicMonthData] = useState<any>(null);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [solarChartData, setSolarChartData] = useState<any>(null);
  const [loadingSolar, setLoadingSolar] = useState(false);
  const [evapoChartData, setEvapoChartData] = useState<any>(null);
  const [loadingEvapo, setLoadingEvapo] = useState(false);
  const [soilTempChartData, setSoilTempChartData] = useState<any>(null);
  const [loadingSoilTemp, setLoadingSoilTemp] = useState(false);
  const [soilMoistureChartData, setSoilMoistureChartData] = useState<any>(null);
  const [loadingSoilMoisture, setLoadingSoilMoisture] = useState(false);

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

  const [selectedRange, setSelectedRange] = useState('24h');
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const ranges = [
    { id: '24h', label: 'Últimas 24 hs' },
    { id: '7d', label: 'Últimos 7 días' },
    { id: 'month', label: 'Meses del año actual' }
  ];

  useEffect(() => {
    if (pointData?.latitud && pointData?.longitud) {
      const fetchSolarData = async () => {
        setLoadingSolar(true);
        try {
          const isMonth = selectedRange === 'month';
          const is7d = selectedRange === '7d';
          const today = new Date();
          const startDateRef = new Date(today);
          if (isMonth) {
            startDateRef.setMonth(0, 1);
          } else {
            startDateRef.setDate(startDateRef.getDate() - (is7d ? 7 : 1));
          }
          
          const formatDate = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          const startDate = formatDate(startDateRef);
          const endDate = formatDate(today);
          
          const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${pointData.latitud}&longitude=${pointData.longitud}&start_date=${startDate}&end_date=${endDate}&hourly=shortwave_radiation&timezone=America%2FSao_Paulo`;
          
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data?.hourly) {
              if (isMonth || is7d) {
                const groupedData: Record<string, { sum: number, count: number }> = {};
                data.hourly.time.forEach((t: string, i: number) => {
                  const dateKey = isMonth ? t.substring(0, 7) : t.split('T')[0];
                  if (data.hourly.shortwave_radiation[i] !== null) {
                    if (!groupedData[dateKey]) groupedData[dateKey] = { sum: 0, count: 0 };
                    groupedData[dateKey].sum += data.hourly.shortwave_radiation[i];
                    groupedData[dateKey].count += 1;
                  }
                });
                
                const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                const labels = Object.keys(groupedData).map(k => {
                  const parts = k.split('-');
                  if (isMonth) {
                    const m = parseInt(parts[1], 10);
                    return monthNames[m - 1];
                  } else {
                    return `${parts[2]}/${parts[1]}`;
                  }
                });
                const radiation = Object.values(groupedData).map(d => Math.round(d.sum / d.count));
                setSolarChartData({ labels, data: radiation });
              } else {
                const now = new Date();
                const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                
                const filteredIndices = data.hourly.time
                  .map((t: string, i: number) => {
                    const date = new Date(t);
                    return (date >= last24h && date <= now) ? i : -1;
                  })
                  .filter((i: number) => i !== -1);
                
                const labels = filteredIndices.map((i: number) => {
                  const date = new Date(data.hourly.time[i]);
                  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                });
                
                const radiation = filteredIndices.map((i: number) => data.hourly.shortwave_radiation[i]);
                
                setSolarChartData({ labels, data: radiation });
              }
            }
          }
        } catch (error) {
          console.error('Error fetching solar data:', error);
        } finally {
          setLoadingSolar(false);
        }
      };
      fetchSolarData();
    }
  }, [pointData, selectedRange]);

  useEffect(() => {
    if (pointData?.latitud && pointData?.longitud) {
      const fetchEvapoData = async () => {
        setLoadingEvapo(true);
        try {
          const isMonth = selectedRange === 'month';
          const is7d = selectedRange === '7d';
          const today = new Date();
          const startDateRef = new Date(today);
          if (isMonth) {
            startDateRef.setMonth(0, 1);
          } else {
            startDateRef.setDate(startDateRef.getDate() - (is7d ? 7 : 1));
          }
          
          const formatDate = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          const startDate = formatDate(startDateRef);
          const endDate = formatDate(today);
          
          const baseUrl = isMonth ? 'https://archive-api.open-meteo.com/v1/archive' : 'https://api.open-meteo.com/v1/forecast';
          const url = `${baseUrl}?latitude=${pointData.latitud}&longitude=${pointData.longitud}&start_date=${startDate}&end_date=${endDate}&hourly=evapotranspiration,et0_fao_evapotranspiration&timezone=America%2FSao_Paulo`;
          
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            
            if (data?.hourly) {
              if (isMonth || is7d) {
                const groupedData: Record<string, { evapoSum: number, et0Sum: number, count: number }> = {};
                data.hourly.time.forEach((t: string, i: number) => {
                  const dateKey = isMonth ? t.substring(0, 7) : t.split('T')[0];
                  const evapoVal = data.hourly.evapotranspiration ? data.hourly.evapotranspiration[i] : null;
                  const et0Val = data.hourly.et0_fao_evapotranspiration ? data.hourly.et0_fao_evapotranspiration[i] : null;
                  
                  if (isMonth) {
                    if (et0Val !== null) {
                      if (!groupedData[dateKey]) groupedData[dateKey] = { evapoSum: 0, et0Sum: 0, count: 0 };
                      groupedData[dateKey].et0Sum += et0Val;
                      groupedData[dateKey].count += 1;
                    }
                  } else {
                    if (evapoVal !== null && et0Val !== null) {
                      if (!groupedData[dateKey]) groupedData[dateKey] = { evapoSum: 0, et0Sum: 0, count: 0 };
                      groupedData[dateKey].evapoSum += evapoVal;
                      groupedData[dateKey].et0Sum += et0Val;
                      groupedData[dateKey].count += 1;
                    }
                  }
                });
                
                const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                const labels = Object.keys(groupedData).map(k => {
                  const parts = k.split('-');
                  if (isMonth) {
                    const m = parseInt(parts[1], 10);
                    return monthNames[m - 1];
                  } else {
                    return `${parts[2]}/${parts[1]}`;
                  }
                });
                const evapo = Object.values(groupedData).map(d => Number((d.evapoSum).toFixed(2)));
                const et0 = Object.values(groupedData).map(d => Number((d.et0Sum).toFixed(2)));
                setEvapoChartData({ labels, evapo, et0 });
              } else {
                const now = new Date();
                const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                
                const filteredIndices = data.hourly.time
                  .map((t: string, i: number) => {
                    const date = new Date(t);
                    return (date >= last24h && date <= now) ? i : -1;
                  })
                  .filter((i: number) => i !== -1);
                
                const labels = filteredIndices.map((i: number) => {
                  const date = new Date(data.hourly.time[i]);
                  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                });
                
                let accEvapo = 0;
                let accEt0 = 0;
                const evapo = filteredIndices.map((i: number) => {
                  accEvapo += (data.hourly.evapotranspiration[i] || 0);
                  return Number(accEvapo.toFixed(2));
                });
                const et0 = filteredIndices.map((i: number) => {
                  accEt0 += (data.hourly.et0_fao_evapotranspiration[i] || 0);
                  return Number(accEt0.toFixed(2));
                });
                
                setEvapoChartData({ labels, evapo, et0 });
              }
            }
          }
        } catch (error) {
          console.error('Error fetching evapo data:', error);
        } finally {
          setLoadingEvapo(false);
        }
      };
      fetchEvapoData();
    }
  }, [pointData, selectedRange]);

  useEffect(() => {
    if (pointData?.latitud && pointData?.longitud) {
      const fetchSoilTempData = async () => {
        setLoadingSoilTemp(true);
        try {
          const isMonth = selectedRange === 'month';
          const is7d = selectedRange === '7d';
          const today = new Date();
          const startDateRef = new Date(today);
          if (isMonth) {
            startDateRef.setMonth(0, 1);
          } else {
            startDateRef.setDate(startDateRef.getDate() - (is7d ? 7 : 1));
          }
          
          const formatDate = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          const startDate = formatDate(startDateRef);
          const endDate = formatDate(today);
          
          let url = '';
          if (isMonth) {
            url = `https://archive-api.open-meteo.com/v1/archive?latitude=${pointData.latitud}&longitude=${pointData.longitud}&start_date=${startDate}&end_date=${endDate}&daily=soil_temperature_7_to_28cm_mean,soil_temperature_28_to_100cm_mean,soil_temperature_0_to_7cm_mean,soil_temperature_0_to_100cm_mean&timezone=America%2FSao_Paulo`;
          } else {
            url = `https://api.open-meteo.com/v1/forecast?latitude=${pointData.latitud}&longitude=${pointData.longitud}&start_date=${startDate}&end_date=${endDate}&hourly=soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_temperature_0cm&timezone=America%2FSao_Paulo`;
          }
          
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            
            if (isMonth && data?.daily) {
              const groupedData: Record<string, { t0Sum: number, t6Sum: number, t18Sum: number, t54Sum: number, count: number }> = {};
              data.daily.time.forEach((t: string, i: number) => {
                const dateKey = t.substring(0, 7);
                const val0 = data.daily.soil_temperature_0_to_100cm_mean ? data.daily.soil_temperature_0_to_100cm_mean[i] : null;
                const val7 = data.daily.soil_temperature_0_to_7cm_mean ? data.daily.soil_temperature_0_to_7cm_mean[i] : null;
                const val28 = data.daily.soil_temperature_7_to_28cm_mean ? data.daily.soil_temperature_7_to_28cm_mean[i] : null;
                const val100 = data.daily.soil_temperature_28_to_100cm_mean ? data.daily.soil_temperature_28_to_100cm_mean[i] : null;
                
                if (val0 !== null && val7 !== null && val28 !== null && val100 !== null) {
                  if (!groupedData[dateKey]) groupedData[dateKey] = { t0Sum: 0, t6Sum: 0, t18Sum: 0, t54Sum: 0, count: 0 };
                  groupedData[dateKey].t0Sum += val0;
                  groupedData[dateKey].t6Sum += val7;
                  groupedData[dateKey].t18Sum += val28;
                  groupedData[dateKey].t54Sum += val100;
                  groupedData[dateKey].count += 1;
                }
              });
              
              const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
              const labels = Object.keys(groupedData).map(k => {
                const m = parseInt(k.split('-')[1], 10);
                return monthNames[m - 1];
              });
              const temp0cm = Object.values(groupedData).map(d => Number((d.t0Sum / d.count).toFixed(1)));
              const temp6cm = Object.values(groupedData).map(d => Number((d.t6Sum / d.count).toFixed(1)));
              const temp18cm = Object.values(groupedData).map(d => Number((d.t18Sum / d.count).toFixed(1)));
              const temp54cm = Object.values(groupedData).map(d => Number((d.t54Sum / d.count).toFixed(1)));
              setSoilTempChartData({ labels, temp0cm, temp6cm, temp18cm, temp54cm });
            } else if (!isMonth && data?.hourly) {
              if (is7d) {
                const groupedData: Record<string, { t0Sum: number, t6Sum: number, t18Sum: number, t54Sum: number, count: number }> = {};
                data.hourly.time.forEach((t: string, i: number) => {
                  const dateKey = t.split('T')[0];
                  if (data.hourly.soil_temperature_0cm[i] !== null) {
                    if (!groupedData[dateKey]) groupedData[dateKey] = { t0Sum: 0, t6Sum: 0, t18Sum: 0, t54Sum: 0, count: 0 };
                    groupedData[dateKey].t0Sum += data.hourly.soil_temperature_0cm[i];
                    groupedData[dateKey].t6Sum += data.hourly.soil_temperature_6cm[i];
                    groupedData[dateKey].t18Sum += data.hourly.soil_temperature_18cm[i];
                    groupedData[dateKey].t54Sum += data.hourly.soil_temperature_54cm[i];
                    groupedData[dateKey].count += 1;
                  }
                });
                
                const labels = Object.keys(groupedData).map(k => {
                  const parts = k.split('-');
                  return `${parts[2]}/${parts[1]}`;
                });
                const temp0cm = Object.values(groupedData).map(d => Number((d.t0Sum / d.count).toFixed(1)));
                const temp6cm = Object.values(groupedData).map(d => Number((d.t6Sum / d.count).toFixed(1)));
                const temp18cm = Object.values(groupedData).map(d => Number((d.t18Sum / d.count).toFixed(1)));
                const temp54cm = Object.values(groupedData).map(d => Number((d.t54Sum / d.count).toFixed(1)));
                setSoilTempChartData({ labels, temp0cm, temp6cm, temp18cm, temp54cm });
              } else {
                const now = new Date();
                const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                
                const filteredIndices = data.hourly.time
                  .map((t: string, i: number) => {
                    const date = new Date(t);
                    return (date >= last24h && date <= now) ? i : -1;
                  })
                  .filter((i: number) => i !== -1);
                
                const labels = filteredIndices.map((i: number) => {
                  const date = new Date(data.hourly.time[i]);
                  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                });
                
                const temp0cm = filteredIndices.map((i: number) => data.hourly.soil_temperature_0cm[i]);
                const temp6cm = filteredIndices.map((i: number) => data.hourly.soil_temperature_6cm[i]);
                const temp18cm = filteredIndices.map((i: number) => data.hourly.soil_temperature_18cm[i]);
                const temp54cm = filteredIndices.map((i: number) => data.hourly.soil_temperature_54cm[i]);
                
                setSoilTempChartData({ labels, temp0cm, temp6cm, temp18cm, temp54cm });
              }
            }
          }
        } catch (error) {
          console.error('Error fetching soil temp data:', error);
        } finally {
          setLoadingSoilTemp(false);
        }
      };
      fetchSoilTempData();
    }
  }, [pointData, selectedRange]);

  useEffect(() => {
    if (pointData?.latitud && pointData?.longitud) {
      const fetchSoilMoistureData = async () => {
        setLoadingSoilMoisture(true);
        try {
          const isMonth = selectedRange === 'month';
          const is7d = selectedRange === '7d';
          const today = new Date();
          const startDateRef = new Date(today);
          if (isMonth) {
            startDateRef.setMonth(0, 1);
          } else {
            startDateRef.setDate(startDateRef.getDate() - (is7d ? 7 : 1));
          }
          
          const formatDate = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          const startDate = formatDate(startDateRef);
          const endDate = formatDate(today);
          
          let url = '';
          if (isMonth) {
            url = `https://archive-api.open-meteo.com/v1/archive?latitude=${pointData.latitud}&longitude=${pointData.longitud}&start_date=${startDate}&end_date=${endDate}&daily=soil_moisture_7_to_28cm_mean,soil_moisture_28_to_100cm_mean,soil_moisture_0_to_7cm_mean,soil_moisture_0_to_100cm_mean&timezone=America%2FSao_Paulo`;
          } else {
            url = `https://archive-api.open-meteo.com/v1/archive?latitude=${pointData.latitud}&longitude=${pointData.longitud}&start_date=${startDate}&end_date=${endDate}&hourly=soil_moisture_7_to_28cm,soil_moisture_100_to_255cm,soil_moisture_28_to_100cm,soil_moisture_0_to_7cm&timezone=America%2FSao_Paulo`;
          }
          
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            
            if (isMonth && data?.daily) {
              const groupedData: Record<string, { m0Sum: number, m7Sum: number, m28Sum: number, m100Sum: number, count: number }> = {};
              data.daily.time.forEach((t: string, i: number) => {
                const dateKey = t.substring(0, 7);
                const val0 = data.daily.soil_moisture_0_to_7cm_mean ? data.daily.soil_moisture_0_to_7cm_mean[i] : null;
                const val7 = data.daily.soil_moisture_7_to_28cm_mean ? data.daily.soil_moisture_7_to_28cm_mean[i] : null;
                const val28 = data.daily.soil_moisture_28_to_100cm_mean ? data.daily.soil_moisture_28_to_100cm_mean[i] : null;
                const val100 = data.daily.soil_moisture_0_to_100cm_mean ? data.daily.soil_moisture_0_to_100cm_mean[i] : null;
                
                if (val0 !== null && val7 !== null && val28 !== null && val100 !== null) {
                  if (!groupedData[dateKey]) groupedData[dateKey] = { m0Sum: 0, m7Sum: 0, m28Sum: 0, m100Sum: 0, count: 0 };
                  groupedData[dateKey].m0Sum += val0;
                  groupedData[dateKey].m7Sum += val7;
                  groupedData[dateKey].m28Sum += val28;
                  groupedData[dateKey].m100Sum += val100;
                  groupedData[dateKey].count += 1;
                }
              });
              
              const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
              const labels = Object.keys(groupedData).map(k => {
                const m = parseInt(k.split('-')[1], 10);
                return monthNames[m - 1];
              });
              const moist0to7 = Object.values(groupedData).map(d => Number((d.m0Sum / d.count).toFixed(3)));
              const moist7to28 = Object.values(groupedData).map(d => Number((d.m7Sum / d.count).toFixed(3)));
              const moist28to100 = Object.values(groupedData).map(d => Number((d.m28Sum / d.count).toFixed(3)));
              const moist100to255 = Object.values(groupedData).map(d => Number((d.m100Sum / d.count).toFixed(3)));
              setSoilMoistureChartData({ labels, moist0to7, moist7to28, moist28to100, moist100to255 });
            } else if (!isMonth && data?.hourly) {
              if (is7d) {
                const groupedData: Record<string, { m0Sum: number, m7Sum: number, m28Sum: number, m100Sum: number, count: number }> = {};
                data.hourly.time.forEach((t: string, i: number) => {
                  const dateKey = t.split('T')[0];
                  if (data.hourly.soil_moisture_0_to_7cm[i] !== null) {
                    if (!groupedData[dateKey]) groupedData[dateKey] = { m0Sum: 0, m7Sum: 0, m28Sum: 0, m100Sum: 0, count: 0 };
                    groupedData[dateKey].m0Sum += data.hourly.soil_moisture_0_to_7cm[i];
                    groupedData[dateKey].m7Sum += data.hourly.soil_moisture_7_to_28cm[i];
                    groupedData[dateKey].m28Sum += data.hourly.soil_moisture_28_to_100cm[i];
                    groupedData[dateKey].m100Sum += data.hourly.soil_moisture_100_to_255cm[i];
                    groupedData[dateKey].count += 1;
                  }
                });
                
                const labels = Object.keys(groupedData).map(k => {
                  const parts = k.split('-');
                  return `${parts[2]}/${parts[1]}`;
                });
                const moist0to7 = Object.values(groupedData).map(d => Number((d.m0Sum / d.count).toFixed(3)));
                const moist7to28 = Object.values(groupedData).map(d => Number((d.m7Sum / d.count).toFixed(3)));
                const moist28to100 = Object.values(groupedData).map(d => Number((d.m28Sum / d.count).toFixed(3)));
                const moist100to255 = Object.values(groupedData).map(d => Number((d.m100Sum / d.count).toFixed(3)));
                setSoilMoistureChartData({ labels, moist0to7, moist7to28, moist28to100, moist100to255 });
              } else {
                const now = new Date();
                const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                
                const filteredIndices = data.hourly.time
                  .map((t: string, i: number) => {
                    const date = new Date(t);
                    return (date >= last24h && date <= now) ? i : -1;
                  })
                  .filter((i: number) => i !== -1);
                
                const labels = filteredIndices.map((i: number) => {
                  const date = new Date(data.hourly.time[i]);
                  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                });
                
                const moist0to7 = filteredIndices.map((i: number) => data.hourly.soil_moisture_0_to_7cm[i]);
                const moist7to28 = filteredIndices.map((i: number) => data.hourly.soil_moisture_7_to_28cm[i]);
                const moist28to100 = filteredIndices.map((i: number) => data.hourly.soil_moisture_28_to_100cm[i]);
                const moist100to255 = filteredIndices.map((i: number) => data.hourly.soil_moisture_100_to_255cm[i]);
                
                setSoilMoistureChartData({ labels, moist0to7, moist7to28, moist28to100, moist100to255 });
              }
            }
          }
        } catch (error) {
          console.error('Error fetching soil moisture data:', error);
        } finally {
          setLoadingSoilMoisture(false);
        }
      };
      fetchSoilMoistureData();
    }
  }, [pointData, selectedRange]);

  // Fetch dynamic 24h data when selected
  useEffect(() => {
    if (selectedRange === '24h' && pointData?.codigo) {
      const fetch24hData = async () => {
        setLoading24h(true);
        try {
          const res = await fetch(`https://d14y888g0kj9pj.cloudfront.net/skyagro/procesos_appsmith/generador_json_condiciones_24_estacion.php?estacion=${pointData.codigo}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              const labels = data.map((item: any) => {
                // Formatear fecha dd-mm-yyyy
                let d = item.dia || '';
                if (d.includes('-')) {
                  const parts = d.split('-');
                  if (parts[0].length === 4) { // yyyy-mm-dd
                    d = `${parts[2]}-${parts[1]}-${parts[0]}`;
                  }
                }
                return `${d} ${item.hora || ''}`.trim();
              });
              const temp = data.map((item: any) => parseFloat(item.temperatura || '0'));
              const hum = data.map((item: any) => parseFloat(item.humedad || '0'));
              const windSpeed = data.map((item: any) => parseFloat(item.viento || '0'));
              const gusts = data.map((item: any) => parseFloat(item.rafaga || '0'));

              const maxTemp = data.map((item: any) => parseFloat(item.max_temperatura || '0'));
              const minTemp = data.map((item: any) => parseFloat(item.min_temperatura || '0'));
              const dewPoint = data.map((item: any) => parseFloat(item.punto_rocio || '0'));

              const rainLabels = data.map((item: any) => {
                let d = item.dia || '';
                if (d.includes('-')) {
                  const parts = d.split('-');
                  if (parts[0].length === 4) { // yyyy-mm-dd
                    d = `${parts[2]}/${parts[1]}/${parts[0]}`;
                  } else if (parts.length === 3) {
                    d = `${parts[0]}/${parts[1]}/${parts[2]}`;
                  }
                }
                const h = item.hora ? `${item.hora.toString().padStart(2, '0')}:00` : '00:00';
                return `${d} - ${h}`;
              });
              const rainData = data.map((item: any) => parseFloat(item.lluvia || '0'));

              setDynamic24hData({
                tempHum: { labels, temp, hum, maxTemp, minTemp, dewPoint },
                wind: { 
                  avg: windSpeed.length ? (windSpeed.reduce((a:number,b:number)=>a+b,0)/windSpeed.length).toFixed(1) : "0", 
                  labels, 
                  windSpeed, 
                  gusts 
                },
                rain: {
                  labels: rainLabels,
                  data: rainData
                }
              });
            }
          }
        } catch (error) {
          console.error('Error fetching 24h dynamic data:', error);
        } finally {
          setLoading24h(false);
        }
      };
      fetch24hData();
    }
  }, [selectedRange, pointData]);

  // Fetch dynamic 7d data when selected
  useEffect(() => {
    if (selectedRange === '7d' && pointData?.codigo) {
      const fetch7dData = async () => {
        setLoading7d(true);
        try {
          const today = new Date();
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);

          const formatDate = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          const startDate = formatDate(sevenDaysAgo);
          const endDate = formatDate(today);

          const url = `https://d14y888g0kj9pj.cloudfront.net/skyagro/procesos_appsmith/generador_reportes_json_condiciones_dia_desde_hasta_7_dias.php?estacion=${pointData.codigo}&fecha_desde=${startDate}&fecha_hasta=${endDate}`;
          
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              const labels = data.map((item: any) => {
                let d = item.dia || item.fecha || '';
                if (d.includes('-')) {
                  const parts = d.split('-');
                  if (parts[0].length === 4) { // yyyy-mm-dd
                    d = `${parts[2]}-${parts[1]}-${parts[0]}`;
                  }
                }
                const h = item.hora ? ` ${item.hora}` : '';
                return `${d}${h}`.trim();
              });

              const temp = data.map((item: any) => parseFloat(item.temperatura || '0'));
              const hum = data.map((item: any) => parseFloat(item.humedad || '0'));
              const windSpeed = data.map((item: any) => parseFloat(item.viento || '0'));
              const gusts = data.map((item: any) => parseFloat(item.rafaga || '0'));

              const maxTemp = data.map((item: any) => parseFloat(item.max_temperatura || '0'));
              const minTemp = data.map((item: any) => parseFloat(item.min_temperatura || '0'));
              const dewPoint = data.map((item: any) => parseFloat(item.punto_rocio || '0'));

              const rainLabels = data.map((item: any) => {
                let d = item.dia || item.fecha || '';
                if (d.includes('-')) {
                  const parts = d.split('-');
                  if (parts[0].length === 4) { // yyyy-mm-dd
                    d = `${parts[2]}/${parts[1]}/${parts[0]}`;
                  } else if (parts.length === 3) {
                    d = `${parts[0]}/${parts[1]}/${parts[2]}`;
                  }
                }
                const h = item.hora ? ` - ${item.hora.toString().padStart(2, '0')}:00` : '';
                return `${d}${h}`;
              });
              const rainData = data.map((item: any) => parseFloat(item.lluvia || '0'));

              setDynamic7dData({
                tempHum: { labels, temp, hum, maxTemp, minTemp, dewPoint },
                wind: { 
                  avg: windSpeed.length ? (windSpeed.reduce((a:number,b:number)=>a+b,0)/windSpeed.length).toFixed(1) : "0", 
                  labels, 
                  windSpeed, 
                  gusts 
                },
                rain: {
                  labels: rainLabels,
                  data: rainData
                }
              });
            }
          }
        } catch (error) {
          console.error('Error fetching 7d dynamic data:', error);
        } finally {
          setLoading7d(false);
        }
      };
      fetch7dData();
    }
  }, [selectedRange, pointData]);

  // Fetch dynamic month data when selected
  useEffect(() => {
    if (selectedRange === 'month' && pointData?.codigo) {
      const fetchMonthData = async () => {
        setLoadingMonth(true);
        try {
          const today = new Date();
          const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
          
          const formatDate = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          const fechaDesde = formatDate(firstDayOfYear);
          const fechaHasta = formatDate(today);

          const res = await fetch(`https://d14y888g0kj9pj.cloudfront.net/skyagro/procesos_appsmith/generador_reportes_json_condiciones_dia_desde_hasta_ano_mes.php?estacion=${pointData.codigo}&fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              // Obtenemos los meses en texto
              const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
              const labels = data.map((item: any) => {
                let m = parseInt(item.mes || '0', 10);
                if (m >= 1 && m <= 12) return monthNames[m - 1];
                return item.mes || item.dia || item.fecha || '';
              });
              const temp = data.map((item: any) => parseFloat(item.temperatura || '0'));
              const hum = data.map((item: any) => parseFloat(item.humedad || '0'));
              const windSpeed = data.map((item: any) => parseFloat(item.viento || '0'));
              const gusts = data.map((item: any) => parseFloat(item.rafaga || '0'));

              const maxTemp = data.map((item: any) => parseFloat(item.max_temperatura || '0'));
              const minTemp = data.map((item: any) => parseFloat(item.min_temperatura || '0'));
              const dewPoint = data.map((item: any) => parseFloat(item.punto_rocio || '0'));

              const rainLabels = data.map((item: any) => {
                let m = parseInt(item.mes || '0', 10);
                if (m >= 1 && m <= 12) return monthNames[m - 1];
                return item.mes || item.dia || item.fecha || '';
              });
              const rainData = data.map((item: any) => parseFloat(item.lluvia || '0'));

              setDynamicMonthData({
                tempHum: { labels, temp, hum, maxTemp, minTemp, dewPoint },
                wind: { 
                  avg: windSpeed.length ? (windSpeed.reduce((a:number,b:number)=>a+b,0)/windSpeed.length).toFixed(1) : "0", 
                  labels, 
                  windSpeed, 
                  gusts 
                },
                rain: {
                  labels: rainLabels,
                  data: rainData
                }
              });
            }
          }
        } catch (error) {
          console.error('Error fetching month dynamic data:', error);
        } finally {
          setLoadingMonth(false);
        }
      };
      fetchMonthData();
    }
  }, [selectedRange, pointData]);

  // Dynamic data based on current state
  const currentData = (selectedRange === '24h' && dynamic24hData) 
    ? { ...chartDataSets['24h'], ...dynamic24hData } 
    : (selectedRange === '7d' && dynamic7dData)
      ? { ...chartDataSets['7d'], ...dynamic7dData }
      : (selectedRange === 'month' && dynamicMonthData)
        ? { ...chartDataSets['month'], ...dynamicMonthData }
        : chartDataSets[selectedRange];

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.4, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.4, 1));

  const handleExportExcel = (chartId: string) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (chartId === 'tempHum' && currentData.tempHum) {
      csvContent += "Hora,Temperatura (C),Humedad (%),Max Temp,Min Temp,Punto de Rocio\n";
      currentData.tempHum.labels.forEach((label: string, i: number) => {
        csvContent += `${label},${currentData.tempHum.temp[i]},${currentData.tempHum.hum[i]},${currentData.tempHum.maxTemp[i] || 0},${currentData.tempHum.minTemp[i] || 0},${currentData.tempHum.dewPoint[i] || 0}\n`;
      });
    } else if (chartId === 'wind' && currentData.wind) {
      csvContent += "Hora,Viento (km/h),Rafaga (km/h)\n";
      currentData.wind.labels.forEach((label: string, i: number) => {
        csvContent += `${label},${currentData.wind.windSpeed[i]},${currentData.wind.gusts[i]}\n`;
      });
    } else if (chartId === 'rain' && currentData.rain) {
      csvContent += "Hora,Lluvia (mm)\n";
      currentData.rain.labels.forEach((label: string, i: number) => {
        csvContent += `${label},${currentData.rain.data[i]}\n`;
      });
    } else if (chartId === 'solar' && solarChartData) {
      csvContent += "Hora,Radiacion Solar (W/m2)\n";
      solarChartData.labels.forEach((label: string, i: number) => {
        csvContent += `${label},${solarChartData.data[i]}\n`;
      });
    } else if (chartId === 'evapo' && evapoChartData) {
      csvContent += "Hora,Evapotranspiracion (mm),ET0 (mm)\n";
      evapoChartData.labels.forEach((label: string, i: number) => {
        csvContent += `${label},${evapoChartData.evapo[i]},${evapoChartData.et0[i]}\n`;
      });
    } else if (chartId === 'soilTemp' && soilTempChartData) {
      csvContent += "Hora,Temperatura 0cm (C),Temperatura 6cm (C),Temperatura 18cm (C),Temperatura 54cm (C)\n";
      soilTempChartData.labels.forEach((label: string, i: number) => {
        csvContent += `${label},${soilTempChartData.temp0cm[i]},${soilTempChartData.temp6cm[i]},${soilTempChartData.temp18cm[i]},${soilTempChartData.temp54cm[i]}\n`;
      });
    } else if (chartId === 'soilMoist' && soilMoistureChartData) {
      csvContent += "Hora,Humedad 0-7cm (%),Humedad 7-28cm (%),Humedad 28-100cm (%),Humedad 100-255cm (%)\n";
      soilMoistureChartData.labels.forEach((label: string, i: number) => {
        csvContent += `${label},${soilMoistureChartData.moist0to7[i]},${soilMoistureChartData.moist7to28[i]},${soilMoistureChartData.moist28to100[i]},${soilMoistureChartData.moist100to255[i]}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SkyAgro_${chartId}_${selectedRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareImage = async (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;
    
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const blob = await htmlToImage.toBlob(element, { 
        backgroundColor: '#ffffff', 
        pixelRatio: isMobile ? 1.5 : 2,
        cacheBust: true 
      });
      
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `SkyAgro_${sectionId}.png`;
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
          <div className="mb-6">
            <p className="text-[10px] font-bold tracking-widest text-primary uppercase">Gráficos</p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">{displayTitle}</h1>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight">Última actualización: {lastUpdate}</p>
          </div>

          <div className="bg-white/40 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-white/50 mb-6">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 px-1">Rango de tiempo</p>
            <div className="flex flex-col gap-2">
              {ranges.map((range) => (
                <button 
                  key={range.id}
                  onClick={() => setSelectedRange(range.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    selectedRange === range.id 
                      ? 'bg-primary/5 border-primary text-primary' 
                      : 'bg-white/50 border-transparent text-on-surface-variant hover:bg-white/80'
                  }`}
                >
                  <span className="font-headline font-bold text-sm">{range.label}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedRange === range.id ? 'border-primary' : 'border-stone-300'
                  }`}>
                    {selectedRange === range.id && (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 transition-all duration-300">
            {/* Temperature & Humidity - Highcharts Dual Axes */}
            <section id="section-tempHum" className="bg-white/50 p-4 md:p-6 rounded-[2.5rem] shadow-sm border border-white/50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-headline font-bold text-base md:text-lg text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">thermostat</span>
                    Temperatura &amp; Humedad
                    {(loading24h || loading7d || loadingMonth) && <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>}
                  </h2>
                </div>
              </div>
              
              <div className="h-[340px] md:h-[380px] w-full mb-0 rounded-3xl">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={{
                    chart: {
                      backgroundColor: 'transparent',
                      style: { fontFamily: 'inherit' },
                      height: 350,
                      spacingTop: 10,
                      spacingBottom: 10,
                      spacingLeft: 5,
                      spacingRight: 5
                    },
                    title: { text: undefined },
                    xAxis: {
                      categories: currentData.tempHum.labels,
                      crosshair: true,
                      labels: { style: { color: '#666', fontWeight: 'bold', fontSize: '11px' } },
                      lineWidth: 1,
                      lineColor: '#e6e6e6',
                      tickWidth: 0
                    },
                    yAxis: [{ // Primary yAxis (Temperature)
                      labels: {
                        format: '{value}°C',
                        style: { color: '#5A32A3', fontWeight: 'bold' }
                      },
                      title: { text: null },
                      gridLineColor: 'rgba(0,0,0,0.05)',
                      lineColor: '#5A32A3',
                      lineWidth: 2
                    }, { // Secondary yAxis (Humidity)
                      title: { text: null },
                      labels: {
                        format: '{value}%',
                        style: { color: '#00A3E0', fontWeight: 'bold' }
                      },
                      opposite: true,
                      gridLineWidth: 0,
                      lineColor: '#00A3E0',
                      lineWidth: 2
                    }],
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
                      align: 'center',
                      verticalAlign: 'bottom',
                      itemStyle: { fontWeight: '600', fontSize: '12px', color: '#333' },
                      symbolRadius: 6,
                      symbolHeight: 12,
                      symbolWidth: 12
                    },
                    plotOptions: {
                      column: {
                        borderRadius: 2,
                        pointPadding: 0.2,
                        groupPadding: 0.1
                      },
                      spline: {
                        marker: {
                          enabled: true,
                          radius: 4,
                          symbol: 'circle',
                          lineWidth: 2,
                          lineColor: '#5A32A3',
                          fillColor: 'white'
                        }
                      }
                    },
                    series: [{
                      name: 'Humedad',
                      type: 'column',
                      yAxis: 1,
                      data: currentData.tempHum.hum,
                      color: '#00A3E0',
                      tooltip: { valueSuffix: '%' }
                    }, {
                      name: 'Temperatura',
                      type: 'spline',
                      data: currentData.tempHum.temp,
                      color: '#5A32A3',
                      lineWidth: 3,
                      tooltip: { valueSuffix: '°C' }
                    }, {
                      name: 'Temp. Máxima',
                      type: 'spline',
                      data: currentData.tempHum.maxTemp,
                      color: '#E53935',
                      lineWidth: 2,
                      dashStyle: 'ShortDash',
                      tooltip: { valueSuffix: '°C' },
                      marker: { enabled: false }
                    }, {
                      name: 'Temp. Mínima',
                      type: 'spline',
                      data: currentData.tempHum.minTemp,
                      color: '#1E88E5',
                      lineWidth: 2,
                      dashStyle: 'ShortDash',
                      tooltip: { valueSuffix: '°C' },
                      marker: { enabled: false }
                    }, {
                      name: 'Punto de Rocío',
                      type: 'spline',
                      data: currentData.tempHum.dewPoint,
                      color: '#43A047',
                      lineWidth: 2,
                      tooltip: { valueSuffix: '°C' },
                      marker: { enabled: false }
                    }],
                      responsive: {
                        rules: [{
                          condition: { maxWidth: 500 },
                          chartOptions: {
                            chart: { 
                              height: 320, 
                              spacingTop: 10,
                              spacingBottom: 35,
                              spacingLeft: 5,
                              spacingRight: 5
                            },
                            legend: { 
                              itemStyle: { fontSize: '9px' },
                              symbolPadding: 3,
                              itemDistance: 10
                            },
                            xAxis: {
                              labels: { 
                                style: { fontSize: '8px' },
                                rotation: -45,
                                step: 6,
                                y: 30
                              }
                            },
                            yAxis: [{
                              labels: { style: { fontSize: '8px' }, x: 0 },
                              title: { text: null }
                            }, {
                              labels: { style: { fontSize: '8px' }, x: 0 },
                              title: { text: null }
                            }],
                            plotOptions: {
                              series: {
                                marker: {
                                  enabled: false // Desactivar marcadores en móvil si hay muchos puntos
                                }
                              },
                              column: {
                                pointPadding: 0.1,
                                groupPadding: 0.1
                              }
                            }
                          }
                        }]
                      },
                    credits: { enabled: false }
                  }}
                />
              </div>
              
              <div className="flex justify-center gap-6 mt-2">
                <button onClick={() => handleExportExcel('tempHum')} title="Exportar Excel" className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </button>
                <button onClick={() => handleShareImage('section-tempHum')} title="Descargar como imagen" className="w-12 h-12 flex items-center justify-center bg-tertiary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-2xl">share</span>
                </button>
              </div>
            </section>

            {/* Wind & Gusts */}
            <section id="section-wind" className="bg-white/50 p-4 md:p-6 rounded-[2.5rem] shadow-sm border border-white/50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-headline font-bold text-base md:text-lg text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">air</span>
                    Viento y Ráfaga
                  </h2>
                </div>
              </div>
              
              <div className="h-[340px] md:h-[380px] w-full mb-0 rounded-3xl">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={{
                    chart: {
                      type: 'column',
                      backgroundColor: 'transparent',
                      style: { fontFamily: 'inherit' },
                      height: 350,
                      spacingTop: 10,
                      spacingBottom: 10,
                      spacingLeft: 5,
                      spacingRight: 5
                    },
                    title: { text: undefined },
                    xAxis: {
                      categories: currentData.wind.labels,
                      crosshair: true,
                      labels: { style: { color: '#666', fontWeight: 'bold', fontSize: '11px' } },
                      lineWidth: 1,
                      lineColor: '#e6e6e6',
                      tickWidth: 0
                    },
                    yAxis: {
                      min: 0,
                      title: { text: null },
                      labels: {
                        format: '{value} km/h',
                        style: { color: '#666', fontWeight: 'bold' }
                      },
                      gridLineColor: 'rgba(0,0,0,0.05)',
                      lineWidth: 2,
                      lineColor: '#666'
                    },
                    tooltip: {
                      shared: true,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#eee',
                      shadow: true,
                      style: { fontSize: '12px' },
                      valueSuffix: ' km/h'
                    },
                    legend: {
                      align: 'center',
                      verticalAlign: 'bottom',
                      itemStyle: { fontWeight: '600', fontSize: '12px', color: '#333' }
                    },
                    plotOptions: {
                      column: {
                        borderRadius: 2,
                        pointPadding: 0.2,
                        groupPadding: 0.1
                      }
                    },
                    series: [{
                      name: 'Viento',
                      data: currentData.wind.windSpeed,
                      color: '#00A3E0' // Light blue
                    }, {
                      name: 'Ráfaga',
                      data: currentData.wind.gusts,
                      color: '#A09DCC' // Light purple
                    }],
                    responsive: {
                      rules: [{
                        condition: { maxWidth: 500 },
                        chartOptions: {
                          chart: { 
                            height: 320, 
                            spacingTop: 10,
                            spacingBottom: 35,
                            spacingLeft: 5,
                            spacingRight: 5
                          },
                          legend: { 
                            itemStyle: { fontSize: '9px' },
                            symbolPadding: 3,
                            itemDistance: 10
                          },
                          xAxis: {
                            labels: { 
                              style: { fontSize: '8px' },
                              rotation: -45,
                              step: 6,
                              y: 30
                            }
                          },
                          yAxis: {
                            labels: { style: { fontSize: '8px' }, x: 0 }
                          }
                        }
                      }]
                    },
                    credits: { enabled: false }
                  }}
                />
              </div>
              
              <div className="flex justify-center gap-6 mt-2">
                <button onClick={() => handleExportExcel('wind')} title="Exportar Excel" className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </button>
                <button onClick={() => handleShareImage('section-wind')} title="Descargar como imagen" className="w-12 h-12 flex items-center justify-center bg-tertiary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-2xl">share</span>
                </button>
              </div>
            </section>

            {/* Rainfall */}
            <section id="section-rain" className="bg-white/50 p-4 md:p-6 rounded-[2.5rem] shadow-sm border border-white/50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-headline font-bold text-base md:text-lg text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">rainy</span>
                    Lluvias {currentData.rain?.data ? `(${currentData.rain.data.reduce((a: number, b: number) => a + (Number(b) || 0), 0).toFixed(1)} mm)` : ''}
                  </h2>
                </div>
              </div>
              
              <div className="h-[340px] md:h-[380px] w-full mb-0 rounded-3xl">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={{
                    chart: {
                      type: 'column',
                      backgroundColor: 'transparent',
                      style: { fontFamily: 'inherit' },
                      height: 350,
                      spacingTop: 10,
                      spacingBottom: 10,
                      spacingLeft: 5,
                      spacingRight: 5
                    },
                    title: { text: undefined },
                    xAxis: {
                      categories: currentData.rain.labels,
                      crosshair: true,
                      labels: { style: { color: '#666', fontWeight: 'bold', fontSize: '11px' } },
                      lineWidth: 1,
                      lineColor: '#e6e6e6',
                      tickWidth: 0
                    },
                    yAxis: {
                      min: 0,
                      title: { text: null },
                      labels: {
                        format: '{value} mm',
                        style: { color: '#666', fontWeight: 'bold' }
                      },
                      gridLineColor: 'rgba(0,0,0,0.05)',
                      lineWidth: 2,
                      lineColor: '#666'
                    },
                    tooltip: {
                      shared: true,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#eee',
                      shadow: true,
                      style: { fontSize: '12px' },
                      valueSuffix: ' mm'
                    },
                    legend: {
                      align: 'center',
                      verticalAlign: 'bottom',
                      itemStyle: { fontWeight: '600', fontSize: '12px', color: '#333' }
                    },
                    plotOptions: {
                      column: {
                        borderRadius: 2,
                        pointPadding: 0.2,
                        groupPadding: 0.1
                      }
                    },
                    series: [{
                      name: 'Lluvia',
                      data: currentData.rain.data,
                      color: '#00A3E0' // Light blue
                    }],
                    responsive: {
                      rules: [{
                        condition: { maxWidth: 500 },
                        chartOptions: {
                          chart: { 
                            height: 320, 
                            spacingTop: 10,
                            spacingBottom: 35,
                            spacingLeft: 5,
                            spacingRight: 5
                          },
                          legend: { 
                            itemStyle: { fontSize: '9px' },
                            symbolPadding: 3,
                            itemDistance: 10
                          },
                          xAxis: {
                            labels: { 
                              style: { fontSize: '8px' },
                              rotation: -45,
                              step: 6,
                              y: 30
                            }
                          },
                          yAxis: {
                            labels: { style: { fontSize: '8px' }, x: 0 }
                          }
                        }
                      }]
                    },
                    credits: { enabled: false }
                  }}
                />
              </div>
              
              <div className="flex justify-center gap-6 mt-2">
                <button onClick={() => handleExportExcel('rain')} title="Exportar Excel" className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </button>
                <button onClick={() => handleShareImage('section-rain')} title="Descargar como imagen" className="w-12 h-12 flex items-center justify-center bg-tertiary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-2xl">share</span>
                </button>
              </div>
            </section>

            {/* Radiación Solar */}
            <section id="section-solar" className="bg-white/50 p-4 md:p-6 rounded-[2.5rem] shadow-sm border border-white/50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-headline font-bold text-base md:text-lg text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">wb_sunny</span>
                    Radiación Solar
                    {loadingSolar && <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>}
                  </h2>
                </div>
              </div>
              
              <div className="h-[340px] md:h-[380px] w-full mb-0 rounded-3xl">
                {solarChartData && (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                      chart: {
                        type: 'area',
                        backgroundColor: 'transparent',
                        style: { fontFamily: 'inherit' },
                        height: 350,
                        spacingTop: 10,
                        spacingBottom: 10,
                        spacingLeft: 5,
                        spacingRight: 5
                      },
                      title: { text: undefined },
                      xAxis: {
                        categories: solarChartData.labels,
                        crosshair: true,
                        labels: { style: { color: '#666', fontWeight: 'bold', fontSize: '11px' } },
                        lineWidth: 1,
                        lineColor: '#e6e6e6',
                        tickWidth: 0
                      },
                      yAxis: {
                        min: 0,
                        title: { text: null },
                        labels: {
                          format: '{value} W/m²',
                          style: { color: '#666', fontWeight: 'bold' }
                        },
                        gridLineColor: 'rgba(0,0,0,0.05)',
                        lineWidth: 2,
                        lineColor: '#666'
                      },
                      tooltip: {
                        shared: true,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#eee',
                        shadow: true,
                        style: { fontSize: '12px' },
                        valueSuffix: ' W/m²'
                      },
                      legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        itemStyle: { fontWeight: '600', fontSize: '12px', color: '#333' }
                      },
                      plotOptions: {
                        area: {
                          fillColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                              [0, '#FF6B6B'],
                              [1, 'rgba(255, 107, 107, 0)']
                            ]
                          },
                          marker: {
                            radius: 2,
                            symbol: 'circle',
                            fillColor: '#FFFFFF',
                            lineWidth: 2,
                            lineColor: null
                          },
                          lineWidth: 2,
                          states: { hover: { lineWidth: 3 } },
                          threshold: null
                        }
                      },
                      series: [{
                        type: 'area',
                        name: 'Radiación Solar',
                        data: solarChartData.data,
                        color: '#FF6B6B'
                      }],
                      responsive: {
                        rules: [{
                          condition: { maxWidth: 500 },
                          chartOptions: {
                            chart: { 
                              height: 320, 
                              spacingTop: 10,
                              spacingBottom: 35,
                              spacingLeft: 5,
                              spacingRight: 5
                            },
                            xAxis: {
                              labels: { 
                                style: { fontSize: '8px' },
                                rotation: -45,
                                step: 6,
                                y: 30
                              }
                            },
                            yAxis: {
                              labels: { style: { fontSize: '8px' }, x: 0 }
                            }
                          }
                        }]
                      },
                      credits: { enabled: false }
                    }}
                  />
                )}
              </div>
              
              <div className="flex justify-center gap-6 mt-2">
                <button onClick={() => handleExportExcel('solar')} title="Exportar Excel" className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </button>
                <button onClick={() => handleShareImage('section-solar')} title="Descargar como imagen" className="w-12 h-12 flex items-center justify-center bg-tertiary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-2xl">share</span>
                </button>
              </div>
            </section>

            {/* Evapotranspiracion */}
            <section id="section-evapo" className="bg-white/50 p-4 md:p-6 rounded-[2.5rem] shadow-sm border border-white/50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-headline font-bold text-base md:text-lg text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">water_drop</span>
                    {selectedRange === 'month' ? 'ET0' : 'Evapotranspiración y ET0'}
                    {loadingEvapo && <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>}
                  </h2>
                </div>
              </div>
              
              <div className="h-[340px] md:h-[380px] w-full mb-0 rounded-3xl">
                {evapoChartData && (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                      chart: {
                        type: 'line',
                        backgroundColor: 'transparent',
                        style: { fontFamily: 'inherit' },
                        height: 350,
                        spacingTop: 10,
                        spacingBottom: 10,
                        spacingLeft: 5,
                        spacingRight: 5
                      },
                      title: { text: undefined },
                      xAxis: {
                        categories: evapoChartData.labels,
                        crosshair: true,
                        labels: { style: { color: '#666', fontWeight: 'bold', fontSize: '11px' } },
                        lineWidth: 1,
                        lineColor: '#e6e6e6',
                        tickWidth: 0
                      },
                      yAxis: {
                        min: 0,
                        title: { text: null },
                        labels: {
                          format: '{value} mm',
                          style: { color: '#666', fontWeight: 'bold' }
                        },
                        gridLineColor: 'rgba(0,0,0,0.05)',
                        lineWidth: 2,
                        lineColor: '#666'
                      },
                      tooltip: {
                        shared: true,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#eee',
                        shadow: true,
                        style: { fontSize: '12px' },
                        valueSuffix: ' mm'
                      },
                      legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        itemStyle: { fontWeight: '600', fontSize: '12px', color: '#333' }
                      },
                      plotOptions: {
                        line: {
                          dataLabels: {
                            enabled: true,
                            format: '{y}',
                            style: {
                              fontWeight: 'bold',
                              color: '#333',
                              textOutline: '2px white'
                            }
                          },
                          enableMouseTracking: true,
                          lineWidth: 2,
                          states: { hover: { lineWidth: 3 } }
                        }
                      },
                      series: selectedRange === 'month' 
                        ? [{
                            type: 'line',
                            name: 'ET0',
                            data: evapoChartData.et0,
                            color: '#5A32A3',
                            marker: { symbol: 'diamond' }
                          }]
                        : [{
                            type: 'line',
                            name: 'Evapotranspiración',
                            data: evapoChartData.evapo,
                            color: '#00A3E0',
                            marker: { symbol: 'circle' }
                          }, {
                            type: 'line',
                            name: 'ET0',
                            data: evapoChartData.et0,
                            color: '#5A32A3',
                            marker: { symbol: 'diamond' }
                          }],
                      responsive: {
                        rules: [{
                          condition: { maxWidth: 500 },
                          chartOptions: {
                            chart: { 
                              height: 320, 
                              spacingTop: 10,
                              spacingBottom: 35,
                              spacingLeft: 5,
                              spacingRight: 5
                            },
                            xAxis: {
                              labels: { 
                                style: { fontSize: '8px' },
                                rotation: -45,
                                step: 6,
                                y: 30
                              }
                            },
                            yAxis: {
                              labels: { style: { fontSize: '8px' }, x: 0 }
                            },
                            plotOptions: {
                              line: {
                                dataLabels: {
                                  enabled: false // Deshabilitar labels en movil para no saturar
                                }
                              }
                            }
                          }
                        }]
                      },
                      credits: { enabled: false }
                    }}
                  />
                )}
              </div>
              
              <div className="flex justify-center gap-6 mt-2">
                <button onClick={() => handleExportExcel('evapo')} title="Exportar Excel" className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </button>
                <button onClick={() => handleShareImage('section-evapo')} title="Descargar como imagen" className="w-12 h-12 flex items-center justify-center bg-tertiary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-2xl">share</span>
                </button>
              </div>
            </section>

            {/* Temperatura de Suelo */}
            <section id="section-soilTemp" className="bg-white/50 p-4 md:p-6 rounded-[2.5rem] shadow-sm border border-white/50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-headline font-bold text-base md:text-lg text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">landscape</span>
                    Temperatura de Suelo
                    {loadingSoilTemp && <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>}
                  </h2>
                </div>
              </div>
              
              <div className="h-[340px] md:h-[380px] w-full mb-0 rounded-3xl">
                {soilTempChartData && (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                      chart: {
                        type: 'line',
                        backgroundColor: 'transparent',
                        style: { fontFamily: 'inherit' },
                        height: 350,
                        spacingTop: 10,
                        spacingBottom: 10,
                        spacingLeft: 5,
                        spacingRight: 5
                      },
                      title: { text: undefined },
                      xAxis: {
                        categories: soilTempChartData.labels,
                        crosshair: true,
                        labels: { style: { color: '#666', fontWeight: 'bold', fontSize: '11px' } },
                        lineWidth: 1,
                        lineColor: '#e6e6e6',
                        tickWidth: 0
                      },
                      yAxis: {
                        title: { text: null },
                        labels: {
                          format: '{value} °C',
                          style: { color: '#666', fontWeight: 'bold' }
                        },
                        gridLineColor: 'rgba(0,0,0,0.05)',
                        lineWidth: 2,
                        lineColor: '#666'
                      },
                      tooltip: {
                        shared: true,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#eee',
                        shadow: true,
                        style: { fontSize: '12px' },
                        valueSuffix: ' °C'
                      },
                      legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        itemStyle: { fontWeight: '600', fontSize: '12px', color: '#333' }
                      },
                      plotOptions: {
                        line: {
                          dataLabels: {
                            enabled: true,
                            format: '{y}',
                            style: {
                              fontWeight: 'bold',
                              color: '#333',
                              textOutline: '2px white'
                            }
                          },
                          enableMouseTracking: true,
                          lineWidth: 2,
                          states: { hover: { lineWidth: 3 } }
                        }
                      },
                      series: [{
                        type: 'line',
                        name: selectedRange === 'month' ? '0-100 cm' : '0 cm',
                        data: soilTempChartData.temp0cm,
                        color: '#E53935', // Rojo
                        marker: { symbol: 'circle' }
                      }, {
                        type: 'line',
                        name: selectedRange === 'month' ? '0-7 cm' : '6 cm',
                        data: soilTempChartData.temp6cm,
                        color: '#FB8C00', // Naranja
                        marker: { symbol: 'diamond' }
                      }, {
                        type: 'line',
                        name: selectedRange === 'month' ? '7-28 cm' : '18 cm',
                        data: soilTempChartData.temp18cm,
                        color: '#43A047', // Verde
                        marker: { symbol: 'square' }
                      }, {
                        type: 'line',
                        name: selectedRange === 'month' ? '28-100 cm' : '54 cm',
                        data: soilTempChartData.temp54cm,
                        color: '#1E88E5', // Azul
                        marker: { symbol: 'triangle' }
                      }],
                      responsive: {
                        rules: [{
                          condition: { maxWidth: 500 },
                          chartOptions: {
                            chart: { 
                              height: 320, 
                              spacingTop: 10,
                              spacingBottom: 35,
                              spacingLeft: 5,
                              spacingRight: 5
                            },
                            xAxis: {
                              labels: { 
                                style: { fontSize: '8px' },
                                rotation: -45,
                                step: 6,
                                y: 30
                              }
                            },
                            yAxis: {
                              labels: { style: { fontSize: '8px' }, x: 0 }
                            },
                            plotOptions: {
                              line: {
                                dataLabels: {
                                  enabled: false // Deshabilitar labels en movil para no saturar
                                }
                              }
                            }
                          }
                        }]
                      },
                      credits: { enabled: false }
                    }}
                  />
                )}
              </div>
              
              <div className="flex justify-center gap-6 mt-2">
                <button onClick={() => handleExportExcel('soilTemp')} title="Exportar Excel" className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </button>
                <button onClick={() => handleShareImage('section-soilTemp')} title="Descargar como imagen" className="w-12 h-12 flex items-center justify-center bg-tertiary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-2xl">share</span>
                </button>
              </div>
            </section>

            {/* Humedad de Suelo */}
            <section id="section-soilMoisture" className="bg-white/50 p-4 md:p-6 rounded-[2.5rem] shadow-sm border border-white/50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-headline font-bold text-base md:text-lg text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">water</span>
                    Humedad de Suelo
                    {loadingSoilMoisture && <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>}
                  </h2>
                </div>
              </div>
              
              <div className="h-[340px] md:h-[380px] w-full mb-0 rounded-3xl">
                {soilMoistureChartData && (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                      chart: {
                        type: 'line',
                        backgroundColor: 'transparent',
                        style: { fontFamily: 'inherit' },
                        height: 350,
                        spacingTop: 10,
                        spacingBottom: 10,
                        spacingLeft: 5,
                        spacingRight: 5
                      },
                      title: { text: undefined },
                      xAxis: {
                        categories: soilMoistureChartData.labels,
                        crosshair: true,
                        labels: { style: { color: '#666', fontWeight: 'bold', fontSize: '11px' } },
                        lineWidth: 1,
                        lineColor: '#e6e6e6',
                        tickWidth: 0
                      },
                      yAxis: {
                        title: { text: null },
                        labels: {
                          format: '{value} m³/m³',
                          style: { color: '#666', fontWeight: 'bold' }
                        },
                        gridLineColor: 'rgba(0,0,0,0.05)',
                        lineWidth: 2,
                        lineColor: '#666'
                      },
                      tooltip: {
                        shared: true,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#eee',
                        shadow: true,
                        style: { fontSize: '12px' },
                        valueSuffix: ' m³/m³'
                      },
                      legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        itemStyle: { fontWeight: '600', fontSize: '12px', color: '#333' }
                      },
                      plotOptions: {
                        line: {
                          enableMouseTracking: true,
                          lineWidth: 2,
                          states: { hover: { lineWidth: 3 } }
                        }
                      },
                      series: [{
                        type: 'line',
                        name: '0 - 7 cm',
                        data: soilMoistureChartData.moist0to7,
                        color: '#26C6DA', // Celeste
                        marker: { symbol: 'circle' }
                      }, {
                        type: 'line',
                        name: '7 - 28 cm',
                        data: soilMoistureChartData.moist7to28,
                        color: '#00ACC1', // Cyan
                        marker: { symbol: 'diamond' }
                      }, {
                        type: 'line',
                        name: '28 - 100 cm',
                        data: soilMoistureChartData.moist28to100,
                        color: '#00838F', // Azul oscuro
                        marker: { symbol: 'square' }
                      }, {
                        type: 'line',
                        name: selectedRange === 'month' ? '0 - 100 cm' : '100 - 255 cm',
                        data: soilMoistureChartData.moist100to255,
                        color: '#004D40', // Verde muy oscuro/azulado
                        marker: { symbol: 'triangle' }
                      }],
                      responsive: {
                        rules: [{
                          condition: { maxWidth: 500 },
                          chartOptions: {
                            chart: { 
                              height: 320, 
                              spacingTop: 10,
                              spacingBottom: 35,
                              spacingLeft: 5,
                              spacingRight: 5
                            },
                            xAxis: {
                              labels: { 
                                style: { fontSize: '8px' },
                                rotation: -45,
                                step: 6,
                                y: 30
                              }
                            },
                            yAxis: {
                              labels: { style: { fontSize: '8px' }, x: 0 }
                            }
                          }
                        }]
                      },
                      credits: { enabled: false }
                    }}
                  />
                )}
              </div>
              
              <div className="flex justify-center gap-6 mt-2">
                <button onClick={() => handleExportExcel('soilMoist')} title="Exportar Excel" className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </button>
                <button onClick={() => handleShareImage('section-soilMoisture')} title="Descargar como imagen" className="w-12 h-12 flex items-center justify-center bg-tertiary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-2xl">share</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

    </main>
  );
}
