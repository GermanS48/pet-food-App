import { Link } from 'react-router-dom'
import { HeroVideo } from '../components/HeroVideo'
import { ProductGrid } from '../components/ProductGrid'
import {
  ArrowRightIcon,
  CheckIcon,
  HeartIcon,
  PawIcon,
  ShieldIcon,
  TruckIcon,
} from '../components/Icons'
import { useProducts } from '../hooks/useProducts'
import { usePageTitle } from '../hooks/usePageTitle'
import { asset } from '../lib/assets'

export function HomePage() {
  usePageTitle('PET FOOD | Lo mejor para tu mascota')
  const { products, loading, error, reload } = useProducts({ limit: 8 })

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">
              <PawIcon />
              Alimento y cuidado para perros y gatos
            </span>
            <h1>
              Todo lo que tu <span className="highlight">mascota</span> necesita, en un solo lugar.
            </h1>
            <p className="hero-text">
              Elegí entre las mejores marcas de alimento y productos para perros y gatos. Comprá
              fácil y coordinamos la entrega en Moreno y Gran Buenos Aires.
            </p>
            <div className="hero-actions">
              <Link className="btn btn--primary" to="/productos/perros">
                Comprar para perros
                <ArrowRightIcon />
              </Link>
              <Link className="btn btn--ghost" to="/productos/gatos">
                Ver productos para gatos
              </Link>
            </div>
            <ul className="hero-stats">
              <li>
                <strong>+50</strong>
                <span>productos disponibles</span>
              </li>
              <li>
                <strong>Entrega</strong>
                <span>a domicilio</span>
              </li>
              <li>
                <strong>Atención</strong>
                <span>personalizada</span>
              </li>
            </ul>
          </div>

          <div className="hero-visual">
            <div className="hero-blob" aria-hidden="true" />
            <div className="hero-photo hero-photo--main">
              <HeroVideo
                src="imagenes/happy-couple.mp4"
                poster="imagenes/alimento-perro-cachorro.webp"
                className="hero-video"
              />
            </div>
            <div className="hero-photo hero-photo--small">
              <img
                src={asset('imagenes/gatito-cachorro.webp')}
                alt="Gatito esperando su alimento"
                width="600"
                height="600"
              />
            </div>
            <div className="hero-float-card">
              <span className="hero-float-icon">
                <TruckIcon />
              </span>
              <span>
                <strong>Envío a domicilio</strong>
                <small>Moreno y GBA</small>
              </span>
            </div>
            <span className="hero-paw hero-paw--one" aria-hidden="true">
              <PawIcon />
            </span>
            <span className="hero-paw hero-paw--two" aria-hidden="true">
              <PawIcon />
            </span>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Beneficios de comprar en PET FOOD">
        <div className="container trust-grid">
          <div className="trust-item">
            <span className="trust-icon">
              <TruckIcon />
            </span>
            <div>
              <h2>Entregas a domicilio</h2>
              <p>Coordinamos el envío en Moreno y zonas de GBA.</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">
              <ShieldIcon />
            </span>
            <div>
              <h2>Marcas de confianza</h2>
              <p>Alimento seleccionado de las marcas más elegidas.</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">
              <HeartIcon />
            </span>
            <div>
              <h2>Atención cercana</h2>
              <p>Te ayudamos a elegir lo mejor para tu mascota.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <div>
              <span className="eyebrow eyebrow--center">
                <PawIcon />
                Encontrá lo que buscás
              </span>
              <h2>Elegí por tu mascota</h2>
              <p>Catálogos pensados para perros y gatos, con precios claros y stock actualizado.</p>
            </div>
          </div>

          <div className="category-grid">
            <Link className="category-card" to="/productos/perros">
              <img
                src={asset('imagenes/alimento-perro-cachorro.webp')}
                alt="Alimento para perros"
                width="720"
                height="720"
                loading="lazy"
                decoding="async"
              />
              <span className="category-overlay">
                <span className="category-kicker">Catálogo</span>
                <strong>Perros</strong>
                <span className="category-link">
                  Ver productos
                  <ArrowRightIcon />
                </span>
              </span>
            </Link>

            <Link className="category-card category-card--cat" to="/productos/gatos">
              <img
                src={asset('imagenes/gatito-cachorro.webp')}
                alt="Alimento para gatos"
                width="720"
                height="720"
                loading="lazy"
                decoding="async"
              />
              <span className="category-overlay">
                <span className="category-kicker">Catálogo</span>
                <strong>Gatos</strong>
                <span className="category-link">
                  Ver productos
                  <ArrowRightIcon />
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">
                <PawIcon />
                Los más elegidos
              </span>
              <h2>Destacados de la semana</h2>
              <p>Una selección de los productos favoritos de nuestros clientes.</p>
            </div>
            <Link className="link-more" to="/productos/perros">
              Ver catálogo completo
              <ArrowRightIcon />
            </Link>
          </div>

          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            onRetry={reload}
            emptyMessage="Todavía no hay productos cargados."
          />
        </div>
      </section>

      <section className="section">
        <div className="container delivery-banner">
          <div className="delivery-banner-media">
            <img
              src={asset('imagenes/mapa-delivery.webp')}
              alt="Mapa de la zona de cobertura de entregas"
              width="1600"
              height="891"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="delivery-banner-content">
            <span className="eyebrow">
              <TruckIcon />
              Entregas a domicilio
            </span>
            <h2>Llevamos tu pedido hasta la puerta</h2>
            <p>
              Hacemos entregas en Moreno y zonas de Gran Buenos Aires. Coordinamos día y horario
              por WhatsApp para que no tengas que moverte.
            </p>
            <ul className="check-list">
              <li>
                <CheckIcon />
                Pedido simple y rápido, sin vueltas.
              </li>
              <li>
                <CheckIcon />
                Te confirmamos disponibilidad y entrega.
              </li>
              <li>
                <CheckIcon />
                Atención directa por WhatsApp.
              </li>
            </ul>
            <Link className="btn btn--primary" to="/entregas">
              Ver zona de cobertura
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--about">
        <div className="container about-grid">
          <div className="about-media">
            <img
              src={asset('imagenes/sobre-nosotros.webp')}
              alt="Nuestro equipo junto a una mascota"
              width="1200"
              height="853"
              loading="lazy"
              decoding="async"
            />
            <span className="about-badge">
              <PawIcon />
              Cuidamos lo que más querés
            </span>
          </div>
          <div className="about-content">
            <span className="eyebrow">
              <HeartIcon />
              Sobre PET FOOD
            </span>
            <h2>Más que una tienda, un aliado para tu mascota</h2>
            <p>
              Nos dedicamos a brindar lo mejor para tu mascota: productos de calidad, atención
              personalizada y compromiso con el bienestar animal.
            </p>
            <p>
              Si no sabés qué alimento elegir, escribinos. Te asesoramos según la edad, el tamaño y
              las necesidades de tu perro o gato.
            </p>
            <Link className="btn btn--ghost" to="/contacto">
              Hablar con nosotros
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cta-banner">
          <div>
            <span className="eyebrow eyebrow--light">
              <PawIcon />
              ¿Listo para consentirlo?
            </span>
            <h2>Su comida favorita está a un clic</h2>
            <p>Armá tu pedido y coordinamos la entrega por WhatsApp.</p>
          </div>
          <div className="cta-actions">
            <Link className="btn btn--accent" to="/productos/perros">
              Empezar compra
              <ArrowRightIcon />
            </Link>
            <Link className="btn btn--outline-light" to="/contacto">
              Hacer una consulta
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
