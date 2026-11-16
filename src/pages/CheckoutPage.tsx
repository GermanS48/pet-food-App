import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  CheckIcon,
  PawIcon,
  TruckIcon,
  WhatsAppIcon,
} from '../components/Icons'
import { useCart } from '../context/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatPrice } from '../lib/format'
import { isSupabaseConfigured } from '../lib/supabase'
import { whatsappUrl } from '../lib/constants'
import { createOrder } from '../services/orders'
import type { CheckoutFields, CreatedOrder, DeliveryMethod, OrderItemInput } from '../types'

interface SuccessState {
  order: CreatedOrder
  total: number
  whatsappLink: string
  customerName: string
  deliveryMethod: DeliveryMethod
}

const INITIAL_FIELDS: CheckoutFields = {
  customerName: '',
  phone: '',
  email: '',
  deliveryMethod: 'delivery',
  address: '',
  city: '',
  notes: '',
}

function validate(fields: CheckoutFields): string | null {
  if (fields.customerName.trim().length < 2) {
    return 'Ingresá tu nombre y apellido.'
  }
  if (fields.phone.replace(/\D/g, '').length < 8) {
    return 'Ingresá un teléfono de contacto válido.'
  }
  if (fields.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    return 'El correo electrónico no parece válido.'
  }
  if (fields.deliveryMethod === 'delivery' && fields.address.trim().length < 4) {
    return 'Ingresá la dirección de entrega.'
  }
  if (fields.deliveryMethod === 'delivery' && fields.city.trim().length < 2) {
    return 'Ingresá la localidad de entrega.'
  }
  return null
}

