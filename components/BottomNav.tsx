'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const isLote = pathname.startsWith('/lote/');
  const loteId = isLote ? pathname.split('/')[2] : null;

  const navItems = [
    { name: 'Mapa', href: '/', icon: 'map', disabled: false },
    { name: 'Gráficos', href: isLote ? `/lote/${loteId}/graficos` : '#', icon: 'bar_chart', disabled: !isLote },
    { name: 'Informes', href: isLote ? `/lote/${loteId}/informes` : '#', icon: 'description', disabled: !isLote },
    { name: 'Pronóstico', href: isLote ? `/lote/${loteId}/pronostico` : '#', icon: 'wb_sunny', disabled: !isLote },
  ];

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 w-full z-[100] bg-[#F7F7F6]/95 backdrop-blur-md flex justify-around items-end px-2 pb-4 pt-2 border-t border-stone-200 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.name !== 'Mapa' && pathname.includes(`/${item.name.toLowerCase()}`));
        // We use exact match for Mapa, or partial match otherwise to handle nested routes. However, exact href match is better for nested graficos:
        const isActiveLink = pathname === item.href;
        
        return (
          <Link 
            key={item.name} 
            href={item.disabled ? '#' : item.href} 
            className={`flex flex-col items-center justify-center group transition-all duration-300 w-16 ${item.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none grayscale' : ''}`}
          >
            <div className={`transition-all duration-300 flex items-center justify-center ${isActiveLink ? 'bg-[#647B4E] px-4 py-1 rounded-[1rem] shadow-md shadow-[#647B4E]/30 scale-105 mb-1' : 'p-1 mb-1 group-active:scale-90 hover:bg-stone-200/50 rounded-[1rem]'}`}>
              <span className={`material-symbols-outlined text-[20px] transition-colors ${isActiveLink ? 'text-white' : 'text-stone-500 group-hover:text-[#647B4E]'}`} style={isActiveLink ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
            </div>
            <span className={`font-headline text-[8.5px] tracking-[0.1em] uppercase ${isActiveLink ? 'font-black text-[#647B4E]' : 'font-extrabold text-stone-500'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
