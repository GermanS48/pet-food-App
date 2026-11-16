import { Link } from 'react-router-dom'
import { asset } from '../lib/assets'
import { CONTACT_EMAIL, WHATSAPP_INFO_URL } from '../lib/constants'
import { PawIcon, WhatsAppIcon } from './Icons'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand brand--footer">
            <img src={asset('imagenes/logo.webp')} alt="" width="56" height="56" />
            <span className="brand-text">
              <span className="brand-name">PET FOOD</span>
              <span className="brand-tagline">Lo mejor para tu mascota</span>
            </span>
          </Link>
          <p>
            Alimento y productos seleccionados para perros y gatos, con atención personalizada y
            entregas a domicilio.
          </p>
          <a
            className="footer-whatsapp"
            href={WHATSAPP_INFO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />
            Escribinos por WhatsApp
          </a>
        </div>

        <div className="footer-column">
          <h2>Tienda</h2>
          <ul>
            <li>
              <Link to="/productos/perros">Productos para perros</Link>
            </li>
            <li>
              <Link to="/productos/gatos">Productos para gatos</Link>
            </li>
            <li>
              <Link to="/carrito">Mi carrito</Link>
            </li>
            <li>
              <Link to="/entregas">Entregas a domicilio</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h2>Ayuda</h2>
          <ul>
            <li>
              <Link to="/contacto">Contacto</Link>
            </li>
            <li>
              <Link to="/entregas">Zona de cobertura</Link>
            </li>
            <li>
              <a href={WHATSAPP_INFO_URL} target="_blank" rel="noopener noreferrer">
                Consultas por WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`}>Enviar un correo</a>
            </li>
          </ul>
        </div>

        <div className="footer-column footer-contact">
          <h2>Contacto</h2>
          <p>
            <strong>WhatsApp</strong>
            <a href={WHATSAPP_INFO_URL} target="_blank" rel="noopener noreferrer">
              +54 11 3572-3651
            </a>
          </p>
          <p>
            <strong>Email</strong>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          <p>
            <strong>Zona</strong>
            Moreno y Gran Buenos Aires
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {year} PET FOOD. Todos los derechos reservados.</p>
          <p className="footer-paw">
            <PawIcon />
            Hecho con cariño para tu mascota
          </p>
        </div>
      </div>
    </footer>
  )
}
