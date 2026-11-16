/**
 * Genera:
 *  - src/data/demo-products.json  (catálogo de respaldo cuando no hay Supabase)
 *  - supabase/seed.sql            (datos iniciales para public.productos)
 *
 * El seed conserva el objeto original de cada producto en la columna
 * datos_originales (jsonb), con las mismas claves de los archivos JSON.
 *
 * Uso: node scripts/generate-data.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const sources = [
  { category: 'perros', file: 'supabase/data/perros-2025-04-29.json' },
  { category: 'gatos', file: 'supabase/data/gatos-2025-05-01.json' },
]

function parsePrice(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (value == null) return 0
  const normalized = String(value)
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const price = Number(normalized)
  return Number.isFinite(price) ? Math.round(price * 100) / 100 : 0
}

function parseIntSafe(value) {
  const digits = String(value ?? '').replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
}

function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function optionalText(value) {
  const text = cleanText(value)
  return text ? text : null
}

function escapeSql(value) {
  if (value == null) return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}

/** Serializa un objeto como jsonb usando dollar-quoting seguro. */
function sqlJsonb(value) {
  const json = JSON.stringify(value)
  let tag = 'petfood'
  while (json.includes(`$${tag}$`)) tag += 'x'
  return `$${tag}$${json}$${tag}$::jsonb`
}

const gallery = JSON.parse(await readFile(join(root, 'supabase/data/galeria.json'), 'utf8'))
const featuredKeys = new Set(
  gallery.map((item) =>
    [cleanText(item['poly-component__title']), cleanText(item['andes-money-amount__fraction'])].join('|'),
  ),
)

const products = []
const seedRows = []
const seen = new Set()
const usedSlugs = new Set()

let index = 0

for (const source of sources) {
  const rows = JSON.parse(await readFile(join(root, source.file), 'utf8'))

  for (const raw of rows) {
    const name = cleanText(raw['poly-component__title'])
    const rawPrice = cleanText(raw['andes-money-amount__fraction'])
    const price = parsePrice(rawPrice)
    const imageUrl = cleanText(raw['poly-component__picture src'])
    if (!name || !imageUrl || price <= 0) continue

    const key = [source.category, name, rawPrice].join('|')
    if (seen.has(key)) continue
    seen.add(key)

    index += 1
    const baseSlug = slugify(name) || `${source.category}-${index}`
    let slug = baseSlug
    let suffix = 2
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`
      suffix += 1
    }
    usedSlugs.add(slug)

    const ratingValue = Number(String(raw['poly-reviews__rating'] ?? '').replace(',', '.'))
    const rating = Number.isFinite(ratingValue) && ratingValue > 0 ? ratingValue : null
    const featured = featuredKeys.has([name, rawPrice].join('|'))

    // Catálogo interno para el modo demo.
    products.push({
      id: `demo-${source.category}-${index}`,
      name,
      slug,
      category: source.category,
      price,
      image_url: imageUrl,
      external_url: optionalText(raw['poly-component__title href']),
      seller: optionalText(raw['poly-component__seller'])?.replace(/^por\s+/i, '') ?? null,
      rating,
      reviews_count: parseIntSafe(raw['poly-reviews__total']),
      featured,
    })

    // Fila para Supabase: columnas legibles + objeto original completo.
    seedRows.push({
      nombre: name,
      slug,
      categoria: source.category,
      precio: price,
      moneda: 'ARS',
      imagen_url: imageUrl,
      enlace: optionalText(raw['poly-component__title href']),
      vendedor: optionalText(raw['poly-component__seller'])?.replace(/^por\s+/i, '') ?? null,
      calificacion: rating,
      total_calificaciones: parseIntSafe(raw['poly-reviews__total']),
      cuotas: optionalText(raw['poly-price__installments']),
      envio: optionalText(raw['poly-shipping--next_day']),
      envio_desde: optionalText(raw['poly-component__shipped-from']),
      descuento: optionalText(raw['andes-money-amount__discount']),
      etiqueta: optionalText(raw['poly-component__highlight']),
      promocion: optionalText(raw['poly-component__ads-promotions']),
      promocion_url: optionalText(raw['poly-component__ads-promotions href']),
      destacado: featured,
      datos_originales: raw,
    })
  }
}

function sortProducts(a, b) {
  if (a.featured !== b.featured) return a.featured ? -1 : 1
  if (a.category !== b.category) return a.category === 'perros' ? -1 : 1
  return a.name.localeCompare(b.name, 'es')
}

products.sort(sortProducts)
seedRows.sort((a, b) => {
  if (a.destacado !== b.destacado) return a.destacado ? -1 : 1
  if (a.categoria !== b.categoria) return a.categoria === 'perros' ? -1 : 1
  return a.nombre.localeCompare(b.nombre, 'es')
})

await mkdir(join(root, 'src/data'), { recursive: true })
await writeFile(join(root, 'src/data/demo-products.json'), JSON.stringify(products, null, 2) + '\n')

const columns = [
  'nombre',
  'slug',
  'categoria',
  'precio',
  'moneda',
  'imagen_url',
  'enlace',
  'vendedor',
  'calificacion',
  'total_calificaciones',
  'cuotas',
  'envio',
  'envio_desde',
  'descuento',
  'etiqueta',
  'promocion',
  'promocion_url',
  'destacado',
  'datos_originales',
]

const values = seedRows
  .map((row) => {
    const items = [
      escapeSql(row.nombre),
      escapeSql(row.slug),
      escapeSql(row.categoria),
      row.precio,
      escapeSql(row.moneda),
      escapeSql(row.imagen_url),
      escapeSql(row.enlace),
      escapeSql(row.vendedor),
      row.calificacion == null ? 'null' : row.calificacion,
      row.total_calificaciones,
      escapeSql(row.cuotas),
      escapeSql(row.envio),
      escapeSql(row.envio_desde),
      escapeSql(row.descuento),
      escapeSql(row.etiqueta),
      escapeSql(row.promocion),
      escapeSql(row.promocion_url),
      row.destacado ? 'true' : 'false',
      sqlJsonb(row.datos_originales),
    ]
    return `  (${items.join(', ')})`
  })
  .join(',\n')

const updates = columns
  .filter((column) => column !== 'slug')
  .map((column) => `  ${column} = excluded.${column}`)
  .join(',\n')

const seed = `-- Datos iniciales de PET FOOD. Generado por scripts/generate-data.mjs.
-- Ejecutar después de la migración: supabase db push / SQL Editor.
-- Cada fila conserva el objeto original del scraping en datos_originales (jsonb).

insert into public.productos (${columns.join(', ')})
values
${values}
on conflict (slug) do update set
${updates},
  activo = true,
  updated_at = now();
`

await writeFile(join(root, 'supabase/seed.sql'), seed)

const featured = products.filter((product) => product.featured).length
console.log(
  `Productos generados: ${products.length} (perros: ${
    products.filter((p) => p.category === 'perros').length
  }, gatos: ${products.filter((p) => p.category === 'gatos').length}, destacados: ${featured})`,
)
