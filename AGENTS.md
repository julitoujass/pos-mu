# agents.md — Contexto del Proyecto `pos-mu`

> 📎 Ver también: [`admin-mu/agents.md`](../../admin-mu/agents.md) — documentación completa del backend FastAPI.

## Descripción General

**`pos-mu`** es un sistema POS (Point of Sale) web para **Mundo Uniforme**, una tienda de uniformes. Está construido como una aplicación Next.js que actúa como frontend para el backend FastAPI (`admin-mu`, corriendo en `http://127.0.0.1:8000`).

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.1.4 (App Router) |
| Lenguaje | TypeScript 5 |
| UI | React 19 + TailwindCSS 4 |
| Íconos | Lucide React |
| Notificaciones | Sonner (toasts) |
| Autenticación | Supabase Auth (`@supabase/ssr` + `@supabase/supabase-js`) |
| Tema | next-themes (dark/light mode) |
| Fuente | Lexend (variable CSS `--font-lexend`) |

---

## Arquitectura

### Diagrama de Comunicación

```
Browser (Next.js POS)
    │
    ├── Supabase Auth  ──► https://pwzhrsdmjweoemtfkmrl.supabase.co
    │   (login, sesión, JWT)
    │
    └── /api/python/*  ──► http://127.0.0.1:8000/api/v1/*  (FastAPI = admin-mu)
        (proxy interno Next.js para evitar CORS)
```

### Proxy de API
Todas las llamadas al backend pasan por el catch-all route handler ubicado en:
```
src/app/api/python/[...path]/route.ts
```
Este proxy reenvía la solicitud (headers excepto `host`/`connection`, body y query params) al backend FastAPI y devuelve status y headers tal cual (500 JSON si falla el fetch). El proxy **no agrega** el JWT: el header `Authorization: Bearer <token>` ya lo pone el navegador vía `getAuthHeaders()` y el proxy lo deja pasar.

La constante en `src/lib/http.ts` es:
```ts
export const API_URL = '/api/python';
```
El target interno es `http://127.0.0.1:8000/api/v1`.

---

## Estructura de Carpetas

Arquitectura "screaming": el código se organiza por **feature de negocio**, no por tipo de archivo.

