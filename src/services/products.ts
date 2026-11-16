import demoData from '../data/demo-products.json'
import type { Category, Product } from '../types'
import { mapDemoProduct, mapProducto, type DemoProductRow, type ProductoRow } from '../lib/productMapper'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const demoRows = demoData as unknown as DemoProductRow[]

export interface ProductQuery {
  category?: Category
  featuredOnly?: boolean
  limit?: number
}

const PRODUCT_COLUMNS =
  'id,nombre,slug,categoria,precio,imagen_url,enlace,vendedor,calificacion,total_calificaciones,destacado'

function getDemoProducts(query: ProductQuery): Product[] {
  let products = demoRows.map(mapDemoProduct)

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
    .from('productos')
    .select(PRODUCT_COLUMNS)
    .eq('activo', true)

  if (query.category) request = request.eq('categoria', query.category)
  if (query.featuredOnly) request = request.eq('destacado', true)

  request = request
    .order('destacado', { ascending: false })
    .order('nombre', { ascending: true })

  if (typeof query.limit === 'number') request = request.limit(query.limit)

  const { data, error } = await request
  if (error) {
    throw new Error(`No pudimos cargar los productos: ${error.message}`)
  }

  return (data as ProductoRow[] | null)?.map(mapProducto) ?? []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!supabase) {
    return demoRows.map(mapDemoProduct).find((product) => product.slug === slug) ?? null
  }

  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCT_COLUMNS)
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapProducto(data as ProductoRow) : null
}

export { isSupabaseConfigured }
