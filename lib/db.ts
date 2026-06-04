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
    `CREATE TABLE IF NOT EXISTS gastos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      descripcion TEXT NOT NULL,
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
  ], 'write');
}
