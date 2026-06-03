'use client';

import { useState } from 'react';
import { Gasto } from '@/lib/types';
import { formatMonto, formatTiempoRelativo, getMetodoPagoLabel, getMetodoPagoColor } from '@/lib/helpers';
import GastoSheet from './GastoSheet';

interface GastoCardProps {
  gasto: Gasto;
  categorias: { nombre: string; emoji: string }[];
  onDelete: (id: number) => void;
  onUpdate: (gasto: Gasto) => void;
  isNew?: boolean;
}

export default function GastoCard({ gasto, categorias, onDelete, onUpdate, isNew }: GastoCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const catInfo = categorias.find(c => c.nombre === gasto.categoria);
  const emoji = catInfo?.emoji ?? '📦';
  const esEfectivo = gasto.metodo_pago === 'efectivo';
  const metodoBadgeClass = getMetodoPagoColor(gasto.metodo_pago);

  return (
    <>
      <button
        id={`gasto-${gasto.id}`}
        onClick={() => setSheetOpen(true)}
        className={`touch-feedback w-full text-left glass-card rounded-2xl px-4 py-3.5 flex items-center gap-3.5 transition-all duration-200 hover:bg-white/[0.06] active:scale-[0.98] ${
          isNew ? 'gasto-card-enter' : ''
        }`}
      >
        {/* Emoji */}
        <div className="emoji-badge">
          {emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {gasto.descripcion}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{gasto.categoria}</span>
            {!esEfectivo && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${metodoBadgeClass}`}>
                {getMetodoPagoLabel(gasto.metodo_pago)}
              </span>
            )}
          </div>
        </div>

        {/* Monto y tiempo */}
        <div className="text-right flex-shrink-0">
          <p className="amount-display text-base font-bold text-foreground">
            {formatMonto(gasto.monto)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {formatTiempoRelativo(gasto.created_at)}
          </p>
        </div>
      </button>

      <GastoSheet
        gasto={gasto}
        categorias={categorias}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
    </>
  );
}
