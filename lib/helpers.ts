export function formatMonto(monto: number): string {
  return '$' + monto.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatTiempoRelativo(fecha: string): string {
  const ahora = new Date();
  const gastoFecha = new Date(fecha);
  const diffMs = ahora.getTime() - gastoFecha.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return 'ahora mismo';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHoras < 24) return `hace ${diffHoras}h`;
  return gastoFecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

export function getFechaHoy(): string {
  const ahora = new Date();
  return ahora.toISOString().split('T')[0];
}

export function getNombreMes(mes: number): string {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[mes - 1] || '';
}

export function getMetodoPagoLabel(metodo: string): string {
  const labels: Record<string, string> = {
    efectivo: 'Efectivo',
    debito: 'Débito',
    credito: 'Crédito',
    transferencia: 'Transferencia',
  };
  return labels[metodo] || metodo;
}

export function getMetodoPagoColor(metodo: string): string {
  const colors: Record<string, string> = {
    debito: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    credito: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    transferencia: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };
  return colors[metodo] || '';
}
