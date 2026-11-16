import type { Category, Product } from '../types'

export interface ProductRow {
  id: string
  name: string
  slug: string
  category: Category
  price: number | string
  image_url: string
  external_url: string | null
  seller: string | null
  rating: number | string | null
  reviews_count: number | null
  featured: boolean | null
}

export function mapProduct(row: ProductRow): Product {
  const price = typeof row.price === 'number' ? row.price : Number(row.price)
  const rating = row.rating == null ? null : Number(row.rating)

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    price: Number.isFinite(price) ? price : 0,
    imageUrl: row.image_url,
    externalUrl: row.external_url || null,
    seller: row.seller || null,
    rating: rating != null && Number.isFinite(rating) ? rating : null,
    reviewsCount: row.reviews_count ?? 0,
    featured: Boolean(row.featured),
  }
}
