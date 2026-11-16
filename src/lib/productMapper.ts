import type { Category, Product } from '../types'

/** Fila de public.productos (columnas legibles + JSON original en la base). */
export interface ProductoRow {
  id: string | number
  nombre: string
  slug: string
  categoria: Category
  precio: number | string
  imagen_url: string | null
  enlace: string | null
  vendedor: string | null
  calificacion: number | string | null
  total_calificaciones: number | null
  destacado: boolean | null
}

/**
 * Fila del catálogo local (src/data/demo-products.json), que conserva las
 * claves en inglés para no reescribir los datos de respaldo.
 */
export interface DemoProductRow {
  id: string
  name: string
  slug: string
  category: Category
  price: number
  image_url: string
  external_url: string | null
  seller: string | null
  rating: number | null
  reviews_count: number
  featured: boolean
}

function toNumber(value: number | string | null, fallback = 0): number {
  if (value == null) return fallback
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function mapProducto(row: ProductoRow): Product {
  const calificacion = row.calificacion == null ? null : toNumber(row.calificacion)

  return {
    id: String(row.id),
    name: row.nombre,
    slug: row.slug,
    category: row.categoria,
    price: toNumber(row.precio),
    imageUrl: row.imagen_url ?? '',
    externalUrl: row.enlace || null,
    seller: row.vendedor || null,
    rating: calificacion != null && calificacion > 0 ? calificacion : null,
    reviewsCount: row.total_calificaciones ?? 0,
    featured: Boolean(row.destacado),
  }
}

export function mapDemoProduct(row: DemoProductRow): Product {
  const rating = row.rating == null ? null : toNumber(row.rating)

  return {
    id: String(row.id),
    name: row.name,
    slug: row.slug,
    category: row.category,
    price: toNumber(row.price),
    imageUrl: row.image_url ?? '',
    externalUrl: row.external_url || null,
    seller: row.seller || null,
    rating: rating != null && rating > 0 ? rating : null,
    reviewsCount: row.reviews_count ?? 0,
    featured: Boolean(row.featured),
  }
}