```
src/
├── app/                           # SOLO rutas: páginas finas que renderizan el contenedor de una feature
│   ├── page.tsx                   # Página de login (pública) → <LoginForm /> de features/auth
│   ├── layout.tsx                 # Root layout con ThemeProvider
│   ├── globals.css                # Design tokens + TailwindCSS
│   ├── api/python/[...path]/      # Proxy catch-all hacia FastAPI (route.ts + route.test.ts)
│   └── dashboard/
│       ├── layout.tsx             # Sidebar + navegación + <CurrentUserProvider> (client)
│       ├── page.tsx               # → <DashboardHome />   (features/dashboard)
│       ├── venta/page.tsx         # → <NewSalePage />     (features/ventas)
│       ├── caja/page.tsx          # → <CajaPage />        (features/caja)
│       ├── productos/page.tsx     # → <ProductosPage />   (features/productos)
│       ├── catalogos/page.tsx     # → <CatalogosPage />   (features/catalogos)
│       ├── clientes/page.tsx      # → <ClientesPage />    (features/clientes)
│       ├── reportes/page.tsx      # → <ReportesPage />    (features/reportes, solo admin)
│       └── usuarios/page.tsx      # → <UsuariosPage />    (features/usuarios, solo admin)
├── features/
│   ├── auth/                      # api.ts (fetchMe), types.ts, current-user.tsx (CurrentUserProvider/useCurrentUser),
│   │                              # components/{admin-only,login-form}.tsx
│   ├── ventas/                    # api.ts, types.ts, cart.ts (lógica pura del carrito), hooks/use-new-sale.ts,
│   │                              # components/{new-sale-page,sku-scanner,cart-table,checkout-panel,client-selector-modal}.tsx
│   ├── caja/                      # api.ts, types.ts, hooks/{use-cash-session,use-sessions-history}.ts,
│   │                              # components/{caja-page,open-register-form,cash-summary-cards,shift-sales-summary,
│   │                              #   movements-table,close-register-form,movement-modal,sessions-history-modal,session-list}.tsx
│   ├── productos/                 # api.ts, types.ts, hooks/use-products.ts,
│   │                              # components/{productos-page,product-card,variants-table,product-modal,variant-modal,stock-adjust-modal}.tsx
│   ├── catalogos/                 # api.ts, types.ts, hooks/use-catalogos.ts,
│   │                              # components/{catalogos-page,catalog-list,catalog-form-modal,marca-form-modal,categoria-form-modal}.tsx
│   ├── clientes/                  # api.ts, types.ts, hooks/use-clients.ts,
│   │                              # components/{clientes-page,clients-table,client-modal}.tsx
│   ├── reportes/                  # api.ts, types.ts, format.ts, date-presets.ts, hooks/use-reportes.ts,
│   │                              # components/{reportes-page,date-range-selector,kpi-cards,sales-by-day-chart,
│   │                              #   top-products,cash-report-table,report-states}.tsx
│   ├── usuarios/                  # api.ts, types.ts, hooks/use-users.ts, components/{usuarios-page,users-table}.tsx
│   └── dashboard/                 # hooks/use-dashboard-summary.ts, components/dashboard-home.tsx (panel principal)
├── components/
│   ├── theme-provider.tsx         # Wrapper de next-themes
│   ├── theme-toggle.tsx           # Botón light/dark
│   └── ui/                        # Kit presentacional compartido (sin lógica de negocio)
│       ├── modal.tsx              # <Modal>: shell accesible de todos los modales
│       ├── confirm-dialog.tsx     # <ConfirmDialog>: confirmaciones (reemplaza window.confirm)
│       ├── delete-confirm-dialog.tsx # <DeleteConfirmDialog>: "Confirmar eliminación" estándar
│       ├── empty-state.tsx        # <EmptyState>: tarjeta de lista vacía
│       ├── form-error.tsx         # <FormError>: banner de error de formulario
│       └── skeleton.tsx           # <Skeleton>
├── lib/                           # Transversal, sin conocimiento de features
│   ├── http.ts                    # API_URL, getAuthHeaders, toApiError, apiFetch/apiJson, toQueryString
│   ├── errors.ts                  # getErrorMessage, getApiErrorDetail, ApiError (con status), isInactiveUserError
│   ├── money.ts                   # roundMoney / formatMoney / parseMoneyInput
│   └── supabase/                  # client.ts, server.ts, middleware.ts (updateSession)
├── test/json-response.ts          # Helper de tests: Response JSON para mockear fetch
└── proxy.ts                       # Proxy de Next 16 (antes middleware.ts): protege rutas con Supabase

# Raíz del repositorio (además de la configuración de Next/TypeScript/ESLint)
vitest.config.ts                   # Vitest (entorno node por defecto, alias @/ → src/)
.env.example                       # Plantilla de variables de entorno (sin valores reales)
.github/workflows/ci.yml           # CI: lint, typecheck, test y build
```

### Anatomía de una feature (`src/features/<feature>/`)

| Archivo | Contenido |
|---|---|
| `types.ts` | Tipos del dominio y de los payloads de la API |
| `api.ts` | Funciones fetch de la feature, construidas sobre `apiJson`/`apiFetch` de `@/lib/http` |
| `hooks/use-*.ts` | Carga de datos y estado (p. ej. `useProducts`, `useCashSession`, `useNewSale`) |
| `components/<feature>-page.tsx` | **Contenedor**: usa los hooks, maneja qué modal está abierto y compone los presentacionales |
| `components/*.tsx` | **Presentacionales**: reciben props; los modales de formulario llaman a su `api.ts` y avisan con `onSuccess` |
| `index.ts` | API pública de la feature: `api`, `types` y el contenedor de página |
| `*.test.ts(x)` | Tests junto al código (`api.test.ts`, `cart.test.ts`, ...) |

Reglas de dependencia:
- `app/` → `features/` → `components/ui` y `lib/`. `lib/` y `components/ui` **nunca** importan de `features/`.
- Una feature importa de otra **solo por su `index.ts`** (`@/features/productos`), nunca archivos internos. Hoy: `ventas` usa `productos` y `clientes`; `dashboard` usa `ventas` y `caja`; todas pueden usar `auth`.
- Un componente va a `components/ui` solo si es presentacional y lo usan 2+ features; si no, vive en su feature.

