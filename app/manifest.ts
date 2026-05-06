import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SkyAGRO - Monitoreo Agro Climatico',
    short_name: 'SkyAGRO',
    description: 'Sistema de Monitoreo Agro Climático SkyAGRO',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf9f4',
    theme_color: '#506231',
    icons: [
      {
        src: '/icono200.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icono200.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icono512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icono512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
