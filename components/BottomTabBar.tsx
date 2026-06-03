'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, Settings } from 'lucide-react';

const tabs = [
  { href: '/', icon: Home, label: 'Hoy' },
  { href: '/resumen', icon: BarChart2, label: 'Resumen' },
  { href: '/config', icon: Settings, label: 'Config' },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="tab-bar sticky bottom-0 w-full z-40">
      <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              id={`tab-${label.toLowerCase()}`}
              className={`touch-feedback flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'tab-active'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-primary/15' : ''
              }`}>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="transition-all duration-200"
                />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[10px] font-medium transition-all duration-200 ${
                isActive ? 'font-semibold' : ''
              }`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