Los tests viven junto al código que prueban (`*.test.ts` / `*.test.tsx`). Los de API mockean `fetch` y `@/lib/supabase/client`. Los de componentes usan jsdom + Testing Library y declaran el entorno por archivo con `// @vitest-environment jsdom` en la primera línea (el resto corre en `node`).

---

## Autenticación

- **Proveedor:** Supabase Auth (email/password)
- **Protección de rutas:** El `src/proxy.ts` (convención `proxy` de Next 16, que reemplaza a `middleware.ts`; exporta la función `proxy`) llama a `updateSession()` en cada request (excepto assets estáticos e imágenes). Si no hay sesión válida, el usuario es redirigido al login.
- **JWT en API calls:** `getAuthHeaders()` en `src/lib/http.ts` obtiene el `access_token` de la sesión activa y lo pone como `Authorization: Bearer`.
- **Logout:** `supabase.auth.signOut()` desde el sidebar → redirect a `/`.

### Roles

El backend aplica la matriz de permisos; la UI la refleja para no mostrar acciones que devolverían 403.

| Capacidad | empleado | admin |
|---|---|---|
| Vender, abrir/cerrar caja, ingresos/egresos, resumen de la sesión actual | ✅ | ✅ |
| Ver productos y stock | ✅ (sin costos ni márgenes) | ✅ (con costos y márgenes) |
| Leer marcas y categorías | ✅ (solo lectura) | ✅ |
| Crear/editar clientes | ✅ | ✅ |
| Crear/editar productos y variantes, precios y costos | ❌ | ✅ |
| Ajustar stock, borrar productos/variantes | ❌ | ✅ |
| Crear/editar/borrar marcas y categorías | ❌ | ✅ |
| Reportes | ❌ | ✅ |
| Historial de sesiones de caja anteriores (`/caja/sesiones*`) | ❌ | ✅ |
| Gestión de usuarios (rol y activo/inactivo) | ❌ | ✅ |

- El backend valida el token con `supabase.auth.get_user()` y obtiene el rol desde `perfiles → roles` (cache en memoria de 5 min; si falla, el rol por defecto es `empleado`). Ver `admin-mu/app/api/auth_deps.py`.
- Respuestas: 403 `{detail}` si no tiene permiso; `precio_costo` llega `null` para empleado; los usuarios inactivos reciben 403 "Usuario inactivo" en todas las llamadas.
- `GET /usuarios/me` devuelve `{ id, email, rol, activo }`.
- **`CurrentUserProvider` / `useCurrentUser()`** (`src/features/auth/current-user.tsx`, exportados por `@/features/auth`): `dashboard/layout.tsx` envuelve el dashboard con el provider, que llama a `fetchMe()` **una sola vez**. Las páginas usan `const { user, isAdmin, loading } = useCurrentUser()`; **no llamar a `fetchMe()` directamente** desde páginas. Si `/usuarios/me` responde 403 "Usuario inactivo", el provider cierra la sesión de Supabase, muestra un toast y redirige a `/`.
- **`<AdminOnly>`** (`src/features/auth/components/admin-only.tsx`, exportado por `@/features/auth`): envuelve el contenido de las páginas solo-admin (`reportes`, `usuarios`). Muestra skeleton mientras carga y, si no es admin, un estado vacío "No tenés permisos para ver esta sección" (sin redirect). El patrón es: el contenedor de la feature (`ReportesPage`, `UsuariosPage`) renderiza `<AdminOnly><XContent /></AdminOnly>` para que los fetch de admin no se disparen para empleados.
- El sidebar oculta Reportes y Usuarios (`adminOnly`) si no es admin; Catálogos es visible para todos.
- Los controles de escritura se ocultan con `isAdmin` (productos, catálogos, historial de caja). La protección real sigue siendo el 403 del backend.
- **Errores de API:** `apiFetch`/`apiJson` (`src/lib/http.ts`) usan `toApiError(res, fallback)` en todos los `!res.ok`: lanzan `ApiError` (con `status`) cuyo mensaje es el `detail` del backend (403, 409, 400, 422) o el `fallback`. Los toasts muestran ese mensaje con `getErrorMessage`.

