import type { Metadata, Viewport } from 'next';
import { Manrope, Public_Sans } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import PWARegistration from '@/components/PWARegistration';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-public-sans' });

export const viewport: Viewport = {
  themeColor: '#506231',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'SkyAGRO - Monitoreo Agro Climatico',
  description: 'SkyAGRO - Monitoreo Agro Climatico',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SkyAGRO',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PY" className={`${manrope.variable} ${publicSans.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" crossOrigin="anonymous" />
      </head>
      <body className="bg-surface text-on-surface min-h-[100dvh] relative font-body pb-[88px] overflow-x-hidden" suppressHydrationWarning>
        <PWARegistration />
        <Navigation />
        {children}
      </body>
    </html>
  );
}
