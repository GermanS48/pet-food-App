import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ProductGrid } from '../components/ProductGrid'
import { PawIcon, SearchIcon } from '../components/Icons'
import { useProducts } from '../hooks/useProducts'
import { usePageTitle } from '../hooks/usePageTitle'
import { normalizeText } from '../lib/format'
import type { Category } from '../types'

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating'

const CATEGORY_INFO: Record<
  Category,
  { title: string; label: string; description: string; other: { to: string; label: string } }
> = {
  perros: {
    title: 'Productos para perros',
    label: 'Perros',
    description:
      'Alimento balanceado, húmedo y productos seleccionados para cachorros, adultos y perros mayores.',
    other: { to: '/productos/gatos', label: 'Ver gatos' },
  },
  gatos: {
    title: 'Productos para gatos',
    label: 'Gatos',
    description:
      'Opciones húmedas y secas para gatitos y gatos adultos, con alternativas para necesidades especiales.',
    other: { to: '/productos/perros', label: 'Ver perros' },
  },
}

export function ProductsPage() {
  const params = useParams<{ categoria: string }>()
  const isKnownCategory = params.categoria === 'perros' || params.categoria === 'gatos'
  const category: Category = params.categoria === 'gatos' ? 'gatos' : 'perros'
  const info = CATEGORY_INFO[category]

  usePageTitle(`${info.title} | PET FOOD`)

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('featured')

  const { products, loading, error, reload } = useProducts({ category })

  useEffect(() => {
    setSearch('')
    setSort('featured')
  }, [params.categoria])

  const visibleProducts = useMemo(() => {
    const query = normalizeText(search)
    const filtered = query
      ? products.filter((product) => {
          const haystack = normalizeText(`${product.name} ${product.seller ?? ''}`)
          return haystack.includes(query)
        })
      : [...products]

    switch (sort) {
      case 'price-asc':
        return filtered.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return filtered.sort((a, b) => b.price - a.price)
      case 'rating':
        return filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      default:
        return filtered
    }
  }, [products, search, sort])

  if (!isKnownCategory) {
    return <Navigate to="/productos/perros" replace />
  }

  return (
    <div className="products-page">
      <section className="page-hero">
        <div className="container page-hero-inner">
          <div>
            <nav className="breadcrumb" aria-label="Miga de pan">
              <Link to="/">Inicio</Link>
              <span aria-hidden="true">/</span>
              <span>{info.label}</span>
            </nav>
            <span className="eyebrow">
              <PawIcon />
              Catálogo {info.label.toLowerCase()}
            </span>
            <h1>{info.title}</h1>
            <p>{info.description}</p>
          </div>
          <Link className="btn btn--ghost page-hero-other" to={info.other.to}>
            {info.other.label}
          </Link>
        </div>
      </section>

      <section className="section section--products">
        <div className="container">
          <div className="products-toolbar">
            <label className="search-field">
              <span className="visually-hidden">Buscar productos</span>
              <SearchIcon />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por marca o producto…"
                autoComplete="off"
              />
            </label>

            <label className="select-field">
              <span>Ordenar por</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="rating">Mejor valorados</option>
              </select>
            </label>
          </div>

          <p className="results-count" aria-live="polite">
            {loading
              ? 'Cargando productos…'
              : `${visibleProducts.length} ${
                  visibleProducts.length === 1 ? 'producto' : 'productos'
                }`}
          </p>

          <ProductGrid
            products={visibleProducts}
            loading={loading}
            error={error}
            onRetry={reload}
            skeletonCount={9}
            emptyMessage="Probá con otra palabra o revisá el catálogo completo."
          />
        </div>
      </section>
    </div>
  )
}