---

## Variables de Entorno (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>
BACKEND_API_URL=http://127.0.0.1:8000/api/v1
```
`BACKEND_API_URL` es solo de servidor y la usa el proxy de API (`src/app/api/python/[...path]/route.ts`). Es obligatoria en producción; en desarrollo, si falta, se usa `http://127.0.0.1:8000/api/v1`. Las barras finales se eliminan. Hay una plantilla en `.env.example`.

---

## Módulos Principales

### 1. `/dashboard` — Panel Principal
- Muestra KPIs del día: total de ventas, estado de caja, acciones rápidas.
- Llama en paralelo a `fetchSalesToday()` y `fetchCashStatus()` (`useDashboardSummary`, `features/dashboard`).

### 2. `/dashboard/venta` — POS / Nueva Venta
- Flujo principal del POS. Es la página más compleja del sistema.
- Interfaz de dos columnas: carrito (izquierda) + checkout (derecha).
- **Búsqueda por SKU:** Input autofocuseado que busca variantes por SKU exacto o ID. Soporta escáner de código de barras.
- **Carrito local:** Estado React con validación de stock en tiempo real.
- **Métodos de pago:** Efectivo, Tarjeta, QR (enum fijo, no configurable desde UI).
- **Cliente:** Selector modal que filtra por nombre, DNI o email. Default es "Consumidor Final" (cliente_id = null).
- **Precios del lado del servidor:** el front envía solo `{ variante_id, cantidad }` por ítem, el método de pago y el cliente. Los precios y el total los toma el backend de la DB; el total mostrado en pantalla es una estimación (`roundMoney`/`formatMoney`) y el toast de éxito muestra el `total` real devuelto por el servidor.
- **Idempotency-Key:** se genera un `crypto.randomUUID()` por intento de cobro y se envía en el header `Idempotency-Key` (`processSale(data, key)`). Se reutiliza si el usuario reintenta tras un error (el backend devuelve la misma venta, sin duplicar) y se reinicia tras una venta exitosa o al cambiar carrito, método de pago o cliente.
- **Proceso de venta:** Al confirmar, llama a `processSale()` y recarga las variantes para actualizar stock local. Si la recarga falla, se muestra el éxito de la venta más un toast de advertencia aparte (nunca como error de venta). Los errores del backend (400 sin caja abierta, 409 stock insuficiente, 404, 422) se muestran con su `detail` en un toast.
- **Código (`features/ventas`):** `useNewSale` concentra el estado (carga, carrito, cobro e idempotencia); `cart.ts` tiene la lógica pura del carrito (testeada); componentes `SkuScanner`, `CartTable`, `CheckoutPanel`, `ClientSelectorModal`.

### 3. `/dashboard/caja` — Gestión de Caja
- Maneja sesiones de caja (turnos).
- **Estados de caja:** `abierta` | `cerrada`
- **Apertura:** Formulario con monto inicial → `openRegister()` (solo envía `monto_apertura`; el `usuario_id` sale del token). El monto se valida con `parseMoneyInput`.
- **Cierre:** Formulario con monto real en efectivo + observaciones → `closeRegister()`. El monto se valida con `parseMoneyInput` (sin NaN, ≥ 0) y el modal de confirmación muestra el efectivo esperado y la diferencia (real − esperado).
- **Movimientos:** Ingresos y egresos manuales (`createCashMovement()`).
- **Efectivo esperado:** viene de `fetchCashSummary()` → `GET /caja/resumen` (autoritativo en el backend: apertura + ventas en efectivo de ESTA sesión + ingresos − egresos). La tarjeta muestra el desglose: apertura, ventas en efectivo, tarjeta, QR, ingresos, egresos y efectivo esperado. Se refresca tras cada movimiento y con `refreshTrigger`.
- **Sesiones anteriores (solo admin):** el botón y el modal con el historial de sesiones y sus movimientos solo se muestran a admin (`/caja/sesiones*` es admin en el backend). El resto de la página es igual para ambos roles.
- **Código (`features/caja`):** `useCashSession` (estado, movimientos, resumen, `refresh`) y `useSessionsHistory`; componentes `OpenRegisterForm`, `CashSummaryCards`, `ShiftSalesSummary`, `MovementsTable`, `CloseRegisterForm` (confirma con `ConfirmDialog`), `MovementModal`, `SessionsHistoryModal`.

