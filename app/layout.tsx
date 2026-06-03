import type { Metadata, Viewport } from 'next';
import './globals.css';
import { setupDB } from '@/lib/db';
import BottomTabBar from '@/components/BottomTabBar';
import Sidebar from '@/components/Sidebar';
import { Toaster } from '@/components/ui/toaster';

// Initialize DB on startup
setupDB().catch(console.error);

export const metadata: Metadata = {
  title: 'Mis Finanzas — Control de gastos personales',
  description: 'Registrá tus gastos en segundos con lenguaje natural. App de finanzas personales para Argentina.',
  keywords: ['finanzas personales', 'gastos', 'presupuesto', 'argentina', 'pesos'],
  authors: [{ name: 'Mis Finanzas' }],
  robots: 'noindex',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a12',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background overflow-x-hidden">

        {/* ── DESKTOP LAYOUT ── */}
        <div className="hidden md:flex min-h-screen">
          {/* Ambient glow */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, oklch(0.65 0.22 260), transparent 70%)' }}
            />
            <div
              className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full opacity-[0.04]"
              style={{ background: 'radial-gradient(circle, oklch(0.65 0.20 300), transparent 70%)' }}
            />
          </div>

          {/* Sidebar */}
          <Sidebar />

          {/* Main content — full width minus sidebar */}
          <main className="flex-1 min-h-screen overflow-y-auto relative">
            {children}
          </main>
        </div>

        {/* ── MOBILE LAYOUT ── */}
        <div className="md:hidden flex flex-col min-h-screen">
          <main className="flex-1">
            {children}
          </main>
          <BottomTabBar />
        </div>

        <Toaster />
      </body>
    </html>
  );
}
