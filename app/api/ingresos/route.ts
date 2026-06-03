import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: listar ingresos
export async function GET() {
  try {
    const result = await db.execute(
      'SELECT * FROM ingresos ORDER BY anio DESC, mes DESC'
    );
    const ingresos = result.rows.map(r => ({
      id: Number(r.id),
      mes: Number(r.mes),
      anio: Number(r.anio),
      descripcion: String(r.descripcion),
      monto: Number(r.monto),
      created_at: String(r.created_at),
    }));
    return NextResponse.json({ ingresos });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST: registrar ingreso
export async function POST(req: NextRequest) {
  try {
    const { mes, anio, descripcion, monto } = await req.json();
    if (!mes || !anio || !monto) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const result = await db.execute({
      sql: 'INSERT INTO ingresos (mes, anio, descripcion, monto) VALUES (?, ?, ?, ?)',
      args: [Number(mes), Number(anio), descripcion || 'Sueldo', Number(monto)],
    });

    const id = Number(result.lastInsertRowid);
    const ingresoResult = await db.execute({
      sql: 'SELECT * FROM ingresos WHERE id = ?',
      args: [id],
    });
    const row = ingresoResult.rows[0];

    return NextResponse.json({
      ingreso: {
        id: Number(row.id),
        mes: Number(row.mes),
        anio: Number(row.anio),
        descripcion: String(row.descripcion),
        monto: Number(row.monto),
        created_at: String(row.created_at),
      }
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE: eliminar ingreso
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await db.execute({ sql: 'DELETE FROM ingresos WHERE id = ?', args: [Number(id)] });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
