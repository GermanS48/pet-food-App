/**
 * Genera:
 *  - src/data/demo-products.json  (catálogo de respaldo cuando no hay Supabase)
 *  - supabase/seed.sql            (datos iniciales para la tabla products)
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

function escapeSql(value) {
  if (value == null) return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}

const gallery = JSON.parse(await readFile(join(root, 'supabase/data/galeria.json'), 'utf8'))
const featuredKeys = new Set(
  gallery.map((item) =>
    [cleanText(item['poly-component__title']), cleanText(item['andes-money-amount__fraction'])].join('|'),
  ),
)

const products = []
const seen = new Set()
const usedSlugs = new Set()

for (const source of sources) {
  const rows = JSON.parse(await readFile(join(root, source.file), 'utf8'))
  let index = 0

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
    products.push({
      id: `demo-${source.category}-${index}`,
      name,
      slug,
      category: source.category,
      price,
      image_url: imageUrl,
      external_url: cleanText(raw['poly-component__title href']) || null,
      seller: cleanText(raw['poly-component__seller']).replace(/^por\s+/i, '') || null,
      rating: Number.isFinite(ratingValue) && ratingValue > 0 ? ratingValue : null,
      reviews_count: parseIntSafe(raw['poly-reviews__total']),
      featured: featuredKeys.has([name, rawPrice].join('|')),
    })
  }
}

products.sort((a, b) => {
  if (a.featured !== b.featured) return a.featured ? -1 : 1
  if (a.category !== b.category) return a.category === 'perros' ? -1 : 1
  return a.name.localeCompare(b.name, 'es')
})

await mkdir(join(root, 'src/data'), { recursive: true })
await writeFile(join(root, 'src/data/demo-products.json'), JSON.stringify(products, null, 2) + '\n')

const columns = [
  'name',
  'slug',
  'category',
  'price',
  'image_url',
  'external_url',
  'seller',
  'rating',
  'reviews_count',
  'featured',
]

const values = products
  .map((product) => {
    const row = [
      escapeSql(product.name),
      escapeSql(product.slug),
      escapeSql(product.category),
      product.price,
      escapeSql(product.image_url),
      escapeSql(product.external_url),
      escapeSql(product.seller),
      product.rating == null ? 'null' : product.rating,
      product.reviews_count,
      product.featured ? 'true' : 'false',
    ]
    return `  (${row.join(', ')})`
  })
  .join(',\n')

const seed = `-- Datos iniciales de PET FOOD. Generado por scripts/generate-data.mjs.
-- Ejecutar después de la migración: supabase db push / SQL Editor.

insert into public.products (${columns.join(', ')})
values
${values}
on conflict (slug) do update set
  name = excluded.name,
  price = excluded.price,
  image_url = excluded.image_url,
  external_url = excluded.external_url,
  seller = excluded.seller,
  rating = excluded.rating,
  reviews_count = excluded.reviews_count,
  featured = excluded.featured,
  category = excluded.category,
  active = true;
`

await writeFile(join(root, 'supabase/seed.sql'), seed)

const featured = products.filter((product) => product.featured).length
console.log(`Productos generados: ${products.length} (perros: ${products.filter((p) => p.category === 'perros').length}, gatos: ${products.filter((p) => p.category === 'gatos').length}, destacados: ${featured})`)
