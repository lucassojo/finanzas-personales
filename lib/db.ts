import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function setupDB() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      emoji TEXT NOT NULL DEFAULT '📦',
      activa INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS gastos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      nota_usuario TEXT,
      categoria TEXT NOT NULL,
      monto REAL NOT NULL,
      metodo_pago TEXT DEFAULT 'efectivo',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS ingresos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mes INTEGER NOT NULL,
      anio INTEGER NOT NULL,
      descripcion TEXT NOT NULL,
      monto REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS inversiones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mes INTEGER NOT NULL,
      anio INTEGER NOT NULL,
      descripcion TEXT NOT NULL,
      monto REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    )`,
  ], 'write');

  const countRes = await db.execute('SELECT COUNT(*) as c FROM categorias');
  if (Number(countRes.rows[0].c) === 0) {
    await db.batch([
      `INSERT OR IGNORE INTO categorias (nombre, emoji) VALUES
        ('Comida y súper', '🛒')`,
      `INSERT OR IGNORE INTO categorias (nombre, emoji) VALUES
        ('Salidas y delivery', '🍕')`,
      `INSERT OR IGNORE INTO categorias (nombre, emoji) VALUES
        ('Fiestas', '🎉')`,
      `INSERT OR IGNORE INTO categorias (nombre, emoji) VALUES
        ('Ocio y entretenimiento', '🎮')`,
      `INSERT OR IGNORE INTO categorias (nombre, emoji) VALUES
        ('Transporte público', '🚌')`,
      `INSERT OR IGNORE INTO categorias (nombre, emoji) VALUES
        ('Otros', '📦')`,
      `INSERT OR IGNORE INTO categorias (nombre, emoji) VALUES
        ('Salud', '🏥')`
    ], 'write');
  } else {
    // Asegurar que exista la categoría 'Salud' con '🏥' en caso de que la DB ya exista
    try {
      const saludActiva = await db.execute("SELECT id FROM categorias WHERE (nombre = 'Salud' OR nombre LIKE '\\_\\_del\\_\\%\\_Salud' ESCAPE '\\')");
      if (saludActiva.rows.length === 0) {
        await db.execute("INSERT OR IGNORE INTO categorias (nombre, emoji) VALUES ('Salud', '🏥')");
      } else {
        await db.execute("UPDATE categorias SET emoji = '🏥' WHERE nombre = 'Salud'");
      }
    } catch(e) {
      console.error("Error asegurando categoría Salud", e);
    }
  }

  // Migration: agregar nota_usuario si no existe
  // SQLite no tiene ADD COLUMN IF NOT EXISTS, así que capturamos el error
  try {
    await db.execute('ALTER TABLE gastos ADD COLUMN nota_usuario TEXT');
  } catch {
    // La columna ya existe, ignorar el error
  }
}
