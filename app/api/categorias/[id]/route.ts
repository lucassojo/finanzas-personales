import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT: actualizar categoría
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { nombre, emoji } = await req.json();
    const id = parseInt(params.id);
    const newNombre = nombre.trim();

    // 1. Obtener el nombre anterior
    const oldCatResult = await db.execute({
      sql: 'SELECT nombre FROM categorias WHERE id = ?',
      args: [id]
    });
    
    if (oldCatResult.rows.length === 0) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    const oldNombre = String(oldCatResult.rows[0].nombre);

    // 2. Actualizar la categoría
    await db.execute({
      sql: 'UPDATE categorias SET nombre = ?, emoji = ? WHERE id = ?',
      args: [newNombre, emoji.trim(), id],
    });

    // 3. Si el nombre cambió, actualizar todos los gastos asociados
    if (oldNombre !== newNombre) {
      await db.execute({
        sql: 'UPDATE gastos SET categoria = ? WHERE categoria = ?',
        args: [newNombre, oldNombre],
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE: desactivar categoría (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await db.execute({
      sql: 'UPDATE categorias SET activa = 0 WHERE id = ?',
      args: [id],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
