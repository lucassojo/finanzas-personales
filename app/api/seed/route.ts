import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function fechaRelativa(diasAtras: number): string {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== 'init') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = ahora.getMonth() + 1;

    const gastosSeed = [
      { fecha: fechaRelativa(0), descripcion: 'Almuerzo menú del día', categoria: 'Comida y súper', monto: 4500, metodo_pago: 'efectivo' },
      { fecha: fechaRelativa(0), descripcion: 'Café y medialunas', categoria: 'Comida y súper', monto: 2200, metodo_pago: 'efectivo' },
      { fecha: fechaRelativa(1), descripcion: 'Uber a Palermo', categoria: 'Ocio y entretenimiento', monto: 3800, metodo_pago: 'debito' },
      { fecha: fechaRelativa(1), descripcion: 'Cena con amigos La Cabrera', categoria: 'Salidas y delivery', monto: 18500, metodo_pago: 'credito' },
      { fecha: fechaRelativa(2), descripcion: 'Carrefour súper semanal', categoria: 'Comida y súper', monto: 32000, metodo_pago: 'debito' },
      { fecha: fechaRelativa(3), descripcion: 'Rappi cena en casa', categoria: 'Salidas y delivery', monto: 7800, metodo_pago: 'credito' },
      { fecha: fechaRelativa(4), descripcion: 'Netflix mensual', categoria: 'Ocio y entretenimiento', monto: 4800, metodo_pago: 'credito' },
      { fecha: fechaRelativa(5), descripcion: 'Spotify premium', categoria: 'Ocio y entretenimiento', monto: 2400, metodo_pago: 'credito' },
      { fecha: fechaRelativa(6), descripcion: 'Pre-fiesta 15 de Lucía', categoria: 'Fiestas', monto: 12000, metodo_pago: 'transferencia' },
      { fecha: fechaRelativa(7), descripcion: 'Almuerzo con jefa', categoria: 'Comida y súper', monto: 6500, metodo_pago: 'efectivo' },
      { fecha: fechaRelativa(8), descripcion: 'Cumpleaños en Unico', categoria: 'Fiestas', monto: 22000, metodo_pago: 'credito' },
      { fecha: fechaRelativa(10), descripcion: 'Remís aeropuerto', categoria: 'Ocio y entretenimiento', monto: 9500, metodo_pago: 'efectivo' },
      { fecha: fechaRelativa(12), descripcion: 'Farmacity pastillas', categoria: 'Otros', monto: 5600, metodo_pago: 'debito' },
      { fecha: fechaRelativa(15), descripcion: 'Pizza + birras con pibes', categoria: 'Salidas y delivery', monto: 11000, metodo_pago: 'transferencia' },
      { fecha: fechaRelativa(20), descripcion: 'Ropa Zara Palermo', categoria: 'Otros', monto: 45000, metodo_pago: 'credito' },
    ];

    // Insertar gastos seed
    for (const g of gastosSeed) {
      await db.execute({
        sql: `INSERT INTO gastos (fecha, descripcion, categoria, monto, metodo_pago) VALUES (?, ?, ?, ?, ?)`,
        args: [g.fecha, g.descripcion, g.categoria, g.monto, g.metodo_pago],
      });
    }

    // Insertar sueldo seed
    await db.execute({
      sql: `INSERT OR IGNORE INTO ingresos (mes, anio, descripcion, monto) VALUES (?, ?, ?, ?)`,
      args: [mes, anio, 'Sueldo', 650000],
    });

    const total = gastosSeed.reduce((acc, g) => acc + g.monto, 0);

    return NextResponse.json({
      ok: true,
      mensaje: `✅ Seed completado: ${gastosSeed.length} gastos insertados, total $${total.toLocaleString('es-AR')}`,
      gastos: gastosSeed.length,
    });
  } catch (error) {
    console.error('Error en seed:', error);
    return NextResponse.json({ error: 'Error en seed', detalle: String(error) }, { status: 500 });
  }
}
