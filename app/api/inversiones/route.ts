import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: listar inversiones
export async function GET() {
  try {
    const result = await db.execute(
      'SELECT * FROM inversiones ORDER BY anio DESC, mes DESC'
    );
    const inversiones = result.rows.map(r => ({
      id: Number(r.id),
      mes: Number(r.mes),
      anio: Number(r.anio),
      descripcion: String(r.descripcion),
      monto: Number(r.monto),
      created_at: String(r.created_at),
    }));
    return NextResponse.json({ inversiones });
  } catch (error) {
    console.error('Error en GET /api/inversiones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST: registrar inversión
export async function POST(req: NextRequest) {
  try {
    const { mes, anio, descripcion, monto } = await req.json();
    if (!mes || !anio || !monto) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const result = await db.execute({
      sql: 'INSERT INTO inversiones (mes, anio, descripcion, monto) VALUES (?, ?, ?, ?)',
      args: [Number(mes), Number(anio), descripcion || 'Inversión', Number(monto)],
    });

    const id = Number(result.lastInsertRowid);
    const inversionResult = await db.execute({
      sql: 'SELECT * FROM inversiones WHERE id = ?',
      args: [id],
    });
    const row = inversionResult.rows[0];

    return NextResponse.json({
      inversion: {
        id: Number(row.id),
        mes: Number(row.mes),
        anio: Number(row.anio),
        descripcion: String(row.descripcion),
        monto: Number(row.monto),
        created_at: String(row.created_at),
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/inversiones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE: eliminar inversión
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await db.execute({ sql: 'DELETE FROM inversiones WHERE id = ?', args: [Number(id)] });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error en DELETE /api/inversiones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
