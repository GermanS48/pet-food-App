import type { Product } from '../types'
import { ProductCard } from './ProductCard'
import { PawIcon } from './Icons'

interface ProductGridProps {
  products: Product[]
  loading: boolean
  error: string | null
  onRetry: () => void
  emptyMessage?: string
  skeletonCount?: number
}

export function ProductGrid({
  products,
  loading,
  error,
  onRetry,
  emptyMessage = 'No encontramos productos para mostrar.',
  skeletonCount = 8,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="product-grid" aria-busy="true" aria-label="Cargando productos">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <div className="product-card skeleton-card" key={index} aria-hidden="true">
            <div className="skeleton skeleton-media" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line skeleton-line--short" />
            <div className="skeleton skeleton-line skeleton-line--price" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="notice notice--error" role="alert">
        <p>{error}</p>
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">
          <PawIcon />
        </span>
        <h2>Sin resultados</h2>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
}
