import { supabase } from '../lib/supabase'
import { slugify } from '../lib/slug'
import type { Category } from '../types'

export interface AdminProduct {
  id: number
  nombre: string
  slug: string
  categoria: Category
  precio: number
  moneda: string
  imagen_url: string | null
  enlace: string | null
  vendedor: string | null
  calificacion: number | null
  total_calificaciones: number
  cuotas: string | null
  envio: string | null
  envio_desde: string | null
  descuento: string | null
  etiqueta: string | null
  promocion: string | null
  promocion_url: string | null
  destacado: boolean
  activo: boolean
  updated_at: string | null
}

export interface AdminProductInput {
  nombre: string
  slug?: string
  categoria: Category
  precio: number
  moneda: string
  imagen_url: string
  enlace: string
  vendedor: string
  calificacion: string
  total_calificaciones: string
  cuotas: string
  envio: string
  envio_desde: string
  descuento: string
  etiqueta: string
  promocion: string
  promocion_url: string
  destacado: boolean
  activo: boolean
}

const ADMIN_COLUMNS =
  'id,nombre,slug,categoria,precio,moneda,imagen_url,enlace,vendedor,calificacion,total_calificaciones,cuotas,envio,envio_desde,descuento,etiqueta,promocion,promocion_url,destacado,activo,updated_at'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Completá las variables de entorno para usar la administración.')
  }
  return supabase
}

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toInputNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function toPayload(input: AdminProductInput) {
  const nombre = input.nombre.trim()
  const slug = (input.slug?.trim() || slugify(nombre)).slice(0, 120)
  if (!nombre) throw new Error('El nombre es obligatorio.')
  if (!slug) throw new Error('El slug es obligatorio.')
  if (!Number.isFinite(input.precio) || input.precio <= 0) {
    throw new Error('El precio debe ser mayor a 0.')
  }

  const calificacion = toInputNumber(input.calificacion)
  if (calificacion != null && (calificacion < 0 || calificacion > 5)) {
    throw new Error('La calificación debe estar entre 0 y 5.')
  }

  const totalCalificaciones = toInputNumber(input.total_calificaciones) ?? 0
  if (totalCalificaciones < 0) {
    throw new Error('El total de calificaciones no puede ser negativo.')
  }

  return {
    nombre,
    slug,
    categoria: input.categoria,
    precio: Number(input.precio.toFixed(2)),
    moneda: input.moneda.trim() || 'ARS',
    imagen_url: normalizeOptional(input.imagen_url),
    enlace: normalizeOptional(input.enlace),
    vendedor: normalizeOptional(input.vendedor),
    calificacion,
    total_calificaciones: Math.round(totalCalificaciones),
    cuotas: normalizeOptional(input.cuotas),
    envio: normalizeOptional(input.envio),
    envio_desde: normalizeOptional(input.envio_desde),
    descuento: normalizeOptional(input.descuento),
    etiqueta: normalizeOptional(input.etiqueta),
    promocion: normalizeOptional(input.promocion),
    promocion_url: normalizeOptional(input.promocion_url),
    destacado: Boolean(input.destacado),
    activo: Boolean(input.activo),
    updated_at: new Date().toISOString(),
  }
}

function mapAdminRow(row: Record<string, unknown>): AdminProduct {
  return {
    id: Number(row.id),
    nombre: String(row.nombre ?? ''),
    slug: String(row.slug ?? ''),
    categoria: (row.categoria as Category) ?? 'perros',
    precio: Number(row.precio ?? 0),
    moneda: String(row.moneda ?? 'ARS'),
    imagen_url: (row.imagen_url as string | null) ?? null,
    enlace: (row.enlace as string | null) ?? null,
    vendedor: (row.vendedor as string | null) ?? null,
    calificacion: row.calificacion == null ? null : Number(row.calificacion),
    total_calificaciones: Number(row.total_calificaciones ?? 0),
    cuotas: (row.cuotas as string | null) ?? null,
    envio: (row.envio as string | null) ?? null,
    envio_desde: (row.envio_desde as string | null) ?? null,
    descuento: (row.descuento as string | null) ?? null,
    etiqueta: (row.etiqueta as string | null) ?? null,
    promocion: (row.promocion as string | null) ?? null,
    promocion_url: (row.promocion_url as string | null) ?? null,
    destacado: Boolean(row.destacado),
    activo: row.activo !== false,
    updated_at: (row.updated_at as string | null) ?? null,
  }
}

export async function listAdminProducts(): Promise<AdminProduct[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('productos')
    .select(ADMIN_COLUMNS)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .order('id', { ascending: false })

  if (error) throw new Error(`No pudimos cargar los productos: ${error.message}`)
  return ((data as Record<string, unknown>[] | null) ?? []).map(mapAdminRow)
}

export async function createAdminProduct(input: AdminProductInput): Promise<AdminProduct> {
  const client = requireSupabase()
  const payload = toPayload(input)
  const { data, error } = await client
    .from('productos')
    .insert(payload)
    .select(ADMIN_COLUMNS)
    .single()

  if (error) throw new Error(`No pudimos crear el producto: ${error.message}`)
  return mapAdminRow(data as Record<string, unknown>)
}

export async function updateAdminProduct(
  id: number,
  input: AdminProductInput,
): Promise<AdminProduct> {
  const client = requireSupabase()
  const payload = toPayload(input)
  const { data, error } = await client
    .from('productos')
    .update(payload)
    .eq('id', id)
    .select(ADMIN_COLUMNS)
    .single()

  if (error) throw new Error(`No pudimos actualizar el producto: ${error.message}`)
  return mapAdminRow(data as Record<string, unknown>)
}

export async function deleteAdminProduct(id: number): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('productos').delete().eq('id', id)
  if (error) throw new Error(`No pudimos borrar el producto: ${error.message}`)
}
