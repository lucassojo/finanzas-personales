'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Categoria, Ingreso } from '@/lib/types';
import { formatMonto, getNombreMes } from '@/lib/helpers';

const EMOJIS = ['🛒', '🍕', '🎉', '🎮', '📦', '🚗', '🏥', '✈️', '👗', '📱', '🏠', '💡', '📚', '🐾', '💪', '🎵', '☕', '🍺', '🎬', '💊'];

export default function ConfigClient() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingIngs, setLoadingIngs] = useState(true);

  // Estado para editar categoría
  const [editSheet, setEditSheet] = useState<Categoria | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Estado para nueva categoría
  const [nuevaSheet, setNuevaSheet] = useState(false);
  const [nuevaNombre, setNuevaNombre] = useState('');
  const [nuevaEmoji, setNuevaEmoji] = useState('📦');

  // Estado para delete
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Estado ingreso
  const [ingresoPanelOpen, setIngresoPanelOpen] = useState(false);
  const [ingresoMes, setIngresoMes] = useState(String(new Date().getMonth() + 1));
  const [ingresoAnio, setIngresoAnio] = useState(String(new Date().getFullYear()));
  const [ingresoMonto, setIngresoMonto] = useState('');
  const [ingresoDesc, setIngresoDesc] = useState('Sueldo');
  const [ingresoLoading, setIngresoLoading] = useState(false);

  useEffect(() => { fetchCategorias(); fetchIngresos(); }, []);

  async function fetchCategorias() {
    setLoadingCats(true);
    try {
      const res = await fetch('/api/categorias');
      const { categorias: c } = await res.json();
      setCategorias(c || []);
    } finally {
      setLoadingCats(false);
    }
  }

  async function fetchIngresos() {
    setLoadingIngs(true);
    try {
      const res = await fetch('/api/ingresos');
      const { ingresos: i } = await res.json();
      setIngresos(i || []);
    } finally {
      setLoadingIngs(false);
    }
  }

  function abrirEditar(cat: Categoria) {
    setEditNombre(cat.nombre);
    setEditEmoji(cat.emoji);
    setEditSheet(cat);
    setDeleteConfirm(null);
  }

  async function handleGuardarEdicion() {
    if (!editSheet || !editNombre.trim()) return;
    setEditLoading(true);
    try {
      await fetch(`/api/categorias/${editSheet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: editNombre, emoji: editEmoji }),
      });
      await fetchCategorias();
      setEditSheet(null);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleEliminarCategoria(id: number) {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }
    await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
    await fetchCategorias();
    setDeleteConfirm(null);
    setEditSheet(null);
  }

  async function handleNuevaCategoria() {
    if (!nuevaNombre.trim()) return;
    setEditLoading(true);
    try {
      await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevaNombre, emoji: nuevaEmoji }),
      });
      await fetchCategorias();
      setNuevaSheet(false);
      setNuevaNombre('');
      setNuevaEmoji('📦');
    } finally {
      setEditLoading(false);
    }
  }

  async function handleRegistrarIngreso(e: React.FormEvent) {
    e.preventDefault();
    if (!ingresoMonto) return;
    setIngresoLoading(true);
    try {
      await fetch('/api/ingresos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mes: Number(ingresoMes),
          anio: Number(ingresoAnio),
          descripcion: ingresoDesc || 'Sueldo',
          monto: Number(ingresoMonto),
        }),
      });
      await fetchIngresos();
      setIngresoMonto('');
    } finally {
      setIngresoLoading(false);
    }
  }

  async function handleEliminarIngreso(id: number) {
    await fetch(`/api/ingresos?id=${id}`, { method: 'DELETE' });
    await fetchIngresos();
  }

  const meses = [1,2,3,4,5,6,7,8,9,10,11,12];
  const anios = [2024, 2025, 2026];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 pt-10 pb-6 border-b border-border/30">
        <h1 className="text-3xl font-bold">Configuración ⚙️</h1>
      </header>

      <div className="px-6 py-5 space-y-4 max-w-2xl">
        {/* Sección Sueldo */}
        <section className="glass-card rounded-2xl overflow-hidden">
          <button
            id="toggle-sueldo"
            onClick={() => setIngresoPanelOpen(p => !p)}
            className="touch-feedback w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Sueldo mensual</p>
                <p className="text-xs text-muted-foreground">Registrá tus ingresos</p>
              </div>
            </div>
            <ChevronDown
              size={18}
              className={`text-muted-foreground transition-transform duration-200 ${ingresoPanelOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {ingresoPanelOpen && (
            <div className="border-t border-border/50 px-5 pb-5 pt-4 space-y-4">
              {/* Form nuevo ingreso */}
              <form onSubmit={handleRegistrarIngreso} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Mes</label>
                    <select
                      id="ingreso-mes"
                      value={ingresoMes}
                      onChange={e => setIngresoMes(e.target.value)}
                      className="mt-1 w-full h-10 px-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {meses.map(m => (
                        <option key={m} value={m}>{getNombreMes(m)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Año</label>
                    <select
                      id="ingreso-anio"
                      value={ingresoAnio}
                      onChange={e => setIngresoAnio(e.target.value)}
                      className="mt-1 w-full h-10 px-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {anios.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Descripción</label>
                  <input
                    id="ingreso-desc"
                    type="text"
                    value={ingresoDesc}
                    onChange={e => setIngresoDesc(e.target.value)}
                    placeholder="Sueldo"
                    className="mt-1 w-full h-10 px-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Monto (ARS)</label>
                  <input
                    id="ingreso-monto"
                    type="number"
                    value={ingresoMonto}
                    onChange={e => setIngresoMonto(e.target.value)}
                    placeholder="650000"
                    min="1"
                    className="mt-1 w-full h-10 px-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>
                <button
                  id="guardar-ingreso"
                  type="submit"
                  disabled={ingresoLoading}
                  className="touch-feedback w-full h-11 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {ingresoLoading ? 'Guardando...' : '+ Registrar ingreso'}
                </button>
              </form>

              {/* Lista de ingresos */}
              {!loadingIngs && ingresos.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Historial</p>
                  {ingresos.map(ing => (
                    <div
                      key={ing.id}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/60"
                    >
                      <div>
                        <p className="text-sm font-medium">{ing.descripcion}</p>
                        <p className="text-xs text-muted-foreground">{getNombreMes(ing.mes)} {ing.anio}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="amount-display text-sm font-bold text-emerald-400">
                          {formatMonto(ing.monto)}
                        </span>
                        <button
                          id={`delete-ingreso-${ing.id}`}
                          onClick={() => handleEliminarIngreso(ing.id)}
                          className="touch-feedback w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Sección Categorías */}
        <section className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <span className="text-lg">🏷️</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Categorías</p>
                <p className="text-xs text-muted-foreground">{categorias.length} activas</p>
              </div>
            </div>
            <button
              id="nueva-categoria-btn"
              onClick={() => setNuevaSheet(true)}
              className="touch-feedback flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-all"
            >
              <Plus size={14} />
              Nueva
            </button>
          </div>

          <div className="divide-y divide-border/30">
            {loadingCats ? (
              <div className="p-5 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-12 shimmer rounded-xl" />)}
              </div>
            ) : (
              categorias.map(cat => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-xl w-8 text-center">{cat.emoji}</span>
                  <span className="flex-1 text-sm font-medium">{cat.nombre}</span>
                  <button
                    id={`edit-cat-${cat.id}`}
                    onClick={() => abrirEditar(cat)}
                    className="touch-feedback w-8 h-8 rounded-xl bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-all"
                  >
                    <Edit2 size={14} className="text-muted-foreground" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Sheet editar categoría */}
      <Sheet open={!!editSheet} onOpenChange={open => !open && setEditSheet(null)}>
        <SheetContent side="bottom" showCloseButton={false} className="bg-card border-border rounded-t-3xl px-0 pb-8 max-h-[90vh] overflow-y-auto">
          <SheetHeader className="px-6 pb-4 border-b border-border/50">
            <SheetTitle>Editar categoría</SheetTitle>
          </SheetHeader>
          <div className="px-6 pt-5 space-y-4">
            {/* Selector emoji */}
            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Emoji</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    id={`emoji-${e}`}
                    onClick={() => setEditEmoji(e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      editEmoji === e ? 'bg-primary/30 ring-2 ring-primary' : 'bg-secondary/60'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Nombre</label>
              <input
                id="edit-cat-nombre"
                type="text"
                value={editNombre}
                onChange={e => setEditNombre(e.target.value)}
                className="mt-1.5 w-full h-12 px-4 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <button
              id="guardar-edicion-cat"
              onClick={handleGuardarEdicion}
              disabled={editLoading}
              className="touch-feedback w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {editLoading ? 'Guardando...' : 'Guardar cambios'}
            </button>

            {editSheet && (
              <button
                id="eliminar-cat-btn"
                onClick={() => handleEliminarCategoria(editSheet.id)}
                className={`touch-feedback w-full h-11 rounded-2xl text-sm font-semibold transition-all ${
                  deleteConfirm === editSheet.id
                    ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                    : 'bg-secondary text-muted-foreground hover:bg-red-500/15 hover:text-red-400'
                }`}
              >
                {deleteConfirm === editSheet.id ? '¿Confirmar? Tocá de nuevo' : 'Eliminar categoría'}
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet nueva categoría */}
      <Sheet open={nuevaSheet} onOpenChange={setNuevaSheet}>
        <SheetContent side="bottom" showCloseButton={false} className="bg-card border-border rounded-t-3xl px-0 pb-8">
          <SheetHeader className="px-6 pb-4 border-b border-border/50">
            <SheetTitle>Nueva categoría</SheetTitle>
          </SheetHeader>
          <div className="px-6 pt-5 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Emoji</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    id={`new-emoji-${e}`}
                    onClick={() => setNuevaEmoji(e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      nuevaEmoji === e ? 'bg-primary/30 ring-2 ring-primary' : 'bg-secondary/60'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Nombre</label>
              <input
                id="nueva-cat-nombre"
                type="text"
                value={nuevaNombre}
                onChange={e => setNuevaNombre(e.target.value)}
                placeholder="Ej: Transporte"
                className="mt-1.5 w-full h-12 px-4 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <button
              id="crear-categoria"
              onClick={handleNuevaCategoria}
              disabled={editLoading || !nuevaNombre.trim()}
              className="touch-feedback w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {editLoading ? 'Creando...' : 'Crear categoría'}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
