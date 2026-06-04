'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Sparkles, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import GastoCard from '@/components/GastoCard';
import FallbackForm from '@/components/FallbackForm';
import { Gasto, Categoria } from '@/lib/types';
import { formatMonto, getFechaHoy, getNombreMes } from '@/lib/helpers';

interface HoyClientProps {
  gastosIniciales: Gasto[];
  categorias: Categoria[];
  totalHoy: number;
}

export default function HoyClient({ gastosIniciales, categorias, totalHoy }: HoyClientProps) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(getFechaHoy());
  const [gastos, setGastos] = useState<Gasto[]>(gastosIniciales);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGastos, setLoadingGastos] = useState(false);
  const [total, setTotal] = useState(totalHoy);
  const [showFallback, setShowFallback] = useState(false);
  const [newGastoId, setNewGastoId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Cargar gastos por fecha seleccionada
  useEffect(() => {
    let active = true;
    async function loadGastosFecha() {
      setLoadingGastos(true);
      try {
        const res = await fetch(`/api/gastos?fecha=${fechaSeleccionada}`);
        const data = await res.json();
        if (active) {
          setGastos(data.gastos || []);
          setTotal(data.gastos?.reduce((acc: number, g: Gasto) => acc + g.monto, 0) || 0);
        }
      } catch (err) {
        console.error('Error al cargar gastos:', err);
      } finally {
        if (active) setLoadingGastos(false);
      }
    }
    loadGastosFecha();
    return () => { active = false; };
  }, [fechaSeleccionada]);

  const [year, month, day] = fechaSeleccionada.split('-').map(Number);
  const totalDays = new Date(year, month, 0).getDate();

  function navegarMes(dir: -1 | 1) {
    const newDate = new Date(year, month - 1 + dir, 1);
    const newY = newDate.getFullYear();
    const newM = String(newDate.getMonth() + 1).padStart(2, '0');
    const maxDays = new Date(newY, newDate.getMonth() + 1, 0).getDate();
    const targetDay = Math.min(day, maxDays);
    const newD = String(targetDay).padStart(2, '0');
    setFechaSeleccionada(`${newY}-${newM}-${newD}`);
  }

  const getWeekday = (d: number) => {
    const date = new Date(year, month - 1, d);
    const letters = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    return letters[date.getDay()];
  };

  function formatFechaPretty(fechaStr: string): string {
    const [y, m, d] = fechaStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const hoyStr = getFechaHoy();
    
    if (fechaStr === hoyStr) return 'Hoy 👋';
    
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const ayerStr = ayer.toISOString().split('T')[0];
    if (fechaStr === ayerStr) return 'Ayer 📅';

    const rawStr = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    return rawStr.charAt(0).toUpperCase() + rawStr.slice(1);
  }

  async function handleEnviar() {
    if (!texto.trim() || loading) return;
    setLoading(true);
    const textoEnviado = texto.trim();
    setTexto('');

    try {
      const res = await fetch('/api/clasificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: textoEnviado, fecha: fechaSeleccionada }),
      });

      if (!res.ok) {
        setShowFallback(true);
        setTexto(textoEnviado);
        return;
      }

      const { gasto } = await res.json();
      if (gasto) {
        setGastos(prev => [gasto, ...prev]);
        setTotal(prev => prev + gasto.monto);
        setNewGastoId(gasto.id);
        setTimeout(() => setNewGastoId(null), 1000);
        // Scroll to top to see new gasto
        listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setShowFallback(true);
      setTexto(textoEnviado);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleEnviar();
  }

  function handleDelete(id: number) {
    const gasto = gastos.find(g => g.id === id);
    if (gasto) setTotal(prev => prev - gasto.monto);
    setGastos(prev => prev.filter(g => g.id !== id));
  }

  function handleUpdate(updatedGasto: Gasto) {
    setGastos(prev => prev.map(g => g.id === updatedGasto.id ? updatedGasto : g));
  }

  function handleFallbackSuccess(gasto: Gasto) {
    setGastos(prev => [gasto, ...prev]);
    setTotal(prev => prev + gasto.monto);
    setNewGastoId(gasto.id);
    setShowFallback(false);
    setTimeout(() => setNewGastoId(null), 1000);
  }

  const catList = categorias.map(c => ({ nombre: c.nombre, emoji: c.emoji }));

  const placeholders = [
    'Ej: "almuerzo 3500 con tarjeta"',
    'Ej: "uber 2800"',
    'Ej: "super 12000 débito"',
    'Ej: "café y medialunas 1500"',
    'Ej: "entrada cine + pochoclo 8500"',
  ];
  const [placeholderIdx] = useState(() => Math.floor(Math.random() * placeholders.length));

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header con Navegación de Calendario */}
      <header className="px-6 pt-8 pb-4 border-b border-border/30 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {formatFechaPretty(fechaSeleccionada)}
            </h1>
            
            {/* Selector de Mes */}
            <div className="flex items-center gap-2.5 mt-1.5">
              <button
                id="hoy-prev-mes"
                type="button"
                onClick={() => navegarMes(-1)}
                className="touch-feedback w-7 h-7 rounded-lg bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[90px] text-center">
                {getNombreMes(month)} {year}
              </span>
              <button
                id="hoy-next-mes"
                type="button"
                onClick={() => navegarMes(1)}
                className="touch-feedback w-7 h-7 rounded-lg bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-all"
              >
                <ChevronRight size={14} />
              </button>
              
              {/* Botón calendario */}
              <button
                id="hoy-calendar-picker"
                type="button"
                onClick={() => dateInputRef.current?.showPicker()}
                className="touch-feedback w-7 h-7 rounded-lg bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-all text-primary"
              >
                <Calendar size={14} />
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={fechaSeleccionada}
                onChange={e => e.target.value && setFechaSeleccionada(e.target.value)}
                className="absolute w-0 h-0 opacity-0 pointer-events-none"
              />
            </div>
          </div>
          
          {/* Total hoy */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-1">Total día</p>
            <p className="amount-display text-3xl font-bold gradient-text">
              {formatMonto(total)}
            </p>
          </div>
        </div>

        {/* Barra horizontal de días */}
        <div className="flex gap-2 overflow-x-auto py-1.5 px-0.5 scrollbar-none mask-image-edge">
          {Array.from({ length: totalDays }, (_, i) => {
            const d = i + 1;
            const isSelected = d === day;
            const wday = getWeekday(d);
            const isWeekend = wday === 'S' || wday === 'D';
            
            return (
              <button
                key={d}
                id={`day-nav-${d}`}
                type="button"
                onClick={() => {
                  const targetFecha = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  setFechaSeleccionada(targetFecha);
                }}
                className={`flex-shrink-0 w-11 h-14 rounded-xl flex flex-col items-center justify-center transition-all touch-feedback ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 scale-105'
                    : 'bg-secondary/40 border border-border/20 text-muted-foreground hover:bg-secondary/70'
                }`}
              >
                <span className={`text-[10px] ${
                  isSelected ? 'text-primary-foreground/80' : isWeekend ? 'text-red-400/80' : 'text-muted-foreground/60'
                }`}>
                  {wday}
                </span>
                <span className="text-sm font-semibold mt-1">
                  {d}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Feed de gastos */}
      <div ref={listRef} className="flex-1 px-6 py-5 overflow-y-auto">
        {loadingGastos ? (
          <div className="space-y-3 max-w-2xl">
            {[1, 2, 3].map(i => <div key={i} className="h-16 shimmer rounded-xl" />)}
          </div>
        ) : gastos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-5">💸</div>
            <p className="text-lg font-semibold text-foreground">Sin gastos registrados</p>
            <p className="text-sm text-muted-foreground mt-2">
              Ingresá tu gasto en la barra de abajo para esta fecha
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-w-2xl">
            {gastos.map(gasto => (
              <GastoCard
                key={gasto.id}
                gasto={gasto}
                categorias={catList}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                isNew={gasto.id === newGastoId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fallback form */}
      {showFallback && (
        <FallbackForm
          textoInicial={texto}
          categorias={catList}
          fecha={fechaSeleccionada}
          onSuccess={handleFallbackSuccess}
          onClose={() => setShowFallback(false)}
        />
      )}

      {/* Input bar */}
      <div className="input-bar w-full px-6 py-4 border-t border-border/30">
        <div className="flex items-center gap-3 max-w-2xl">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70">
              <Sparkles size={17} />
            </div>
            <input
              ref={inputRef}
              id="gasto-input"
              type="text"
              value={texto}
              onChange={e => setTexto(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholders[placeholderIdx]}
              disabled={loading}
              autoComplete="off"
              className="w-full h-13 pl-11 pr-4 py-3.5 rounded-2xl bg-secondary/80 border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all disabled:opacity-50 [color-scheme:dark]"
            />
          </div>
          <button
            id="send-gasto-btn"
            onClick={handleEnviar}
            disabled={!texto.trim() || loading}
            className="touch-feedback h-12 px-5 rounded-2xl bg-primary flex items-center justify-center gap-2 text-primary-foreground text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 shadow-lg shadow-primary/25 flex-shrink-0"
          >
            {loading ? (
              <div className="flex gap-0.5">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-current" />
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-current" />
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-current" />
              </div>
            ) : (
              <>
                <Send size={16} strokeWidth={2.5} />
                <span className="hidden md:inline">Registrar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
