import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getFechaHoy } from '@/lib/helpers';

// POST: crear gasto manual (fallback)
export async function POST(req: NextRequest) {
  try {
    const { descripcion, monto, categoria, metodo_pago } = await req.json();
    const hoy = getFechaHoy();

    const result = await db.execute({
      sql: `INSERT INTO gastos (fecha, descripcion, categoria, monto, metodo_pago)
            VALUES (?, ?, ?, ?, ?)`,
      args: [hoy, descripcion.slice(0, 40), categoria, Number(monto), metodo_pago || 'efectivo'],
    });

    const gastoId = Number(result.lastInsertRowid);
    const gastoResult = await db.execute({
      sql: 'SELECT * FROM gastos WHERE id = ?',
      args: [gastoId],
    });

    const row = gastoResult.rows[0];
    const gasto = {
      id: Number(row.id),
      fecha: String(row.fecha),
      descripcion: String(row.descripcion),
      categoria: String(row.categoria),
      monto: Number(row.monto),
      metodo_pago: String(row.metodo_pago),
      created_at: String(row.created_at),
    };

    return NextResponse.json({ gasto });
  } catch (error) {
    console.error('Error en POST /api/gastos:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// GET: obtener gastos por mes/año
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mes = searchParams.get('mes');
    const anio = searchParams.get('anio');

    let sql: string;
    let args: (string | number)[];

    if (mes && anio) {
      const mesNum = mes.padStart(2, '0');
      sql = `SELECT * FROM gastos WHERE fecha LIKE ? ORDER BY fecha DESC, created_at DESC`;
      args = [`${anio}-${mesNum}-%`];
    } else {
      const hoy = getFechaHoy();
      sql = `SELECT * FROM gastos WHERE fecha = ? ORDER BY created_at DESC`;
      args = [hoy];
    }

    const result = await db.execute({ sql, args });
    const gastos = result.rows.map(r => ({
      id: Number(r.id),
      fecha: String(r.fecha),
      descripcion: String(r.descripcion),
      categoria: String(r.categoria),
      monto: Number(r.monto),
      metodo_pago: String(r.metodo_pago),
      created_at: String(r.created_at),
    }));

    return NextResponse.json({ gastos });
  } catch (error) {
    console.error('Error en GET /api/gastos:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