### 4. `/dashboard/productos` — Gestión de Productos
- **empleado:** solo consulta (búsqueda, tabla de variantes con precio de venta, stock y alerta de stock bajo); sin costos, márgenes ni acciones de escritura. **admin:** todo lo de abajo.
- Modelo: `Producto` (nombre, descripción, marca_id) tiene N `Variantes` (SKU, talle, color, precio_costo, precio_venta, stock_actual, stock_minimo).
- Lista expandible: click en producto muestra tabla de variantes con margen calculado localmente `((venta - costo) / venta * 100)`.
- Alerta visual de stock bajo: si `stock_actual <= stock_minimo`.
- **CRUD de productos:** Modal crear/editar (nombre + descripción).
- **CRUD de variantes:** Modal crear/editar. El `stock_actual` está **deshabilitado en modo edición** porque la API no lo acepta en el endpoint PATCH de variantes.
- **Ajuste de stock:** `adjustStock()` → `PATCH /productos/inventario/stock`.
- **Borrado (solo admin):** `deleteProduct()` / `deleteVariant()`. El backend responde 409 si la variante tiene ventas asociadas.
- Búsqueda local client-side por nombre o SKU.
- **Código (`features/productos`):** `useProducts`; componentes `ProductCard`, `VariantsTable`, `ProductModal`, `VariantModal`, `StockAdjustModal`; el borrado usa `DeleteConfirmDialog`.

### 5. `/dashboard/catalogos` — Marcas y Categorías
- Dos listados con modales CRUD: marcas (`nombre`, `contacto_nombre`, `telefono`, `email`) y categorías (`nombre`, `descripcion`, `tiendanube_id`).
- Usa `fetchMarcas/createMarca/updateMarca/deleteMarca` y `fetchCategorias/createCategoria/updateCategoria/deleteCategoria`. Los errores de borrado del backend se muestran en toast.
- **Código (`features/catalogos`):** `useCatalogos`; `CatalogList` (lista genérica), `CatalogFormModal` (shell común) + `MarcaFormModal` / `CategoriaFormModal`; el borrado usa `DeleteConfirmDialog`.
- Visible para todos los roles: **empleado = solo lectura** (se ocultan crear/editar/borrar); **admin** puede crear, editar y borrar.

### 6. `/dashboard/clientes` — Gestión de Clientes
- Tabla con columnas: Cliente (nombre + DNI/CUIT), Contacto (email + teléfono), Ubicación (dirección + ciudad).
- Búsqueda server-side: el term se pasa como query param al backend (`?query=`).
- **Campos del cliente:** nombre*, dni_cuit, email, telefono, direccion, ciudad, tipo_iva.
- **Condición IVA (tipo_iva):** Opciones fijas: `Consumidor Final`, `Monotributista`, `Responsable Inscripto`, `Exento`.
- **Código (`features/clientes`):** `useClients`; componentes `ClientsTable`, `ClientModal`.

### 7. `/dashboard/reportes` — Reportes (solo admin)
- Filtro por rango de fechas (`fecha_inicio`, `fecha_fin`). Los montos se muestran en pesos enteros con `formatWholeMoney` (`features/reportes/format.ts`).
- Llama a `fetchReporteVentas()`, `fetchReporteProductosTop()` y `fetchReporteCajas()`.
- ⚠️ Los errores de `fetchReporteProductosTop()` se tragan con `.catch(() => [])`: si el endpoint falla, la tabla aparece vacía sin aviso.

