# PET FOOD

Tienda de alimento y productos para perros y gatos, reescrita con **React + TypeScript** y con el backend preparado para **Supabase**.

La aplicación incluye catálogo, búsqueda, carrito persistente, checkout, contacto y entregas. Funciona en **modo demo** sin credenciales y se conecta a Supabase apenas se configuran las variables de entorno.

## Stack

- **React 19** + **TypeScript 5.9**
- **Vite 8**
- **React Router 7** con `HashRouter` (compatible con hosting estático)
- **Supabase** (`@supabase/supabase-js`): catálogo, pedidos y mensajes de contacto
- CSS propio, sin Bootstrap ni jQuery

## Estado actual

| Parte | Estado |
| --- | --- |
| Frontend React/TS | ✅ Completo y compilando |
| Catálogo demo | ✅ 59 productos normalizados (27 perros / 32 gatos) |
| Carrito | ✅ Persistente en `localStorage` |
| Checkout | ✅ Validación, resumen y confirmación por WhatsApp |
| Contacto | ✅ Formulario y aviso de envío |
| Migración Supabase | ✅ `supabase/migrations/20261116000000_init.sql` |
| Seed Supabase | ✅ `supabase/seed.sql` |
| Conexión real a Supabase | ✅ Proyecto `lotlwhwbnvrvxflyhgkq`; falta ejecutar migración + seed |
| Deploy | ⚠️ Configurado para Netlify / Vercel / GitHub Pages; requiere publicar |

Sin variables de entorno, la app usa el catálogo local `src/data/demo-products.json` y guarda pedidos/mensajes en `localStorage`. En modo demo el pedido **no llega a la base**; la pantalla final permite enviarlo por WhatsApp y avisa que se guardó en el dispositivo.

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0`
- npm 10+
- Un proyecto de Supabase (para el modo conectado)

## Desarrollo local

```bash
npm install
cp .env.example .env.local
# completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (opcional)
npm run dev
```

Abrí la URL que muestra Vite (por defecto `http://localhost:5173`).

### Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Typecheck + build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm run typecheck` | Sólo verificación de TypeScript |
| `npm run generate:data` | Regenera el catálogo demo y `supabase/seed.sql` desde los JSON de origen |

> El build usa `base: './'`, así que los assets funcionan tanto en la raíz de un dominio como en un subdirectorio (por ejemplo GitHub Pages).

## Conectar Supabase

### 1. Crear el proyecto

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto.
2. En **Project Settings → API** copiá:
   - `Project URL`
   - `anon public key`

### 2. Crear las tablas

En el **SQL Editor** del proyecto, ejecutá primero la migración:

```text
supabase/migrations/20261116000000_init.sql
```

Después ejecutá el seed del catálogo:

```text
supabase/seed.sql
```

El seed es idempotente: usa `on conflict (slug) do update`, por lo que se puede volver a correr.

También podés usar la CLI de Supabase si la tenés instalada y el proyecto vinculado:

