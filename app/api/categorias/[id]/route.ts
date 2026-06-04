import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PUT: actualizar categoría
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { nombre, emoji } = await req.json();
    const id = parseInt(params.id);
    const newNombre = nombre.trim();
    const newEmoji = emoji.trim();

    // 1. Obtener la categoría actual
    const oldCatResult = await db.execute({
      sql: 'SELECT nombre FROM categorias WHERE id = ?',
      args: [id]
    });

    if (oldCatResult.rows.length === 0) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    const oldNombre = String(oldCatResult.rows[0].nombre);

    // 2. Si el nombre cambia, verificar que no exista OTRA categoría activa con ese nombre (case-insensitive)
    if (oldNombre.toLowerCase() !== newNombre.toLowerCase()) {
      const conflicto = await db.execute({
        sql: 'SELECT id FROM categorias WHERE LOWER(nombre) = LOWER(?) AND activa = 1 AND id != ?',
        args: [newNombre, id],
      });
      if (conflicto.rows.length > 0) {
        return NextResponse.json({ error: 'Ya existe una categoría activa con ese nombre' }, { status: 409 });
      }
    }

    // 3. Actualizar
    await db.execute({
      sql: 'UPDATE categorias SET nombre = ?, emoji = ? WHERE id = ?',
      args: [newNombre, newEmoji, id],
    });

    // 4. Si el nombre cambió, actualizar los gastos asociados
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

// DELETE: soft-delete manglando el nombre para liberar la restricción UNIQUE
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    // Mangle the name so the UNIQUE constraint doesn't block future categories with the same name
    await db.execute({
      sql: "UPDATE categorias SET activa = 0, nombre = '__del_' || id || '_' || nombre WHERE id = ?",
      args: [id],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
