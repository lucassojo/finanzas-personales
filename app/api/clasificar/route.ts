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

    // Modelos verificados en Groq (actualizados Oct 2026)
    // GROQ_MODEL puede sobreescribir el primero desde .env.local
    const candidateModels = [
      process.env.GROQ_MODEL,
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
    ].filter((m): m is string => Boolean(m && m.trim() && m !== 'groq/compound-mini' && m !== 'groq/compound'));

    const systemPrompt = `Sos un asistente que extrae datos de gastos escritos en español argentino informal.
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
Si no se menciona método de pago, usá "efectivo".`;

    let content: string | null = null;
    let lastError: string | null = null;

    for (const model of candidateModels) {
      // Intentamos primero con response_format json_object, luego sin él como fallback
      const payloadVariants = [
        { response_format: { type: 'json_object' } },
        {}, // sin response_format, para modelos que no lo soporten
      ];

      let modelSuccess = false;
      for (const extraPayload of payloadVariants) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: texto },
              ],
              temperature: 0.1,
              max_tokens: 300,
              ...extraPayload,
            }),
          });

          if (!response.ok) {
            const errBody = await response.text();
            console.warn(`Groq API error con modelo ${model} (${response.status}):`, errBody);
            lastError = errBody;
            // Si es 400 (unsupported param), intentar sin response_format
            if (response.status === 400) continue;
            // Otro error: saltar al siguiente modelo
            break;
          }

          const data = await response.json();
          const msgContent = data.choices?.[0]?.message?.content;
          if (msgContent) {
            content = msgContent;
            modelSuccess = true;
            break;
          }
        } catch (err) {
          console.warn(`Fallo al contactar Groq con modelo ${model}:`, err);
          lastError = String(err);
          break;
        }
      }

      if (modelSuccess) break;
    }

    if (!content) {
      console.error('Groq API error en todos los modelos. Último error:', lastError);
      return NextResponse.json({ error: 'Error en la IA', fallback: true }, { status: 500 });
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

    // Validar monto y descripción
    const montoNum = Number(parsed.monto);
    parsed.monto = !isNaN(montoNum) ? montoNum : 0;
    parsed.descripcion = (parsed.descripcion || texto.trim()).toString().slice(0, 40);

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