```bash
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

### 3. Configurar variables

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Reiniciá `npm run dev`. El catálogo se leerá desde la tabla `productos` y los pedidos/mensajes se guardarán en Supabase.

> Las variables `VITE_*` se incorporan al build. No pongas la `service_role` key en el frontend: sólo se necesita la `anon key`.

## Modelo de datos

El catálogo toma los JSON de origen y los guarda de dos formas complementarias:

- **Columnas legibles** para consultar, filtrar y ordenar desde la app.
- **`datos_originales jsonb`** con el objeto exacto tal como viene en los JSON de productos.

```text
productos       catálogo público (columnas legibles + datos_originales jsonb)
pedidos         cabecera del pedido (cliente, entrega, total, estado)
pedido_items    detalle del pedido + subtotal calculado
mensajes        mensajes del formulario de contacto
```

### Columnas de `productos`

| Columna | Origen en el JSON |
| --- | --- |
| `nombre` | `poly-component__title` |
| `precio` | `andes-money-amount__fraction` normalizado a número |
| `imagen_url` | `poly-component__picture src` |
| `enlace` | `poly-component__title href` |
| `vendedor` | `poly-component__seller` (sin el prefijo `por`) |
| `calificacion` | `poly-reviews__rating` |
| `total_calificaciones` | `poly-reviews__total` |
| `cuotas` | `poly-price__installments` |
| `envio` | `poly-shipping--next_day` |
| `envio_desde` | `poly-component__shipped-from` |
| `descuento` | `andes-money-amount__discount` |
| `etiqueta` | `poly-component__highlight` |
| `promocion` / `promocion_url` | `poly-component__ads-promotions` (+ `href`) |
| `destacado` | presencia en `galeria.json` |
| `datos_originales` | objeto JSON completo, sin modificar |

Además hay columnas de control: `id`, `slug`, `categoria` (`perros` / `gatos`), `moneda`, `activo`, `created_at` y `updated_at`.

### Seguridad

- **RLS activado** en las cuatro tablas.
- `productos`: lectura pública sólo de productos `activo = true`.
- `mensajes`: inserción pública validada (nombre, email y mensaje); no hay lectura pública.
- `pedidos` y `pedido_items`: sin políticas públicas, no se pueden leer ni escribir directamente desde el cliente.
- Los pedidos se crean mediante la función `crear_pedido(payload jsonb)` (`security definer`):
  - valida nombre, teléfono, email, dirección y cantidades;
  - recalcula el total en el servidor;
  - exige un `producto_id` activo y toma **nombre y precio desde `productos`**, ignorando los valores enviados por el cliente;
  - limita el pedido a 50 líneas y cantidades de 1 a 99.

Para revisar pedidos desde el panel de Supabase:

```sql
select p.*, json_agg(i.*) as items
from public.pedidos p
join public.pedido_items i on i.pedido_id = p.id
group by p.id
order by p.created_at desc;
```

## Datos del catálogo

Los JSON originales están en `supabase/data/`:

- `perros-2025-04-29.json`
- `gatos-2025-05-01.json`
- `galeria.json` (define los productos destacados)

`scripts/generate-data.mjs`:

- normaliza títulos, precios (`"60.300"` → `60300`), vendedores y calificaciones;
- elimina duplicados por categoría + nombre + precio;
- genera slugs únicos;
- marca como destacados los productos presentes en `galeria.json`;
- escribe `src/data/demo-products.json` (respaldo con claves en inglés) y `supabase/seed.sql`;
- en el seed, cada fila lleva el objeto original completo en `datos_originales`.

Si actualizás los JSON, volvé a ejecutar:

```bash
npm run generate:data
```

## Deploy

### Netlify

El repo incluye `netlify.toml`.

1. Importá el repositorio en Netlify.
2. Build command: `npm run build` · Publish directory: `dist`.
3. Cargá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en **Site configuration → Environment variables**.
4. Deploy.

### Vercel

El repo incluye `vercel.json`.

1. Importá el repositorio en Vercel.
2. Framework preset: **Vite**.
3. Cargá las dos variables de entorno.
4. Deploy.

### GitHub Pages

El workflow `.github/workflows/deploy.yml` compila y publica en Pages al hacer push a `main`.

1. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. En **Settings → Secrets and variables → Actions**, agregar:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Push a `main` o ejecutar el workflow manualmente.

La app usa `HashRouter` y `base: './'`, por lo que las rutas (`/#/productos/perros`, `/#/carrito`, etc.) funcionan en Pages sin rewrites.

## Estructura

```text
src/
  components/      Layout, Header, Footer, tarjetas, modal, íconos
  context/         CartContext (carrito + avisos)
  data/            Catálogo demo generado
  hooks/           useProducts
  lib/             Supabase, formato, assets, constantes
  pages/           Home, productos, carrito, checkout, entregas, contacto
  services/        products, orders, contact
  styles/          CSS global
  types/           Tipos de dominio
supabase/
  data/            JSON originales
  migrations/      Esquema, RLS y RPC crear_pedido
  seed.sql         Catálogo inicial
scripts/           Generador de datos/seed
legacy/            Sitio estático original conservado como referencia
public/imagenes/   Assets optimizados
```

## Notas

- `legacy/` conserva el sitio anterior (HTML/CSS/JS) para consultar el contenido y el diseño original.
- Las imágenes del catálogo apuntan a URLs externas de MercadoLibre; si una URL deja de estar disponible, reemplazala en `productos.imagen_url` o en el JSON de origen y regenerá los datos.
- El número de WhatsApp y el email de contacto están centralizados en `src/lib/constants.ts`.
- Para cambiar textos de entregas, cobertura o preguntas frecuentes, editá `src/pages/DeliveryPage.tsx`.