### 8. `/dashboard/usuarios` — Usuarios (solo admin)
- Lista usuarios (`fetchUsers()`) y roles disponibles (`fetchRoles()`).
- Un dropdown por fila cambia el rol con `updateUserRole(id, rol_id)` → `PATCH /usuarios/{id}/rol`.
- Un toggle Activo/Inactivo por fila llama a `updateUserActive(id, activo)` → `PATCH /usuarios/{id}/activo`.
- Ambos cambios piden confirmación (`ConfirmDialog`), **no son optimistas** (el estado local se actualiza con la respuesta del backend; ante error el control vuelve solo) y muestran el `detail` del backend en el toast (409: "No podés quitarte el rol de administrador" / "Debe quedar al menos un administrador activo"; 400: rol inexistente).
- La fila del usuario actual (`useCurrentUser().user.id`) tiene rol y toggle deshabilitados.

---

## Tipos TypeScript Clave (`src/features/<feature>/types.ts`)

```ts
// Productos
Product { id, nombre, descripcion?, marca_id?, variantes: Variant[] }
Variant { id, sku?, talle?, color?, precio_venta, stock_actual, producto_id, precio_costo?, stock_minimo? }
VariantUpdate { sku?, talle?, color?, precio_venta?, precio_costo?, stock_minimo? }
// (sin stock_actual — solo se puede setear al crear)

// Ventas
SaleCreate { cliente_id?, metodo_pago: 'Efectivo'|'Tarjeta'|'QR', items: SaleItemCreate[] }  // sin precios ni total
SaleItemCreate { variante_id, cantidad }
SaleResponse { id, total, metodo_pago, created_at }

// Caja
CashSummary { sesion_id, estado, fecha_apertura, monto_apertura, ventas_efectivo, ventas_tarjeta, ventas_qr, cantidad_ventas, ingresos, egresos, esperado_efectivo }
// fetchCashSummary() devuelve null si no hay caja abierta
CashStatusResponse { id, estado, monto_apertura, fecha_apertura, fecha_cierre?, monto_real_efectivo?, monto_esperado_efectivo?, observaciones?, usuario_id? }
CashMovement { id, sesion_id?, caja_id?, tipo: 'ingreso'|'egreso', monto, motivo?, descripcion?, created_at, usuario_id? }

// Clientes
Client { id, nombre, dni_cuit?, email?, telefono?, direccion?, ciudad?, tipo_iva?, created_at }

// Catálogos
Marca { id, nombre, contacto_nombre?, telefono?, email?, created_at? }
Categoria { id, nombre, descripcion?, tiendanube_id?, created_at? }

// Usuarios
RoleResponse { id, nombre }
UsuarioResponse { id, nombre, apellido?, activo, roles?: RoleResponse, created_at }
MeResponse { id, email, rol, activo? }   // features/auth

// Reportes
VentasTotalesReporte, ProductoTopReporte, CajaResumenDiario, CajaResumenReporte
```

> Nota: `POST /caja/movimiento` no tiene `response_model` y devuelve la fila cruda (`motivo`, `creado_en`); los endpoints de listado sí devuelven `descripcion` y `created_at`. Por eso `CashMovement` declara ambos campos.

---

## Endpoints del Backend (FastAPI en `admin-mu`)

| Módulo | Método | Path |
|---|---|---|
| Ventas | GET | `/api/v1/ventas/hoy` |
| Ventas | POST | `/api/v1/ventas/` |
| Caja | GET | `/api/v1/caja/estado` |
| Caja | GET | `/api/v1/caja/resumen` (`null` si no hay sesión abierta) |
| Caja | POST | `/api/v1/caja/apertura` |
| Caja | POST | `/api/v1/caja/cierre` |
| Caja | GET | `/api/v1/caja/movimientos` |
| Caja | POST | `/api/v1/caja/movimiento` |
| Caja | GET | `/api/v1/caja/sesiones` |
| Caja | GET | `/api/v1/caja/sesiones/{id}/movimientos` |
| Productos | GET | `/api/v1/productos/?categoria_id=` |
| Productos | GET | `/api/v1/productos/sku/{sku}` (no usado por el front) |
| Productos | POST | `/api/v1/productos/` |
| Productos | PATCH | `/api/v1/productos/{id}` |
| Productos | DELETE | `/api/v1/productos/{id}` 🔒 admin |
| Productos | PATCH | `/api/v1/productos/inventario/stock` |
| Variantes | POST | `/api/v1/productos/variante` |
| Variantes | PATCH | `/api/v1/productos/variante/{id}` |
| Variantes | DELETE | `/api/v1/productos/variante/{id}` 🔒 admin (409 si tiene ventas) |
| Clientes | GET | `/api/v1/clientes/?query=` |
| Clientes | POST | `/api/v1/clientes/` |
| Clientes | PATCH | `/api/v1/clientes/{id}` |
| Catálogos | GET / POST | `/api/v1/catalogos/marcas` |
| Catálogos | PATCH / DELETE | `/api/v1/catalogos/marcas/{id}` |
| Catálogos | GET / POST | `/api/v1/catalogos/categorias` |
| Catálogos | PATCH / DELETE | `/api/v1/catalogos/categorias/{id}` |
| Reportes | GET | `/api/v1/reportes/ventas?fecha_inicio=&fecha_fin=` 🔒 admin |
| Reportes | GET | `/api/v1/reportes/productos-top?fecha_inicio=&fecha_fin=` 🔒 admin |
| Reportes | GET | `/api/v1/reportes/cajas?fecha_inicio=&fecha_fin=` 🔒 admin |
| Usuarios | GET | `/api/v1/usuarios/me` |
| Usuarios | GET | `/api/v1/usuarios/` 🔒 admin |
| Usuarios | GET | `/api/v1/usuarios/roles` 🔒 admin |
| Usuarios | PATCH | `/api/v1/usuarios/{id}/rol` 🔒 admin |

