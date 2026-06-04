import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getFechaHoy } from '@/lib/helpers';

export async function POST(req: NextRequest) {
  try {
    const { texto, fecha } = await req.json();
    if (!texto || typeof texto !== 'string') {
      return NextResponse.json({ error: 'Texto requerido' }, { status: 400 });
    }

    // Leer categorías activas
    const cats = await db.execute('SELECT nombre FROM categorias WHERE activa = 1');
    const listaCats = cats.rows.map(r => r.nombre as string).join(' | ');

    // Llamada a Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Sos un asistente que extrae datos de gastos escritos en español argentino informal.
Respondé ÚNICAMENTE con JSON válido, sin texto extra ni backticks:
{
  "monto": number,
  "descripcion": string (máx 40 caracteres),
  "categoria": string (EXACTAMENTE una de las siguientes opciones de la lista de categorías activas: ${listaCats}),
  "metodo_pago": string ("efectivo" | "debito" | "credito" | "transferencia")
}

Guía de clasificación y jerga argentina:
1. "bondi", "colectivo", "subte", "tren", "sube", "tarjeta sube", "taxi", "uber", "cabify", "peaje", "nafta", "gasolina", "estacionamiento" se asocian a "Transporte público" (o similar de transporte).
2. "chino", "súper", "coto", "carrefour", "dia", "verdulería", "carnicería", "almacén", "pan", "facturas", "leche", "compras" se asocian a "Comida y súper".
3. "birra", "cerveza", "boliche", "bar", "pedidosya", "rappi", "cena", "almuerzo en restaurant", "delivery", "mcdonalds", "burguer" se asocian a "Salidas y delivery".
4. "netflix", "spotify", "cine", "teatro", "recital", "juego", "playstation" se asocian a "Ocio y entretenimiento".
5. Si ninguna categoría se ajusta bien, usá la que sea más genérica o "Otros".

Si hay múltiples montos (ej: "entrada 3000 + tragos 5000"), sumalos.
Si no se menciona método de pago, usá "efectivo".`,
          },
          { role: 'user', content: texto },
        ],
        temperature: 0.1,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Groq API error:', errBody);
      return NextResponse.json({ error: 'Error en la IA', fallback: true }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Respuesta vacía de la IA', fallback: true }, { status: 500 });
    }

    let parsed: { monto: number; descripcion: string; categoria: string; metodo_pago: string };
    try {
      // Remove potential markdown code blocks
      const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Parse error:', content);
      return NextResponse.json({ error: 'No pude interpretar la respuesta', fallback: true }, { status: 500 });
    }

    // Validar que la categoría existe (insensible a mayúsculas/minúsculas y acentos)
    const normalizeStr = (str: string) => {
      if (!str) return '';
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    };
    const catEncontrada = cats.rows.find(
      r => normalizeStr(r.nombre as string) === normalizeStr(parsed.categoria)
    );

    if (catEncontrada) {
      parsed.categoria = catEncontrada.nombre as string;
    } else {
      parsed.categoria = 'Otros';
    }

    // Validar método de pago
    const metodosValidos = ['efectivo', 'debito', 'credito', 'transferencia'];
    if (!metodosValidos.includes(parsed.metodo_pago)) {
      parsed.metodo_pago = 'efectivo';
    }

    const targetFecha = fecha || getFechaHoy();

    // Guardar en Turso
    const result = await db.execute({
      sql: `INSERT INTO gastos (fecha, descripcion, nota_usuario, categoria, monto, metodo_pago)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [targetFecha, parsed.descripcion.slice(0, 40), texto.trim(), parsed.categoria, parsed.monto, parsed.metodo_pago],
    });

    const gastoId = Number(result.lastInsertRowid);

    // Leer el gasto recién insertado
    const gastoResult = await db.execute({
      sql: 'SELECT * FROM gastos WHERE id = ?',
      args: [gastoId],
    });

    const row = gastoResult.rows[0];
    const gasto = {
      id: Number(row.id),
      fecha: String(row.fecha),
      descripcion: String(row.descripcion),
      nota_usuario: row.nota_usuario ? String(row.nota_usuario) : undefined,
      categoria: String(row.categoria),
      monto: Number(row.monto),
      metodo_pago: String(row.metodo_pago),
      created_at: String(row.created_at),
    };

    return NextResponse.json({ gasto });
  } catch (error) {
    console.error('Error en /api/clasificar:', error);
    return NextResponse.json({ error: 'Error interno', fallback: true }, { status: 500 });
  }
}
