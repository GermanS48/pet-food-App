import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  CheckIcon,
  PawIcon,
  TruckIcon,
  WhatsAppIcon,
} from '../components/Icons'
import { usePageTitle } from '../hooks/usePageTitle'
import { asset } from '../lib/assets'
import { WHATSAPP_INFO_URL } from '../lib/constants'

const STEPS = [
  {
    title: 'Elegí tus productos',
    text: 'Agregá al carrito el alimento o los productos que necesitás.',
  },
  {
    title: 'Completá tus datos',
    text: 'Indicá tu dirección y confirmá el pedido en pocos pasos.',
  },
  {
    title: 'Coordinamos la entrega',
    text: 'Te escribimos por WhatsApp para acordar día, horario y costo del envío.',
  },
]

export function DeliveryPage() {
  usePageTitle('Entregas a domicilio | PET FOOD')

  return (
    <div className="delivery-page">
      <section className="page-hero">
        <div className="container page-hero-inner">
          <div>
            <nav className="breadcrumb" aria-label="Miga de pan">
              <Link to="/">Inicio</Link>
              <span aria-hidden="true">/</span>
              <span>Entregas</span>
            </nav>
            <span className="eyebrow">
              <TruckIcon />
              Servicios
            </span>
            <h1>Entregas a domicilio</h1>
            <p>
              Llevamos tu pedido a tu casa en Moreno y zonas de Gran Buenos Aires. Coordinamos
              todo por WhatsApp.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container delivery-page-grid">
          <div className="map-card">
            <img
              src={asset('imagenes/mapa-delivery.webp')}
              alt="Mapa de la zona de cobertura de entregas de PET FOOD"
              width="1600"
              height="891"
              loading="lazy"
              decoding="async"
            />
            <div className="map-caption">
              <PawIcon />
              <span>
                <strong>Zona de cobertura</strong>
                Moreno y zonas de Gran Buenos Aires
              </span>
            </div>
          </div>

          <div className="delivery-page-content">
            <span className="eyebrow">
              <PawIcon />
              Cómo funciona
            </span>
            <h2>Tu pedido, sin complicaciones</h2>
            <ol className="steps">
              {STEPS.map((step, index) => (
                <li className="step" key={step.title}>
                  <span className="step-number">{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <ul className="check-list">
              <li>
                <CheckIcon />
                Entregas en Moreno y localidades cercanas de GBA.
              </li>
              <li>
                <CheckIcon />
                El costo del envío se informa antes de confirmar.
              </li>
              <li>
                <CheckIcon />
                También podés coordinar el retiro del pedido.
              </li>
            </ul>

            <div className="delivery-page-actions">
              <Link className="btn btn--primary" to="/productos/perros">
                Hacer un pedido
                <ArrowRightIcon />
              </Link>
              <a
                className="btn btn--whatsapp"
                href={WHATSAPP_INFO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon />
                Consultar mi zona
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container faq-wrap">
          <div className="section-head section-head--center">
            <div>
              <span className="eyebrow eyebrow--center">
                <PawIcon />
                Preguntas frecuentes
              </span>
              <h2>Todo lo que necesitás saber</h2>
            </div>
          </div>

          <div className="faq-list">
            <details>
              <summary>¿Cuánto tarda la entrega?</summary>
              <p>
                El tiempo depende de la zona y de la disponibilidad de los productos. Al confirmar
                el pedido coordinamos el día y el horario por WhatsApp.
              </p>
            </details>
            <details>
              <summary>¿Cómo se calcula el costo del envío?</summary>
              <p>
                El costo varía según la distancia y el tamaño del pedido. Te lo informamos antes de
                confirmar la entrega, sin sorpresas.
              </p>
            </details>
            <details>
              <summary>¿Puedo retirar mi pedido?</summary>
              <p>
                Sí. Elegí “Retiro coordinado” al finalizar la compra y acordamos el punto y horario
                por WhatsApp.
              </p>
            </details>
            <details>
              <summary>¿Qué medios de pago aceptan?</summary>
              <p>
                Coordinamos el medio de pago junto con la entrega. Escribinos por WhatsApp si
                tenés una consulta específica.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container mini-cta">
          <div>
            <h2>¿Tenés una consulta sobre tu entrega?</h2>
            <p>Escribinos y te respondemos a la brevedad.</p>
          </div>
          <Link className="btn btn--primary" to="/contacto">
            Contactarnos
            <ArrowRightIcon />
          </Link>
        </div>
      </section>
    </div>
  )
}
