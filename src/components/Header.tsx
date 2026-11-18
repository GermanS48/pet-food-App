import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { asset } from '../lib/assets'
import { WHATSAPP_INFO_URL } from '../lib/constants'
import { CartIcon, MenuIcon, CloseIcon, WhatsAppIcon } from './Icons'

interface HeaderProps {
  onOpenAbout: () => void
}

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive ? 'nav-link is-active' : 'nav-link'
}

export function Header({ onOpenAbout }: HeaderProps) {
  const { count } = useCart()
  const { user, isAllowed } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [menuOpen])

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar-inner">
          <span className="topbar-note">
            <span className="topbar-dot" aria-hidden="true" />
            Envíos a domicilio en Moreno y Gran Buenos Aires
          </span>
          <a className="topbar-link" href={WHATSAPP_INFO_URL} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            Pedidos por WhatsApp
          </a>
        </div>
      </div>

      <div className="container header-inner">
        <Link className="brand" to="/" aria-label="PET FOOD, ir al inicio">
          <img
            className="brand-logo"
            src={asset('imagenes/logo.webp')}
            alt=""
            width="64"
            height="64"
          />
          <span className="brand-text">
            <span className="brand-name">PET FOOD</span>
            <span className="brand-tagline">Lo mejor para tu mascota</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <nav
          id="main-navigation"
          className={menuOpen ? 'main-nav is-open' : 'main-nav'}
          aria-label="Navegación principal"
        >
          <ul className="nav-list">
            <li>
              <NavLink to="/" end className={navLinkClass}>
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink to="/productos/perros" className={navLinkClass}>
                Perros
              </NavLink>
            </li>
            <li>
              <NavLink to="/productos/gatos" className={navLinkClass}>
                Gatos
              </NavLink>
            </li>
            <li>
              <NavLink to="/entregas" className={navLinkClass}>
                Entregas
              </NavLink>
            </li>
            <li>
              <button type="button" className="nav-link nav-link--button" onClick={onOpenAbout}>
                Nosotros
              </button>
            </li>
            <li>
              <NavLink to="/contacto" className={navLinkClass}>
                Contacto
              </NavLink>
            </li>
            <li>
              <NavLink
                to={user && isAllowed ? '/admin/productos' : '/admin/login'}
                className={navLinkClass}
              >
                Admin
              </NavLink>
            </li>
            <li className="nav-cart-item">
              <NavLink
                to="/carrito"
                className={({ isActive }) =>
                  isActive ? 'cart-link is-active' : 'cart-link'
                }
                aria-label={count > 0 ? `Ver carrito, ${count} productos` : 'Ver carrito'}
              >
                <CartIcon />
                {count > 0 && <span className="cart-badge">{count > 99 ? '99+' : count}</span>}
                <span className="cart-link-text">Carrito</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
