import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH: actualizar categoría o monto de un gasto
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { categoria, monto } = await req.json();
    const id = parseInt(params.id);

    const updates = [];
    const args = [];
    if (categoria !== undefined) {
      updates.push('categoria = ?');
      args.push(categoria);
    }
    if (monto !== undefined) {
      updates.push('monto = ?');
      args.push(monto);
    }

    if (updates.length > 0) {
      args.push(id);
      await db.execute({
        sql: `UPDATE gastos SET ${updates.join(', ')} WHERE id = ?`,
        args: args,
      });
    }

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
