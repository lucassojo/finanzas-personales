# 💸 Mis Finanzas — App de Gastos Personales Argentina

App mobile-first para registrar gastos en lenguaje natural con IA (Groq + Llama 3.1), persistencia en Turso, y lista para deployar en Vercel.

## Stack

- **Next.js 14** — App Router + TypeScript
- **Tailwind CSS + shadcn/ui** — tema zinc oscuro premium
- **Turso** — base de datos SQLite distribuida
- **Groq API** — clasificación de gastos con `llama-3.1-8b-instant`
- **Recharts** — gráficos de gastos
- **Lucide React** — íconos

## Setup local

### 1. Clonar y configurar variables de entorno

```bash
# Completar .env.local con tus credenciales
cp .env.example .env.local
```

Editá `.env.local`:
```env
GROQ_API_KEY=tu_groq_api_key
TURSO_DATABASE_URL=libsql://tu-db.turso.io
TURSO_AUTH_TOKEN=tu_turso_token
```

### 2. Instalar dependencias y correr

```bash
npm install
npm run dev
```

Abrí http://localhost:3000

### 3. Inicializar la base de datos con datos de ejemplo (opcional)

```
GET http://localhost:3000/api/seed?secret=init
```

## Deploy en Vercel

```bash
# Subir a GitHub
git init
git add .
git commit -m "finanzas app v1"
git remote add origin https://github.com/TUUSUARIO/finanzas-personales.git
git branch -M main
git push -u origin main
```

En el dashboard de Vercel, agregar las variables de entorno:
- `GROQ_API_KEY`
- `TURSO_DATABASE_URL`  
- `TURSO_AUTH_TOKEN`

Vercel despliega automático al detectar el push.

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Feed de gastos de hoy + input bar IA |
| `/resumen` | Resumen mensual con gráficos |
| `/config` | Sueldo y gestión de categorías |

## APIs

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/clasificar` | POST | Clasifica texto con Groq y guarda gasto |
| `/api/gastos` | GET/POST | Listar/crear gastos |
| `/api/gastos/[id]` | PATCH/DELETE | Editar categoría / eliminar |
| `/api/categorias` | GET/POST | Listar/crear categorías |
| `/api/categorias/[id]` | PUT/DELETE | Editar/desactivar categoría |
| `/api/ingresos` | GET/POST/DELETE | CRUD de ingresos |
| `/api/seed?secret=init` | GET | Cargar datos de ejemplo |

## Credenciales

- **Groq**: https://console.groq.com
- **Turso**: https://turso.tech
