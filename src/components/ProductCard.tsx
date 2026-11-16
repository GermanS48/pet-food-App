import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import { formatPrice, formatRating } from '../lib/format'
import { CartIcon, StarIcon } from './Icons'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { add } = useCart()
  const hasExternalLink = Boolean(product.externalUrl && product.externalUrl !== '#')
  const categoryLabel = product.category === 'perros' ? 'Perros' : 'Gatos'

  const image = (
    <img
      src={product.imageUrl}
      alt={product.name}
      width="400"
      height="400"
      loading={index < 4 ? 'eager' : 'lazy'}
      decoding="async"
    />
  )

  return (
    <article className="product-card">
      <div className="product-media">
        {product.featured && <span className="product-badge">Destacado</span>}
        {hasExternalLink ? (
          <a
            href={product.externalUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver ${product.name} en el sitio del vendedor`}
          >
            {image}
          </a>
        ) : (
          image
        )}
      </div>

      <div className="product-body">
        <span className="product-category">{categoryLabel}</span>

        <h3 className="product-title">
          {hasExternalLink ? (
            <a href={product.externalUrl ?? '#'} target="_blank" rel="noopener noreferrer">
              {product.name}
            </a>
          ) : (
            product.name
          )}
        </h3>

        <div className="product-meta">
          {product.rating != null && (
            <span className="rating">
              <StarIcon />
              {formatRating(product.rating)}
              {product.reviewsCount > 0 && (
                <span className="rating-count">({product.reviewsCount})</span>
              )}
            </span>
          )}
          {product.seller && <span className="seller">Por {product.seller}</span>}
        </div>

        <div className="product-footer">
          <span className="price">{formatPrice(product.price)}</span>
          <button
            type="button"
            className="add-btn"
            onClick={() => add(product)}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <CartIcon />
            Agregar
          </button>
        </div>
      </div>
    </article>
  )
}
