'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Sparkles } from 'lucide-react';
import GastoCard from '@/components/GastoCard';
import FallbackForm from '@/components/FallbackForm';
import { Gasto, Categoria } from '@/lib/types';
import { formatMonto } from '@/lib/helpers';

interface HoyClientProps {
  gastosIniciales: Gasto[];
  categorias: Categoria[];
  totalHoy: number;
}

export default function HoyClient({ gastosIniciales, categorias, totalHoy }: HoyClientProps) {
  const [gastos, setGastos] = useState<Gasto[]>(gastosIniciales);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(totalHoy);
  const [showFallback, setShowFallback] = useState(false);
  const [newGastoId, setNewGastoId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);


  async function handleEnviar() {
    if (!texto.trim() || loading) return;
    setLoading(true);
    const textoEnviado = texto.trim();
    setTexto('');

    try {
      const res = await fetch('/api/clasificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: textoEnviado }),
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
      {/* Header */}
      <header className="px-6 pt-10 pb-6 md:pt-10 md:pb-6 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Hoy 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1 capitalize">
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          {/* Total hoy */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-1">Total hoy</p>
            <p className="amount-display text-3xl font-bold gradient-text">
              {formatMonto(total)}
            </p>
          </div>
        </div>
      </header>

      {/* Feed de gastos */}
      <div ref={listRef} className="flex-1 px-6 py-5 overflow-y-auto">
        {gastos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-5">💸</div>
            <p className="text-lg font-semibold text-foreground">Sin gastos hoy</p>
            <p className="text-sm text-muted-foreground mt-2">
              Escribí tu primer gasto en la barra de abajo
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
