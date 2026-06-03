import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: listar categorías activas
export async function GET() {
  try {
    const result = await db.execute(
      'SELECT * FROM categorias WHERE activa = 1 ORDER BY id'
    );
    const categorias = result.rows.map(r => ({
      id: Number(r.id),
      nombre: String(r.nombre),
      emoji: String(r.emoji),
      activa: Number(r.activa),
      created_at: String(r.created_at),
    }));
    return NextResponse.json({ categorias });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST: crear nueva categoría
export async function POST(req: NextRequest) {
  try {
    const { nombre, emoji } = await req.json();
    if (!nombre || !emoji) {
      return NextResponse.json({ error: 'Nombre y emoji son requeridos' }, { status: 400 });
    }

    const result = await db.execute({
      sql: 'INSERT INTO categorias (nombre, emoji) VALUES (?, ?)',
      args: [nombre.trim(), emoji.trim()],
    });

    const id = Number(result.lastInsertRowid);
    const catResult = await db.execute({
      sql: 'SELECT * FROM categorias WHERE id = ?',
      args: [id],
    });
    const row = catResult.rows[0];

    return NextResponse.json({
      categoria: {
        id: Number(row.id),
        nombre: String(row.nombre),
        emoji: String(row.emoji),
        activa: Number(row.activa),
        created_at: String(row.created_at),
      }
    }, { status: 201 });
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
