'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Categoria, Ingreso, Inversion } from '@/lib/types';
import { formatMonto, getNombreMes } from '@/lib/helpers';
import EmojiPicker from '@/components/ui/EmojiPicker';

export default function ConfigClient() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [inversiones, setInversiones] = useState<Inversion[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingIngs, setLoadingIngs] = useState(true);
  const [loadingInvs, setLoadingInvs] = useState(true);

  // Estado para editar categoría
  const [editSheet, setEditSheet] = useState<Categoria | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const editNombreRef = useRef<HTMLInputElement>(null);

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

  // Estado inversiones
  const [inversionPanelOpen, setInversionPanelOpen] = useState(false);
  const [inversionMes, setInversionMes] = useState(String(new Date().getMonth() + 1));
  const [inversionAnio, setInversionAnio] = useState(String(new Date().getFullYear()));
  const [inversionMonto, setInversionMonto] = useState('');
  const [inversionDesc, setInversionDesc] = useState('Inversión');
  const [inversionLoading, setInversionLoading] = useState(false);

  useEffect(() => { fetchCategorias(); fetchIngresos(); fetchInversiones(); }, []);

  async function fetchCategorias() {
    setLoadingCats(true);
    try {
      const res = await fetch(`/api/categorias?t=${Date.now()}`);
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
    // Read directly from the ref to avoid stale closure issues with Sheet portals
    const nombreFinal = editNombreRef.current?.value?.trim() ?? editNombre.trim();
    if (!editSheet || !nombreFinal) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/categorias/${editSheet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreFinal, emoji: editEmoji }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Error al guardar');
        return;
      }
      await fetchCategorias();
      router.refresh();
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
    router.refresh();
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
      router.refresh();
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
      router.refresh();
      setIngresoMonto('');
    } finally {
      setIngresoLoading(false);
    }
  }

  async function handleEliminarIngreso(id: number) {
    await fetch(`/api/ingresos?id=${id}`, { method: 'DELETE' });
    await fetchIngresos();
    router.refresh();
  }

  async function fetchInversiones() {
    setLoadingInvs(true);
    try {
      const res = await fetch('/api/inversiones');
      const { inversiones: i } = await res.json();
      setInversiones(i || []);
    } finally {
      setLoadingInvs(false);
    }
  }

  async function handleRegistrarInversion(e: React.FormEvent) {
    e.preventDefault();
    if (!inversionMonto) return;
    setInversionLoading(true);
    try {
      await fetch('/api/inversiones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mes: Number(inversionMes),
          anio: Number(inversionAnio),
          descripcion: inversionDesc || 'Inversión',
          monto: Number(inversionMonto),
        }),
      });
      await fetchInversiones();
      router.refresh();
      setInversionMonto('');
    } finally {
      setInversionLoading(false);
    }
  }

  async function handleEliminarInversion(id: number) {
    await fetch(`/api/inversiones?id=${id}`, { method: 'DELETE' });
    await fetchInversiones();
    router.refresh();
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

        {/* Sección Inversiones */}
        <section className="glass-card rounded-2xl overflow-hidden">
          <button
            id="toggle-inversiones"
            type="button"
            onClick={() => setInversionPanelOpen(p => !p)}
            className="touch-feedback w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Inversiones</p>
                <p className="text-xs text-muted-foreground">Registrá tus inversiones mensuales</p>
              </div>
            </div>
            <ChevronDown
              size={18}
              className={`text-muted-foreground transition-transform duration-200 ${inversionPanelOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {inversionPanelOpen && (
            <div className="border-t border-border/50 px-5 pb-5 pt-4 space-y-4">
              {/* Form nuevo inversión */}
              <form onSubmit={handleRegistrarInversion} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Mes</label>
                    <select
                      id="inversion-mes"
                      value={inversionMes}
                      onChange={e => setInversionMes(e.target.value)}
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
                      id="inversion-anio"
                      value={inversionAnio}
                      onChange={e => setInversionAnio(e.target.value)}
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
                    id="inversion-desc"
                    type="text"
                    value={inversionDesc}
                    onChange={e => setInversionDesc(e.target.value)}
                    placeholder="Ej: Plazo Fijo, Cedears"
                    className="mt-1 w-full h-10 px-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Monto (ARS)</label>
                  <input
                    id="inversion-monto"
                    type="number"
                    value={inversionMonto}
                    onChange={e => setInversionMonto(e.target.value)}
                    placeholder="100000"
                    min="1"
                    className="mt-1 w-full h-10 px-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>
                <button
                  id="guardar-inversion"
                  type="submit"
                  disabled={inversionLoading}
                  className="touch-feedback w-full h-11 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-all disabled:opacity-50"
                >
                  {inversionLoading ? 'Guardando...' : '+ Registrar inversión'}
                </button>
              </form>

              {/* Lista de inversiones */}
              {!loadingInvs && inversiones.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Historial</p>
                  {inversiones.map(inv => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/60"
                    >
                      <div>
                        <p className="text-sm font-medium">{inv.descripcion}</p>
                        <p className="text-xs text-muted-foreground">{getNombreMes(inv.mes)} {inv.anio}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="amount-display text-sm font-bold text-purple-400">
                          {formatMonto(inv.monto)}
                        </span>
                        <button
                          id={`delete-inversion-${inv.id}`}
                          type="button"
                          onClick={() => handleEliminarInversion(inv.id)}
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
          <form onSubmit={(e) => { e.preventDefault(); handleGuardarEdicion(); }} className="px-6 pt-5 space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-shrink-0">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide block mb-1.5">Emoji</label>
                <EmojiPicker
                  id="edit-emoji-picker"
                  value={editEmoji}
                  onChange={setEditEmoji}
                  placement="top"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide block mb-1.5">Nombre</label>
                <input
                  id="edit-cat-nombre"
                  ref={editNombreRef}
                  type="text"
                  defaultValue={editNombre}
                  key={editSheet?.id}
                  className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <button
              id="guardar-edicion-cat"
              type="submit"
              disabled={editLoading}
              className="touch-feedback w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {editLoading ? 'Guardando...' : 'Guardar cambios'}
            </button>

            {editSheet && (
              <button
                id="eliminar-cat-btn"
                type="button"
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
          </form>
        </SheetContent>
      </Sheet>

      {/* Sheet nueva categoría */}
      <Sheet open={nuevaSheet} onOpenChange={setNuevaSheet}>
        <SheetContent side="bottom" showCloseButton={false} className="bg-card border-border rounded-t-3xl px-0 pb-8">
          <SheetHeader className="px-6 pb-4 border-b border-border/50">
            <SheetTitle>Nueva categoría</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleNuevaCategoria(); }} className="px-6 pt-5 space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-shrink-0">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide block mb-1.5">Emoji</label>
                <EmojiPicker
                  id="new-emoji-picker"
                  value={nuevaEmoji}
                  onChange={setNuevaEmoji}
                  placement="top"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide block mb-1.5">Nombre</label>
                <input
                  id="nueva-cat-nombre"
                  type="text"
                  value={nuevaNombre}
                  onChange={e => setNuevaNombre(e.target.value)}
                  placeholder="Ej: Fútbol"
                  className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <button
              id="crear-categoria"
              type="submit"
              disabled={editLoading || !nuevaNombre.trim()}
              className="touch-feedback w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {editLoading ? 'Creando...' : 'Crear categoría'}
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
