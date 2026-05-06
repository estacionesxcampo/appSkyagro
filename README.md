# SkyAgro - Plataforma de Monitoreo Agrícola

SkyAgro es una solución avanzada para el monitoreo y gestión agrícola, diseñada para proporcionar datos en tiempo real y análisis detallados para la toma de decisiones en el campo.

## Características Principales

- **Monitoreo en Tiempo Real**: Visualización de datos de estaciones meteorológicas.
- **Gráficos Analíticos**: Análisis de temperatura, humedad, viento y lluvia.
- **Pronósticos Avanzados**: Integración con Azure Maps para pronósticos de 10 días y alertas de heladas.
- **Informes Históricos**: Generación de reportes detallados y exportación a Excel.
- **PWA (Progressive Web App)**: Instalable en dispositivos móviles para acceso rápido.

## Requisitos

- Node.js (v18 o superior)
- Clave de API de Google Maps (para visualización de mapas)
- Clave de API de Azure Maps (para pronósticos)

## Instalación y Uso Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar variables de entorno:
   Crear un archivo `.env.local` basado en `.env.example` y añadir las claves de API necesarias.
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Despliegue

La plataforma está optimizada para ser desplegada en Vercel o cualquier entorno compatible con Next.js.
