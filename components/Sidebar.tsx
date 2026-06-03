'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, Settings, Wallet } from 'lucide-react';

const tabs = [
  { href: '/', icon: Home, label: 'Hoy' },
  { href: '/resumen', icon: BarChart2, label: 'Resumen' },
  { href: '/config', icon: Settings, label: 'Config' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen border-r border-border/40 bg-card/30 backdrop-blur-sm shrink-0">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Wallet size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">Mis Finanzas</p>
            <p className="text-[11px] text-muted-foreground">Control de gastos</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              id={`sidebar-tab-${label.toLowerCase()}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
              }`}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="transition-all duration-200 shrink-0"
              />
              <span className={`text-sm font-medium transition-all duration-200 ${isActive ? 'font-semibold' : ''}`}>
                {label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-border/30">
        <p className="text-[10px] text-muted-foreground/50">v1.0 · Finanzas AR</p>
      </div>
    </aside>
  );
}
