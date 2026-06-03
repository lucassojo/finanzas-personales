'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatMonto, getNombreMes } from '@/lib/helpers';
import { Gasto, ResumenCategoria, DatosDia, Categoria } from '@/lib/types';

export default function ResumenClient() {
  const ahora = new Date();
  const [mes, setMes] = useState(ahora.getMonth() + 1);
  const [anio, setAnio] = useState(ahora.getFullYear());
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gastosRes, catRes] = await Promise.all([
        fetch(`/api/gastos?mes=${mes}&anio=${anio}`),
        fetch('/api/categorias'),
      ]);
      const { gastos: g } = await gastosRes.json();
      const { categorias: c } = await catRes.json();
      setGastos(g || []);
      setCategorias(c || []);
    } finally {
      setLoading(false);
    }
  }, [mes, anio]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Mes anterior
  const prevMes = mes === 1 ? 12 : mes - 1;
  const prevAnio = mes === 1 ? anio - 1 : anio;

  const [gastosMesAnterior, setGastosMesAnterior] = useState<Gasto[]>([]);
  useEffect(() => {
    fetch(`/api/gastos?mes=${prevMes}&anio=${prevAnio}`)
      .then(r => r.json())
      .then(({ gastos: g }) => setGastosMesAnterior(g || []));
  }, [prevMes, prevAnio]);

  const totalMes = gastos.reduce((acc, g) => acc + g.monto, 0);
  const totalMesAnterior = gastosMesAnterior.reduce((acc, g) => acc + g.monto, 0);
  const diferencia = totalMes - totalMesAnterior;
  const pct = totalMesAnterior > 0 ? Math.abs((diferencia / totalMesAnterior) * 100).toFixed(0) : null;

  // Desglose por categoría
  const catMap = categorias.reduce((acc, c) => {
    acc[c.nombre] = c.emoji;
    return acc;
  }, {} as Record<string, string>);

  const porCategoria: Record<string, number> = {};
  gastos.forEach(g => {
    porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + g.monto;
  });

  const resumenCats: ResumenCategoria[] = Object.entries(porCategoria)
    .map(([cat, total]) => ({
      categoria: cat,
      emoji: catMap[cat] ?? '📦',
      total,
      porcentaje: totalMes > 0 ? (total / totalMes) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Últimos 7 días
  const ultimos7: DatosDia[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const fecha = d.toISOString().split('T')[0];
    const dia = d.toLocaleDateString('es-AR', { weekday: 'short' });
    const total = gastos
      .filter(g => g.fecha === fecha)
      .reduce((acc, g) => acc + g.monto, 0);
    return { fecha, dia: dia.charAt(0).toUpperCase() + dia.slice(1, 3), total };
  });

  const maxDia = Math.max(...ultimos7.map(d => d.total), 1);

  function navegarMes(dir: -1 | 1) {
    if (dir === -1) {
      if (mes === 1) { setMes(12); setAnio(a => a - 1); }
      else setMes(m => m - 1);
    } else {
      const hoy = new Date();
      if (anio === hoy.getFullYear() && mes === hoy.getMonth() + 1) return;
      if (mes === 12) { setMes(1); setAnio(a => a + 1); }
      else setMes(m => m + 1);
    }
  }

  const esHoy = ahora.getFullYear() === anio && ahora.getMonth() + 1 === mes;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number }[] }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs">
          <p className="font-semibold">{formatMonto(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 pt-10 pb-6 border-b border-border/30">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Resumen 📊</h1>
          {/* Selector de mes — inline en desktop */}
          <div className="glass-card rounded-2xl flex items-center gap-3 px-4 py-2.5">
            <button
              id="prev-mes"
              onClick={() => navegarMes(-1)}
              className="touch-feedback w-8 h-8 rounded-xl bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-center min-w-[110px]">
              <p className="font-semibold text-sm">{getNombreMes(mes)} {anio}</p>
              {esHoy && <p className="text-[10px] text-primary">Mes actual</p>}
            </div>
            <button
              id="next-mes"
              onClick={() => navegarMes(1)}
              disabled={esHoy}
              className="touch-feedback w-8 h-8 rounded-xl bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-all disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile: selector mes */}
      <div className="md:hidden px-5 mb-5">
        <div className="glass-card rounded-2xl flex items-center justify-between px-4 py-3">
          <button id="prev-mes-mobile" onClick={() => navegarMes(-1)} className="touch-feedback w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-all">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="font-semibold text-base">{getNombreMes(mes)} {anio}</p>
            {esHoy && <p className="text-xs text-primary">Mes actual</p>}
          </div>
          <button id="next-mes-mobile" onClick={() => navegarMes(1)} disabled={esHoy} className="touch-feedback w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-all disabled:opacity-30">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Content grid */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

          {/* Left column */}
          <div className="space-y-5">
            {/* Total del mes */}
            <div className="glass-card rounded-2xl p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-2">Total gastado</p>
              {loading ? (
                <div className="h-12 w-44 shimmer rounded-xl" />
              ) : (
                <p className="amount-display text-5xl font-bold gradient-text">
                  {formatMonto(totalMes)}
                </p>
              )}
              {!loading && totalMesAnterior > 0 && (
                <div className={`flex items-center gap-1.5 mt-4 text-sm ${
                  diferencia > 0 ? 'text-red-400' : diferencia < 0 ? 'text-emerald-400' : 'text-muted-foreground'
                }`}>
                  {diferencia > 0 ? <TrendingUp size={16} /> : diferencia < 0 ? <TrendingDown size={16} /> : <Minus size={16} />}
                  <span className="font-medium">
                    {diferencia > 0 ? '+' : ''}{formatMonto(Math.abs(diferencia))}
                  </span>
                  {pct && <span className="text-xs opacity-80">({pct}%)</span>}
                  <span className="text-xs text-muted-foreground">vs {getNombreMes(prevMes)}</span>
                </div>
              )}
            </div>

            {/* Gráfico últimos 7 días */}
            <div className="glass-card rounded-2xl p-6">
              <p className="text-sm font-semibold mb-5">Últimos 7 días</p>
              {loading ? (
                <div className="h-48 shimmer rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={ultimos7} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="dia"
                      tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {ultimos7.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={entry.total === maxDia && entry.total > 0
                            ? 'oklch(0.65 0.22 260)'
                            : entry.total > 0
                            ? 'rgba(100, 80, 255, 0.35)'
                            : 'rgba(255,255,255,0.06)'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Right column — Desglose por categoría */}
          <div className="glass-card rounded-2xl p-6">
            <p className="text-sm font-semibold mb-5">Por categoría</p>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-12 shimmer rounded-xl" />)}
              </div>
            ) : resumenCats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm text-muted-foreground">Sin gastos este mes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resumenCats.map(cat => (
                  <div key={cat.categoria}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{cat.emoji}</span>
                        <span className="text-sm font-medium">{cat.categoria}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold amount-display">{formatMonto(cat.total)}</span>
                        <span className="text-xs text-muted-foreground ml-1.5">{cat.porcentaje.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full progress-gradient rounded-full transition-all duration-700"
                        style={{ width: `${cat.porcentaje}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
