import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  CartIcon,
  MinusIcon,
  PawIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
} from '../components/Icons'
import { useCart } from '../context/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatPrice } from '../lib/format'

export function CartPage() {
  usePageTitle('Mi carrito | PET FOOD')
  const { lines, count, subtotal, increment, decrement, remove, clear } = useCart()

  return (
    <div className="cart-page">
      <section className="page-hero page-hero--compact">
        <div className="container page-hero-inner">
          <div>
            <nav className="breadcrumb" aria-label="Miga de pan">
              <Link to="/">Inicio</Link>
              <span aria-hidden="true">/</span>
              <span>Carrito</span>
            </nav>
            <span className="eyebrow">
              <CartIcon />
              Tu compra
            </span>
            <h1>Mi carrito</h1>
            <p>Revisá los productos antes de completar tus datos.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {lines.length === 0 ? (
            <div className="empty-state empty-state--large">
              <span className="empty-state-icon">
                <PawIcon />
              </span>
              <h2>Tu carrito está vacío</h2>
              <p>Sumá productos para perros o gatos y empezá tu pedido.</p>
              <div className="empty-actions">
                <Link className="btn btn--primary" to="/productos/perros">
                  Ver productos para perros
                  <ArrowRightIcon />
                </Link>
                <Link className="btn btn--ghost" to="/productos/gatos">
                  Ver productos para gatos
                </Link>
              </div>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-lines">
                <div className="cart-lines-head">
                  <h2>
                    {count} {count === 1 ? 'producto' : 'productos'} en tu pedido
                  </h2>
                  <button type="button" className="link-danger" onClick={clear}>
                    <TrashIcon />
                    Vaciar carrito
                  </button>
                </div>

                {lines.map(({ product, quantity }) => (
                  <article className="cart-line" key={product.id}>
                    <div className="cart-line-media">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        width="120"
                        height="120"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    <div className="cart-line-info">
                      <span className="product-category">
                        {product.category === 'perros' ? 'Perros' : 'Gatos'}
                      </span>
                      <h3>{product.name}</h3>
                      <span className="cart-unit-price">{formatPrice(product.price)} c/u</span>
                    </div>

                    <div className="qty" aria-label={`Cantidad de ${product.name}`}>
                      <button
                        type="button"
                        onClick={() => decrement(product.id)}
                        aria-label={`Quitar una unidad de ${product.name}`}
                      >
                        <MinusIcon />
                      </button>
                      <span aria-live="polite">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => increment(product.id)}
                        aria-label={`Agregar una unidad de ${product.name}`}
                      >
                        <PlusIcon />
                      </button>
                    </div>

                    <strong className="cart-line-subtotal">
                      {formatPrice(product.price * quantity)}
                    </strong>

                    <button
                      type="button"
                      className="cart-line-remove"
                      onClick={() => remove(product.id)}
                      aria-label={`Eliminar ${product.name} del carrito`}
                    >
                      <TrashIcon />
                    </button>
                  </article>
                ))}

                <Link className="link-more cart-continue" to="/productos/perros">
                  Seguir comprando
                  <ArrowRightIcon />
                </Link>
              </div>

              <aside className="summary-card" aria-label="Resumen del pedido">
                <h2>Resumen</h2>
                <div className="summary-row">
                  <span>Productos</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Envío</span>
                  <span className="summary-soft">A coordinar</span>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <Link className="btn btn--primary btn--full" to="/checkout">
                  Continuar con los datos
                  <ArrowRightIcon />
                </Link>
                <p className="summary-note">
                  <TruckIcon />
                  El costo de envío se coordina por WhatsApp según tu zona.
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
