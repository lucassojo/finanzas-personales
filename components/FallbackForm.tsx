'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Gasto } from '@/lib/types';

interface FallbackFormProps {
  textoInicial: string;
  categorias: { nombre: string; emoji: string }[];
  fecha: string;
  onSuccess: (gasto: Gasto) => void;
  onClose: () => void;
}

export default function FallbackForm({ textoInicial, categorias, fecha, onSuccess, onClose }: FallbackFormProps) {
  const [descripcion, setDescripcion] = useState(textoInicial);
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState(categorias[0]?.nombre ?? '');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descripcion || !monto || !categoria) return;
    setLoading(true);

    try {
      const res = await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: descripcion.slice(0, 40),
          monto: parseFloat(monto),
          categoria,
          metodo_pago: metodoPago,
          fecha,
        }),
      });
      if (res.ok) {
        const { gasto } = await res.json();
        onSuccess(gasto);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[430px] bg-card border border-border rounded-t-3xl p-6 pb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold">Registrar gasto</h2>
            <p className="text-xs text-muted-foreground mt-0.5">La IA no pudo procesar. Completá manualmente.</p>
          </div>
          <button
            id="close-fallback"
            onClick={onClose}
            className="touch-feedback w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Descripción</label>
            <input
              id="fallback-descripcion"
              type="text"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              maxLength={40}
              placeholder="¿Qué gastaste?"
              className="mt-1.5 w-full h-12 px-4 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monto ($)</label>
            <input
              id="fallback-monto"
              type="number"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder="0"
              min="1"
              className="mt-1.5 w-full h-12 px-4 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoría</label>
            <select
              id="fallback-categoria"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="mt-1.5 w-full h-12 px-4 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {categorias.map(c => (
                <option key={c.nombre} value={c.nombre}>{c.emoji} {c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Método de pago</label>
            <select
              id="fallback-metodo"
              value={metodoPago}
              onChange={e => setMetodoPago(e.target.value)}
              className="mt-1.5 w-full h-12 px-4 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="efectivo">💵 Efectivo</option>
              <option value="debito">💳 Débito</option>
              <option value="credito">💳 Crédito</option>
              <option value="transferencia">📲 Transferencia</option>
            </select>
          </div>

          <button
            id="fallback-submit"
            type="submit"
            disabled={loading}
            className="touch-feedback w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar gasto'}
          </button>
        </form>
      </div>
    </div>
  );
}