---

## Design System

### Paleta de Colores
- **Brand:** Naranja — `#ea580c` (Orange-600 en Tailwind)
- **Brand light:** `#fb923c` (Orange-400)
- **Brand dark:** `#c2410c` (Orange-700)
- **Brand hover:** `#f97316` (Orange-500)
- **Light theme bg:** `#f8fafc` (Slate-50)
- **Dark theme bg:** `#09090b` (Zinc-950), cards: `#18181b` (Zinc-900)

### Variables CSS custom (`@theme inline` en `globals.css`)
```css
--color-brand        /* naranja principal */
--color-brand-light  /* naranja claro */
--color-brand-dark   /* naranja oscuro */
--color-brand-hover  /* naranja hover */
```

### Convenciones de estilo
- Bordes redondeados: `rounded-xl` / `rounded-2xl` (radius base: `0.75rem`)
- Sombras de brand: `shadow-brand/25`
- Transiciones: `transition-all duration-200/300`
- Fuente: **Lexend** (variable CSS, cargada en el root layout)
- Modo oscuro: clase `.dark` en `<html>` vía `next-themes`

---

## Convenciones de Desarrollo

1. **Todas las páginas del dashboard son `'use client'`** — no hay Server Components en las páginas de features.
2. **Feature folders + contenedor/presentacional:** cada módulo vive en `src/features/<feature>/` (ver "Anatomía de una feature"). `app/dashboard/<x>/page.tsx` solo renderiza el contenedor. No definir modales ni sub-componentes dentro de las páginas; apuntar a archivos de menos de ~250 líneas.
3. **No hay state management global** (sin Zustand/Redux). Todo el estado es local con `useState`.
4. **Carga y refresh de datos:** en hooks de la feature (`use-*.ts`) que exponen `reload()`/`refresh()`; los contenedores los llaman tras cada mutación.
5. **Dinero:** usar siempre `formatMoney` (muestra `$1.234,50`), `roundMoney` (redondeo a 2 decimales sin drift de float) y `parseMoneyInput` (acepta `1234.5`, `1234,5`, `1.234,50`; `null` si es inválido o negativo) de `@/lib/money`. No usar `toLocaleString` suelto ni `Number(input)` para montos. Única excepción: los reportes usan `formatWholeMoney` (pesos enteros).
6. **Skeleton loaders:** Usar el componente `<Skeleton>` de `@/components/ui/skeleton` mientras cargan los datos.
7. **Toasts:** Usar `toast.error()` / `toast.success()` de **Sonner** para feedback al usuario.
8. **Bloques `catch`:** Usar `catch (error: unknown)` (nunca `any`) y obtener el mensaje con `getErrorMessage(error, 'mensaje por defecto')` de `@/lib/errors`.
9. **Roles:** leer el rol con `useCurrentUser()` (nunca `fetchMe()` en páginas) y proteger páginas solo-admin con `<AdminOnly>` (ambos de `@/features/auth`).
10. **Llamadas al backend:** siempre desde el `api.ts` de la feature con `apiJson<T>(path, fallback, { method, body, headers })` (o `apiFetch` si no hay body de respuesta, p. ej. DELETE). No usar `fetch` directo en componentes.
11. **Modales:** usar siempre `<Modal onClose labelledBy className>` de `@/components/ui/modal` (nunca un overlay `fixed inset-0` propio). Da `role="dialog"`, `aria-modal`, `aria-labelledby`, cierre con Escape y click en el fondo (salvo `dismissible={false}`), foco dentro del diálogo y devolución del foco al cerrar. El título lleva `id={useId()}` y se pasa en `labelledBy`; `className` define el panel; `backdrop="strong"` oscurece más el fondo. Se abre renderizándolo condicionalmente.
12. **Confirmaciones:** usar `<ConfirmDialog title message confirmLabel cancelLabel destructive loading icon onConfirm onCancel>` (nunca `window.confirm`). Para borrados, `<DeleteConfirmDialog label loading onConfirm onCancel>`. Con `loading` los botones se deshabilitan y no se puede cerrar.
13. **UI compartida:** listas vacías con `<EmptyState icon message>` y errores de formulario con `<FormError message>` de `@/components/ui`.

