import demoData from '../data/demo-products.json'
import type { Category, Product } from '../types'
import { mapProduct, type ProductRow } from '../lib/productMapper'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const demoRows = demoData as unknown as ProductRow[]

export interface ProductQuery {
  category?: Category
  featuredOnly?: boolean
  limit?: number
}

const PRODUCT_COLUMNS =
  'id,name,slug,category,price,image_url,external_url,seller,rating,reviews_count,featured'

function getDemoProducts(query: ProductQuery): Product[] {
  let products = demoRows.map(mapProduct)

  if (query.category) {
    products = products.filter((product) => product.category === query.category)
  }
  if (query.featuredOnly) {
    products = products.filter((product) => product.featured)
  }

  products.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return a.name.localeCompare(b.name, 'es')
  })

  return typeof query.limit === 'number' ? products.slice(0, query.limit) : products
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  if (!supabase) return getDemoProducts(query)

  let request = supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('active', true)

  if (query.category) request = request.eq('category', query.category)
  if (query.featuredOnly) request = request.eq('featured', true)

  request = request.order('featured', { ascending: false }).order('name', { ascending: true })

  if (typeof query.limit === 'number') request = request.limit(query.limit)

  const { data, error } = await request
  if (error) {
    throw new Error(`No pudimos cargar los productos: ${error.message}`)
  }

  return (data as ProductRow[] | null)?.map(mapProduct) ?? []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!supabase) {
    return demoRows.map(mapProduct).find((product) => product.slug === slug) ?? null
  }

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapProduct(data as ProductRow) : null
}

export { isSupabaseConfigured }
