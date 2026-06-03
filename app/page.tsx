import { db } from '@/lib/db';
import { Gasto, Categoria } from '@/lib/types';
import HoyClient from '@/components/HoyClient';
import { getFechaHoy } from '@/lib/helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getGastosHoy(): Promise<Gasto[]> {
  try {
    const hoy = getFechaHoy();
    const result = await db.execute({
      sql: 'SELECT * FROM gastos WHERE fecha = ? ORDER BY created_at DESC',
      args: [hoy],
    });
    return result.rows.map(r => ({
      id: Number(r.id),
      fecha: String(r.fecha),
      descripcion: String(r.descripcion),
      categoria: String(r.categoria),
      monto: Number(r.monto),
      metodo_pago: String(r.metodo_pago),
      created_at: String(r.created_at),
    }));
  } catch {
    return [];
  }
}

async function getCategorias(): Promise<Categoria[]> {
  try {
    const result = await db.execute(
      'SELECT * FROM categorias WHERE activa = 1 ORDER BY id'
    );
    return result.rows.map(r => ({
      id: Number(r.id),
      nombre: String(r.nombre),
      emoji: String(r.emoji),
      activa: Number(r.activa),
      created_at: String(r.created_at),
    }));
  } catch {
    return [];
  }
}

export default async function HoyPage() {
  const [gastos, categorias] = await Promise.all([getGastosHoy(), getCategorias()]);
  const totalHoy = gastos.reduce((acc, g) => acc + g.monto, 0);

  return (
    <HoyClient
      gastosIniciales={gastos}
      categorias={categorias}
      totalHoy={totalHoy}
    />
  );
}
