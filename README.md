# pos-mu

Sistema POS (punto de venta) web de **Mundo Uniforme**, construido con Next.js (App Router), React 19, TypeScript y TailwindCSS 4. Cubre ventas, caja, productos y variantes, catálogos, clientes, reportes y usuarios.

## Relación con `admin-mu`

Esta aplicación es el frontend del backend FastAPI **`admin-mu`**. El navegador nunca llama directamente al backend: todas las solicitudes pasan por un proxy interno (`src/app/api/python/[...path]/route.ts`) que las reenvía a `BACKEND_API_URL`. La autenticación se resuelve con Supabase Auth y el JWT se envía en el header `Authorization`.

## Requisitos

- Node.js 22 o superior
- npm
- Un proyecto de Supabase (Auth)
- El backend `admin-mu` en ejecución (por defecto en `http://127.0.0.1:8000`)

## Puesta en marcha

```bash
npm install
# crear .env.local con las variables descritas abajo
npm run dev
```

La aplicación queda disponible en http://localhost:3000.

## Variables de entorno

| Variable | Ámbito | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública (navegador) | URL del proyecto de Supabase, con la forma `https://<project-ref>.supabase.co`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública (navegador) | Clave publicable de Supabase (`<publishable-key>`). |
| `BACKEND_API_URL` | Solo servidor | URL base de la API de `admin-mu` (por ejemplo `http://127.0.0.1:8000/api/v1`). Es obligatoria en producción; en desarrollo se usa ese valor por defecto. |

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Build de producción. |
| `npm run lint` | Análisis estático con ESLint. |
| `npm run typecheck` | Verificación de tipos con TypeScript. |
| `npm test` | Ejecuta las pruebas con Vitest. |

## Documentación adicional

Ver [`AGENTS.md`](./AGENTS.md) para la arquitectura, los módulos, los roles y las convenciones del proyecto.