---

## Limitaciones y Notas Importantes

### Frontend
- ⚠️ **Stock en edición de variante:** El campo `stock_actual` está deshabilitado en el modal de edición porque el endpoint PATCH de variantes no lo acepta. Para ajustar stock se usa el endpoint `/api/v1/productos/inventario/stock`.
- ✅ **Saldo de caja:** el efectivo esperado se obtiene de `GET /caja/resumen` e incluye las ventas en efectivo de la sesión.
- ⚠️ **Métodos de pago:** Son strings estáticos (`'Efectivo'`, `'Tarjeta'`, `'QR'`). No son configurables desde la UI.
- ℹ️ **Módulo Configuración:** El sidebar tiene un link a `/dashboard/settings` (`layout.tsx`) pero la página no existe.
- ℹ️ **Categorías de productos:** El backend tiene la tabla `producto_categorias` (N:M) y el filtro `?categoria_id=`, pero `ProductCreate`/`ProductResponse` no tienen campo de categoría: desde la UI no se puede asignar una categoría a un producto.
- ℹ️ La búsqueda de productos en `/dashboard/productos` es **client-side** (filtra el array local). La búsqueda de clientes en `/dashboard/clientes` es **server-side** (llama al backend con el query).

### Backend (`admin-mu`)
- ⚠️ **Descuento de stock no atómico (vigente):** Al crear una venta, el stock se descuenta con SELECT + UPDATE separados por cada item, sin transacción (`venta_service.py`). Hay riesgo de race condition con ventas concurrentes, y una falla a mitad de camino deja la venta parcialmente aplicada. `ProductService.update_stock` usa el mismo patrón read-modify-write.
- ⚠️ **Sesión de caja global:** `get_sesion_activa` no filtra por usuario: hay una única caja abierta para todos.
- ✅ **`usuario_id` en apertura de caja:** ahora sale del token; el front ya no lo envía.
- ℹ️ **Fechas:** `GET /ventas/hoy` usa la fecha local del servidor y los rangos de reportes usan timestamps sin zona horaria.
- ✅ **Resueltos:** `GET /reportes/productos-top` ya consulta `venta_detalle` y `producto_variantes`, y `ventas.total_costo` ya se calcula a partir de `precio_costo`.

---

## Comandos Útiles

```bash
# Desarrollo (desde c:\Proyectos\Personal\pos-mu)
npm run dev        # Inicia Next.js en puerto 3000 (o el siguiente libre)
npm run lint       # ESLint (debe terminar sin errores ni warnings)
npm run typecheck  # tsc --noEmit
npm test           # Vitest (una pasada); npm run test:watch para modo watch
npm run build      # Build de producción

# El backend FastAPI debe estar corriendo en paralelo:
# cd c:\Proyectos\Personal\admin-mu
# uvicorn app.main:app --reload   →  http://127.0.0.1:8000
```
