'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatMonto, getNombreMes } from '@/lib/helpers';
import { Gasto, ResumenCategoria, DatosDia, Categoria, Ingreso, Inversion } from '@/lib/types';

export default function ResumenClient() {
  const ahora = new Date();
  const [mes, setMes] = useState(ahora.getMonth() + 1);
  const [anio, setAnio] = useState(ahora.getFullYear());
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [inversiones, setInversiones] = useState<Inversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<string | null>(null);

  // Reset selected day on month change
  useEffect(() => {
    setActiveDay(null);
  }, [mes, anio]);

  const primerDiaMes = new Date(anio, mes - 1, 1).getDay();
  const offset = primerDiaMes === 0 ? 6 : primerDiaMes - 1;
  const diasEnMes = new Date(anio, mes, 0).getDate();

  const gridCells: { key: string; day: number | null; dateStr: string | null }[] = [];
  for (let i = 0; i < offset; i++) {
    gridCells.push({ key: `empty-${i}`, day: null, dateStr: null });
  }
  for (let d = 1; d <= diasEnMes; d++) {
    const dateStr = `${anio}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    gridCells.push({ key: `day-${d}`, day: d, dateStr });
  }

  const formatFechaPretty = (fechaStr: string) => {
    const [y, m, d] = fechaStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const rawStr = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    return rawStr.charAt(0).toUpperCase() + rawStr.slice(1);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gastosRes, catRes, ingresosRes, inversionesRes] = await Promise.all([
        fetch(`/api/gastos?mes=${mes}&anio=${anio}`),
        fetch('/api/categorias'),
        fetch('/api/ingresos'),
        fetch('/api/inversiones'),
      ]);
      const { gastos: g } = await gastosRes.json();
      const { categorias: c } = await catRes.json();
      const { ingresos: ing } = await ingresosRes.json();
      const { inversiones: inv } = await inversionesRes.json();

      setGastos(g || []);
      setCategorias(c || []);
      setIngresos(ing || []);
      setInversiones(inv || []);
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

  // Ingresos e inversiones del mes/año seleccionado
  const totalIngresos = ingresos.filter(i => i.mes === mes && i.anio === anio).reduce((acc, i) => acc + i.monto, 0);
  const totalInversiones = inversiones.filter(i => i.mes === mes && i.anio === anio).reduce((acc, i) => acc + i.monto, 0);
  const totalAhorro = totalIngresos - totalMes - totalInversiones;

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
            {/* Comparativa de Flujo Financiero */}
            <div className="glass-card rounded-2xl p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Flujo Financiero</p>
              
              {loading ? (
                <div className="space-y-3">
                  <div className="h-20 shimmer rounded-xl" />
                  <div className="h-10 shimmer rounded-xl" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Grid de importes */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5">
                      <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Ingresos</p>
                      <p className="amount-display text-xl font-bold text-emerald-300 mt-1">{formatMonto(totalIngresos)}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3.5">
                      <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">Gastos</p>
                      <p className="amount-display text-xl font-bold text-red-300 mt-1">{formatMonto(totalMes)}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-3.5">
                      <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">Inversiones</p>
                      <p className="amount-display text-xl font-bold text-purple-300 mt-1">{formatMonto(totalInversiones)}</p>
                    </div>
                    <div className={`border rounded-2xl p-3.5 ${
                      totalAhorro >= 0 
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' 
                        : 'bg-orange-500/10 border-orange-500/20 text-orange-300'
                    }`}>
                      <p className={`text-[10px] font-semibold uppercase tracking-wider ${
                        totalAhorro >= 0 ? 'text-blue-400' : 'text-orange-400'
                      }`}>Ahorro Remanente</p>
                      <p className="amount-display text-xl font-bold mt-1">{formatMonto(totalAhorro)}</p>
                    </div>
                  </div>

                  {/* Barra de Distribución del Sueldo */}
                  {totalIngresos > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold">Distribución del Ingreso</p>
                      <div className="h-4 bg-secondary rounded-full overflow-hidden flex">
                        {/* Gastos */}
                        <div 
                          className="h-full bg-red-500/70 transition-all duration-500" 
                          style={{ width: `${Math.max(0, (totalMes / totalIngresos) * 100)}%` }}
                          title={`Gastos: ${((totalMes / totalIngresos) * 100).toFixed(0)}%`}
                        />
                        {/* Inversiones */}
                        <div 
                          className="h-full bg-purple-500/70 transition-all duration-500" 
                          style={{ width: `${Math.max(0, (totalInversiones / totalIngresos) * 100)}%` }}
                          title={`Inversiones: ${((totalInversiones / totalIngresos) * 100).toFixed(0)}%`}
                        />
                        {/* Ahorro */}
                        {totalAhorro > 0 && (
                          <div 
                            className="h-full bg-blue-500/70 transition-all duration-500" 
                            style={{ width: `${Math.max(0, (totalAhorro / totalIngresos) * 100)}%` }}
                            title={`Ahorro: ${((totalAhorro / totalIngresos) * 100).toFixed(0)}%`}
                          />
                        )}
                      </div>
                      
                      {/* Leyenda con porcentajes */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 justify-between text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                          <span>Gastos ({((totalMes / totalIngresos) * 100).toFixed(0)}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500/70" />
                          <span>Inversión ({((totalInversiones / totalIngresos) * 100).toFixed(0)}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500/70" />
                          <span>Ahorro ({Math.max(0, ((totalAhorro / totalIngresos) * 100)).toFixed(0)}%)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mensaje de salud financiera */}
                  {totalIngresos > 0 && (
                    <div className="text-xs bg-white/[0.02] border border-border/20 rounded-xl p-3 text-muted-foreground leading-relaxed">
                      {totalAhorro < 0 ? (
                        <p>⚠️ **Atención**: Tus gastos e inversiones superaron tus ingresos por <span className="text-orange-400 font-bold">{formatMonto(Math.abs(totalAhorro))}</span> este mes. Revisa tus gastos fijos.</p>
                      ) : (
                        <p>✅ **¡Buen trabajo!** Ahorraste el <span className="text-blue-400 font-bold">{((totalAhorro / totalIngresos) * 100).toFixed(0)}%</span> e invertiste el <span className="text-purple-400 font-bold">{((totalInversiones / totalIngresos) * 100).toFixed(0)}%</span> de tus ingresos totales de este mes.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

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

          {/* Right column — Desglose por categoría y Calendario de Gastos */}
          <div className="space-y-5">
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

            {/* Calendario del Mes */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-semibold">Calendario de Gastos 📅</p>
                {activeDay && (
                  <button 
                    onClick={() => setActiveDay(null)}
                    className="text-xs text-primary hover:underline transition-all"
                  >
                    Ver mes completo
                  </button>
                )}
              </div>

              {loading ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="h-4 shimmer rounded" />
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div key={i} className="aspect-square shimmer rounded-xl" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Grid del Calendario */}
                  <div>
                    {/* Headers L M M J V S D */}
                    <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                        <span key={i} className="text-[10px] text-muted-foreground/60 font-bold uppercase py-1">
                          {d}
                        </span>
                      ))}
                    </div>

                    {/* Celdas */}
                    <div className="grid grid-cols-7 gap-2">
                      {gridCells.map((cell) => {
                        if (!cell.day || !cell.dateStr) {
                          return <div key={cell.key} className="aspect-square" />;
                        }

                        const dayGastos = gastos.filter(g => g.fecha === cell.dateStr);
                        const tieneGastos = dayGastos.length > 0;
                        const isSelected = activeDay === cell.dateStr;
                        
                        const hoyStr = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
                        const esDiaHoy = cell.dateStr === hoyStr;

                        return (
                          <button
                            key={cell.key}
                            onClick={() => setActiveDay(isSelected ? null : cell.dateStr)}
                            className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-semibold relative transition-all active:scale-95 ${
                              isSelected
                                ? 'bg-primary text-primary-foreground font-bold shadow-md shadow-primary/25 scale-105'
                                : esDiaHoy
                                ? 'bg-primary/10 border border-primary/45 text-primary hover:bg-primary/20'
                                : 'hover:bg-white/[0.04] text-foreground/80'
                            }`}
                          >
                            <span>{cell.day}</span>
                            {tieneGastos && (
                              <span className={`absolute bottom-1.5 w-1 h-1 rounded-full ${
                                isSelected ? 'bg-primary-foreground' : 'bg-primary'
                              }`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detalle del Día Seleccionado */}
                  {activeDay && (
                    <div className="pt-4 border-t border-border/30 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider">
                          Detalle: {formatFechaPretty(activeDay)}
                        </p>
                        <button 
                          onClick={() => setActiveDay(null)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-all"
                        >
                          Cerrar
                        </button>
                      </div>

                      {(() => {
                        const dayGastos = gastos.filter(g => g.fecha === activeDay);
                        if (dayGastos.length === 0) {
                          return (
                            <div className="bg-white/[0.01] border border-border/10 rounded-2xl p-4 text-center">
                              <p className="text-xs text-muted-foreground">Sin gastos registrados este día</p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                            {dayGastos.map((g) => (
                              <div 
                                key={g.id} 
                                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-border/20 hover:bg-white/[0.04] transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center border border-border/10">
                                    {catMap[g.categoria] ?? '📦'}
                                  </span>
                                  <div>
                                    <p className="text-xs font-semibold text-foreground">{g.descripcion}</p>
                                    <p className="text-[10px] text-muted-foreground/80">{g.categoria}</p>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-red-300">
                                  {formatMonto(g.monto)}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
