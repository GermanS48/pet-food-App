import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { slugify } from '../lib/slug'
import {
  createAdminProduct,
  deleteAdminProduct,
  listAdminProducts,
  updateAdminProduct,
  type AdminProduct,
  type AdminProductInput,
} from '../services/adminProducts'
import type { Category } from '../types'

const emptyForm: AdminProductInput = {
  nombre: '',
  slug: '',
  categoria: 'perros',
  precio: 0,
  moneda: 'ARS',
  imagen_url: '',
  enlace: '',
  vendedor: '',
  calificacion: '',
  total_calificaciones: '',
  cuotas: '',
  envio: '',
  envio_desde: '',
  descuento: '',
  etiqueta: '',
  promocion: '',
  promocion_url: '',
  destacado: false,
  activo: true,
}

function toForm(product: AdminProduct): AdminProductInput {
  return {
    nombre: product.nombre,
    slug: product.slug,
    categoria: product.categoria,
    precio: product.precio,
    moneda: product.moneda,
    imagen_url: product.imagen_url ?? '',
    enlace: product.enlace ?? '',
    vendedor: product.vendedor ?? '',
    calificacion: product.calificacion != null ? String(product.calificacion) : '',
    total_calificaciones: product.total_calificaciones ? String(product.total_calificaciones) : '',
    cuotas: product.cuotas ?? '',
    envio: product.envio ?? '',
    envio_desde: product.envio_desde ?? '',
    descuento: product.descuento ?? '',
    etiqueta: product.etiqueta ?? '',
    promocion: product.promocion ?? '',
    promocion_url: product.promocion_url ?? '',
    destacado: product.destacado,
    activo: product.activo,
  }
}

