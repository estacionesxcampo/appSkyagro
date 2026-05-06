'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import BottomNav from './BottomNav';

export default function Navigation() {
  const pathname = usePathname();
  
  // No mostrar el menú superior ni inferior en las páginas de login y registro
  const isAuthPage = pathname === '/login' || pathname === '/registro';

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      <Header />
      <BottomNav />
    </>
  );
}
