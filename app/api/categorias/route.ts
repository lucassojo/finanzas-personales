import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

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
  } catch {
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

    const nombreTrimmed = nombre.trim();
    const emojiTrimmed = emoji.trim();

    // 1. Verificar si ya existe una categoría ACTIVA con ese nombre
    const existeActiva = await db.execute({
      sql: 'SELECT id FROM categorias WHERE nombre = ? AND activa = 1',
      args: [nombreTrimmed],
    });
    if (existeActiva.rows.length > 0) {
      return NextResponse.json({ error: 'Ya existe una categoría activa con ese nombre' }, { status: 409 });
    }

    // 2. Si existe inactiva (eliminada antes), reactivarla con el nuevo emoji
    const existeInactiva = await db.execute({
      sql: "SELECT id FROM categorias WHERE nombre LIKE ? AND activa = 0",
      args: [`%${nombreTrimmed}%`],
    });

    // More precise: look for mangled names containing our target name
    const mangledMatch = await db.execute({
      sql: "SELECT id FROM categorias WHERE nombre LIKE ? AND activa = 0",
      args: [`__del_%_${nombreTrimmed}`],
    });

    if (mangledMatch.rows.length > 0) {
      // Reactivar la categoría existente con el nombre y emoji correctos
      const id = Number(mangledMatch.rows[0].id);
      await db.execute({
        sql: 'UPDATE categorias SET nombre = ?, emoji = ?, activa = 1 WHERE id = ?',
        args: [nombreTrimmed, emojiTrimmed, id],
      });
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
    }

    // 3. Crear nueva
    const result = await db.execute({
      sql: 'INSERT INTO categorias (nombre, emoji) VALUES (?, ?)',
      args: [nombreTrimmed, emojiTrimmed],
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
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