export function AdminProductsPage() {
  usePageTitle('Administrar productos | PET FOOD')
  const { user, signOut } = useAuth()

  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [form, setForm] = useState<AdminProductInput>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminProducts()
      setProducts(data)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos cargar los productos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.categoria.includes(q),
    )
  }, [products, search])

  function updateField<K extends keyof AdminProductInput>(key: K, value: AdminProductInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setNotice(null)
    setError(null)
  }

  function startEdit(product: AdminProduct) {
    setEditingId(product.id)
    setForm(toForm(product))
    setNotice(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const payload: AdminProductInput = {
        ...form,
        slug: form.slug || slugify(form.nombre),
      }
      if (editingId == null) {
        const created = await createAdminProduct(payload)
        setProducts((current) => [created, ...current])
        setNotice('Producto creado correctamente.')
        setForm(emptyForm)
      } else {
        const updated = await updateAdminProduct(editingId, payload)
        setProducts((current) => current.map((p) => (p.id === updated.id ? updated : p)))
        setNotice('Producto actualizado correctamente.')
        setEditingId(null)
        setForm(emptyForm)
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos guardar el producto.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product: AdminProduct) {
    const ok = window.confirm(
      `¿Borrar el producto "${product.nombre}"? Esta acción no se puede deshacer.`,
    )
    if (!ok) return
    setDeletingId(product.id)
    setError(null)
    setNotice(null)
    try {
      await deleteAdminProduct(product.id)
      setProducts((current) => current.filter((p) => p.id !== product.id))
      if (editingId === product.id) startCreate()
      setNotice('Producto borrado.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos borrar el producto.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Administrar productos</h1>
            <p className="muted">
              Sesión: <strong>{user?.email ?? 'usuario'}</strong>
            </p>
          </div>
          <div className="admin-header-actions">
            <button type="button" className="btn btn--ghost" onClick={() => void load()}>
              Recargar
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => void signOut()}>
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>{editingId == null ? 'Nuevo producto' : `Editar producto #${editingId}`}</h2>
            {editingId != null && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={startCreate}>
                Cancelar edición
              </button>
            )}
          </div>

          <form className="admin-form admin-form--grid" onSubmit={handleSubmit}>
            <label className="form-field form-field--wide">
              <span>Nombre *</span>
              <input
                required
                value={form.nombre}
                onChange={(e) => {
                  updateField('nombre', e.target.value)
                  if (editingId == null && !form.slug) {
                    updateField('slug', slugify(e.target.value))
                  }
                }}
              />
            </label>

            <label className="form-field">
              <span>Slug</span>
              <input
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="se-genera-desde-el-nombre"
              />
            </label>

            <label className="form-field">
              <span>Categoría *</span>
              <select
                value={form.categoria}
                onChange={(e) => updateField('categoria', e.target.value as Category)}
              >
                <option value="perros">Perros</option>
                <option value="gatos">Gatos</option>
              </select>
            </label>

            <label className="form-field">
              <span>Precio (ARS) *</span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.precio || ''}
                onChange={(e) => updateField('precio', Number(e.target.value))}
              />
            </label>

            <label className="form-field">
              <span>Moneda</span>
              <input value={form.moneda} onChange={(e) => updateField('moneda', e.target.value)} />
            </label>

            <label className="form-field form-field--wide">
              <span>URL de imagen</span>
              <input
                value={form.imagen_url}
                onChange={(e) => updateField('imagen_url', e.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className="form-field form-field--wide">
              <span>Enlace externo</span>
              <input value={form.enlace} onChange={(e) => updateField('enlace', e.target.value)} />
            </label>

            <label className="form-field">
              <span>Vendedor</span>
              <input value={form.vendedor} onChange={(e) => updateField('vendedor', e.target.value)} />
            </label>

            <label className="form-field">
              <span>Calificación (0-5)</span>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.calificacion}
                onChange={(e) => updateField('calificacion', e.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Total calificaciones</span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.total_calificaciones}
                onChange={(e) => updateField('total_calificaciones', e.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Cuotas</span>
              <input value={form.cuotas} onChange={(e) => updateField('cuotas', e.target.value)} />
            </label>

            <label className="form-field">
              <span>Envío</span>
              <input value={form.envio} onChange={(e) => updateField('envio', e.target.value)} />
            </label>

            <label className="form-field">
              <span>Enviado desde</span>
              <input
                value={form.envio_desde}
                onChange={(e) => updateField('envio_desde', e.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Descuento</span>
              <input value={form.descuento} onChange={(e) => updateField('descuento', e.target.value)} />
            </label>

            <label className="form-field">
              <span>Etiqueta</span>
              <input value={form.etiqueta} onChange={(e) => updateField('etiqueta', e.target.value)} />
            </label>

            <label className="form-field">
              <span>Promoción</span>
              <input value={form.promocion} onChange={(e) => updateField('promocion', e.target.value)} />
            </label>

            <label className="form-field">
              <span>URL promoción</span>
              <input
                value={form.promocion_url}
                onChange={(e) => updateField('promocion_url', e.target.value)}
              />
            </label>

            <div className="form-field form-field--checks">
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.destacado}
                  onChange={(e) => updateField('destacado', e.target.checked)}
                />
                <span>Destacado</span>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => updateField('activo', e.target.checked)}
                />
                <span>Activo (visible en catálogo)</span>
              </label>
            </div>

            {error && (
              <p className="form-error form-field--wide" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="form-success form-field--wide" role="status">
                {notice}
              </p>
            )}

            <div className="form-actions form-field--wide">
              <button className="btn btn--primary" type="submit" disabled={saving}>
                {saving ? 'Guardando…' : editingId == null ? 'Crear producto' : 'Guardar cambios'}
              </button>
              {editingId != null && (
                <button type="button" className="btn btn--ghost" onClick={startCreate}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Productos ({products.length})</h2>
            <label className="search-field admin-search">
              <span className="visually-hidden">Buscar</span>
              <input
                type="search"
                placeholder="Buscar por nombre, slug o categoría…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>

          {loading ? (
            <p className="muted">Cargando productos…</p>
          ) : filtered.length === 0 ? (
            <p className="muted">No hay productos para mostrar.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>
                        <div className="admin-product-name">{product.nombre}</div>
                        <div className="admin-product-slug muted">{product.slug}</div>
                      </td>
                      <td>{product.categoria}</td>
                      <td>${product.precio.toLocaleString('es-AR')}</td>
                      <td>
                        <span className={product.activo ? 'badge badge--ok' : 'badge badge--muted'}>
                          {product.activo ? 'Activo' : 'Inactivo'}
                        </span>
                        {product.destacado && <span className="badge badge--accent">Destacado</span>}
                      </td>
                      <td className="admin-actions">
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => startEdit(product)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          disabled={deletingId === product.id}
                          onClick={() => void handleDelete(product)}
                        >
                          {deletingId === product.id ? 'Borrando…' : 'Borrar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