function buildOrderMessage(
  order: CreatedOrder,
  fields: CheckoutFields,
  items: OrderItemInput[],
  total: number,
): string {
  const productLines = items
    .map((item) => `• ${item.quantity} x ${item.name} (${formatPrice(item.unitPrice)})`)
    .join('\n')

  const delivery =
    fields.deliveryMethod === 'delivery'
      ? `Envío a domicilio: ${fields.address}, ${fields.city}`
      : 'Retiro coordinado'

  return [
    `Hola PET FOOD, quiero confirmar mi pedido #${order.id.slice(0, 8).toUpperCase()}.`,
    '',
    productLines,
    '',
    `Total: ${formatPrice(total)}`,
    delivery,
    `Nombre: ${fields.customerName}`,
    `Teléfono: ${fields.phone}`,
    fields.email ? `Email: ${fields.email}` : '',
    fields.notes ? `Notas: ${fields.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export function CheckoutPage() {
  usePageTitle('Finalizar compra | PET FOOD')
  const { lines, subtotal, clear } = useCart()
  const [fields, setFields] = useState<CheckoutFields>(INITIAL_FIELDS)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<SuccessState | null>(null)

  const count = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  )

  function update<K extends keyof CheckoutFields>(key: K, value: CheckoutFields[K]) {
    setFields((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const validationError = validate(fields)
    if (validationError) {
      setError(validationError)
      return
    }

    const items: OrderItemInput[] = lines.map((line) => ({
      productId: line.product.id,
      name: line.product.name,
      unitPrice: line.product.price,
      quantity: line.quantity,
    }))

    setSubmitting(true)
    setError(null)

    try {
      const order = await createOrder({ ...fields, items })
      const message = buildOrderMessage(order, fields, items, order.total)
      setSuccess({
        order,
        total: order.total,
        whatsappLink: whatsappUrl(message),
        customerName: fields.customerName.trim(),
        deliveryMethod: fields.deliveryMethod,
      })
      clear()
      window.scrollTo(0, 0)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos registrar el pedido.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="checkout-page">
        <section className="section">
          <div className="container success-wrap">
            <div className="success-card">
              <span className="success-icon">
                <CheckIcon />
              </span>
              <span className="eyebrow eyebrow--center">
                <PawIcon />
                Pedido registrado
              </span>
              <h1>¡Gracias, {success.customerName.split(' ')[0]}!</h1>
              <p>
                Recibimos tu pedido <strong>#{success.order.id.slice(0, 8).toUpperCase()}</strong>{' '}
                por un total de <strong>{formatPrice(success.total)}</strong>.
              </p>
              <p>
                {success.deliveryMethod === 'delivery'
                  ? 'Ahora enviá el resumen por WhatsApp para coordinar la entrega.'
                  : 'Ahora enviá el resumen por WhatsApp para coordinar el retiro.'}
              </p>

              <div className="success-actions">
                <a
                  className="btn btn--whatsapp"
                  href={success.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon />
                  Enviar pedido por WhatsApp
                </a>
                <Link className="btn btn--ghost" to="/">
                  Volver al inicio
                </Link>
              </div>

              {success.order.demo && (
                <p className="demo-note">
                  Modo demostración: el pedido quedó guardado en este dispositivo. Configurá
                  Supabase para registrarlo en la base de datos.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="checkout-page">
        <section className="page-hero page-hero--compact">
          <div className="container">
            <span className="eyebrow">
              <PawIcon />
              Checkout
            </span>
            <h1>Finalizar compra</h1>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="empty-state empty-state--large">
              <span className="empty-state-icon">
                <PawIcon />
              </span>
              <h2>No hay productos en el carrito</h2>
              <p>Agregá productos antes de completar tus datos de entrega.</p>
              <Link className="btn btn--primary" to="/productos/perros">
                Ir a la tienda
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <section className="page-hero page-hero--compact">
        <div className="container page-hero-inner">
          <div>
            <nav className="breadcrumb" aria-label="Miga de pan">
              <Link to="/">Inicio</Link>
              <span aria-hidden="true">/</span>
              <Link to="/carrito">Carrito</Link>
              <span aria-hidden="true">/</span>
              <span>Checkout</span>
            </nav>
            <span className="eyebrow">
              <PawIcon />
              Último paso
            </span>
            <h1>Finalizar compra</h1>
            <p>Completá tus datos y coordinamos la entrega por WhatsApp.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container checkout-layout">
          <form className="form-card" onSubmit={handleSubmit} noValidate>
            <h2>Datos de contacto</h2>

            {error && (
              <div className="form-alert" role="alert">
                {error}
              </div>
            )}

            <div className="field-row">
              <label className="field">
                <span>Nombre y apellido *</span>
                <input
                  type="text"
                  value={fields.customerName}
                  onChange={(event) => update('customerName', event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
              <label className="field">
                <span>Teléfono *</span>
                <input
                  type="tel"
                  value={fields.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  autoComplete="tel"
                  placeholder="11 2345 6789"
                  required
                />
              </label>
            </div>

            <label className="field">
              <span>Correo electrónico</span>
              <input
                type="email"
                value={fields.email}
                onChange={(event) => update('email', event.target.value)}
                autoComplete="email"
                placeholder="opcional@correo.com"
              />
            </label>

            <fieldset className="field radio-fieldset">
              <legend>¿Cómo querés recibirlo?</legend>
              <div className="radio-group">
                <label className={fields.deliveryMethod === 'delivery' ? 'radio-card is-active' : 'radio-card'}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="delivery"
                    checked={fields.deliveryMethod === 'delivery'}
                    onChange={() => update('deliveryMethod', 'delivery')}
                  />
                  <TruckIcon />
                  <span>
                    <strong>Envío a domicilio</strong>
                    <small>Moreno y Gran Buenos Aires</small>
                  </span>
                </label>
                <label className={fields.deliveryMethod === 'pickup' ? 'radio-card is-active' : 'radio-card'}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={fields.deliveryMethod === 'pickup'}
                    onChange={() => update('deliveryMethod', 'pickup')}
                  />
                  <PawIcon />
                  <span>
                    <strong>Retiro coordinado</strong>
                    <small>Acordamos el punto por WhatsApp</small>
                  </span>
                </label>
              </div>
            </fieldset>

            {fields.deliveryMethod === 'delivery' && (
              <div className="field-row">
                <label className="field">
                  <span>Dirección *</span>
                  <input
                    type="text"
                    value={fields.address}
                    onChange={(event) => update('address', event.target.value)}
                    autoComplete="street-address"
                    placeholder="Calle, número, piso/depto"
                    required
                  />
                </label>
                <label className="field">
                  <span>Localidad *</span>
                  <input
                    type="text"
                    value={fields.city}
                    onChange={(event) => update('city', event.target.value)}
                    autoComplete="address-level2"
                    placeholder="Moreno"
                    required
                  />
                </label>
              </div>
            )}

            <label className="field">
              <span>Notas para el pedido</span>
              <textarea
                value={fields.notes}
                onChange={(event) => update('notes', event.target.value)}
                rows={3}
                placeholder="Horario de entrega, referencias, indicaciones…"
              />
            </label>

            <button className="btn btn--primary btn--full" type="submit" disabled={submitting}>
              {submitting ? 'Registrando pedido…' : 'Confirmar pedido'}
              {!submitting && <ArrowRightIcon />}
            </button>

            <p className="form-note">
              Al confirmar, guardamos tu pedido y te mostramos el resumen para enviarlo por
              WhatsApp.
            </p>
          </form>

          <aside className="summary-card summary-card--checkout" aria-label="Resumen del pedido">
            <h2>Tu pedido</h2>
            <ul className="summary-list">
              {lines.map(({ product, quantity }) => (
                <li key={product.id}>
                  <img
                    src={product.imageUrl}
                    alt=""
                    width="64"
                    height="64"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="summary-item-info">
                    <span>{product.name}</span>
                    <small>
                      {quantity} x {formatPrice(product.price)}
                    </small>
                  </span>
                  <strong>{formatPrice(product.price * quantity)}</strong>
                </li>
              ))}
            </ul>

            <div className="summary-row">
              <span>Productos ({count})</span>
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
            <Link className="link-more" to="/carrito">
              Editar carrito
            </Link>
            {!isSupabaseConfigured && (
              <p className="demo-note demo-note--small">
                Modo demo sin Supabase: el pedido se guarda en este dispositivo y se confirma por
                WhatsApp.
              </p>
            )}
          </aside>
        </div>
      </section>
    </div>
  )
}
