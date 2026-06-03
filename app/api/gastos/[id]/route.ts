import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH: actualizar categoría de un gasto
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { categoria } = await req.json();
    const id = parseInt(params.id);

    await db.execute({
      sql: 'UPDATE gastos SET categoria = ? WHERE id = ?',
      args: [categoria, id],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error en PATCH /api/gastos/[id]:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE: eliminar un gasto
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await db.execute({
      sql: 'DELETE FROM gastos WHERE id = ?',
      args: [id],
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error en DELETE /api/gastos/[id]:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
