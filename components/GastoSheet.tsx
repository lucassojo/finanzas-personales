'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Gasto } from '@/lib/types';
import { formatMonto } from '@/lib/helpers';
import { Trash2, Edit3, Check } from 'lucide-react';

interface GastoSheetProps {
  gasto: Gasto;
  categorias: { nombre: string; emoji: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: number) => void;
  onUpdate: (gasto: Gasto) => void;
}

export default function GastoSheet({
  gasto,
  categorias,
  open,
  onOpenChange,
  onDelete,
  onUpdate,
}: GastoSheetProps) {
  const [editingCat, setEditingCat] = useState(false);
  const [selectedCat, setSelectedCat] = useState(gasto.categoria);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const catInfo = categorias.find(c => c.nombre === gasto.categoria);

  function handleClose() {
    setEditingCat(false);
    setConfirmDelete(false);
    onOpenChange(false);
  }

  async function handleUpdateCategoria() {
    if (selectedCat === gasto.categoria) {
      setEditingCat(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/gastos/${gasto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria: selectedCat }),
      });
      if (res.ok) {
        onUpdate({ ...gasto, categoria: selectedCat });
        setEditingCat(false);
        handleClose();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    try {
      await fetch(`/api/gastos/${gasto.id}`, { method: 'DELETE' });
      onDelete(gasto.id);
      handleClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="bg-card border-border rounded-t-3xl px-0 pb-8 max-h-[85vh]"
      >
        <SheetHeader className="px-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{catInfo?.emoji ?? '📦'}</span>
            <div>
              <SheetTitle className="text-left text-base font-semibold">
                {gasto.descripcion}
              </SheetTitle>
              <p className="text-2xl font-bold amount-display gradient-text mt-1">
                {formatMonto(gasto.monto)}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="px-6 pt-5 space-y-4 overflow-y-auto">
          {editingCat ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Seleccioná categoría:</p>
              <div className="grid grid-cols-1 gap-2">
                {categorias.map(cat => (
                  <button
                    key={cat.nombre}
                    id={`cat-select-${cat.nombre.replace(/\s+/g, '-')}`}
                    onClick={() => setSelectedCat(cat.nombre)}
                    className={`touch-feedback flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      selectedCat === cat.nombre
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-secondary/50 text-muted-foreground'
                    }`}
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="text-sm font-medium">{cat.nombre}</span>
                    {selectedCat === cat.nombre && (
                      <Check size={16} className="ml-auto text-primary" />
                    )}
                  </button>
                ))}
              </div>
              <button
                id="confirm-edit-cat"
                onClick={handleUpdateCategoria}
                disabled={loading}
                className="touch-feedback w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          ) : (
            <>
              <button
                id="edit-categoria-btn"
                onClick={() => setEditingCat(true)}
                className="touch-feedback w-full flex items-center gap-3 px-4 py-4 rounded-2xl glass-card hover:bg-white/[0.06] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Edit3 size={18} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">Editar categoría</p>
                  <p className="text-xs text-muted-foreground">Actualmente: {gasto.categoria}</p>
                </div>
              </button>

              <button
                id="delete-gasto-btn"
                onClick={handleDelete}
                disabled={loading}
                className={`touch-feedback w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${
                  confirmDelete
                    ? 'bg-red-500/20 border border-red-500/40'
                    : 'glass-card hover:bg-red-500/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  confirmDelete ? 'bg-red-500/30' : 'bg-red-500/15'
                }`}>
                  <Trash2 size={18} className="text-red-400" />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-semibold ${confirmDelete ? 'text-red-400' : ''}`}>
                    {confirmDelete ? '¿Confirmar eliminación?' : 'Eliminar gasto'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {confirmDelete ? 'Tocá de nuevo para confirmar' : 'Esta acción no se puede deshacer'}
                  </p>
                </div>
              </button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
