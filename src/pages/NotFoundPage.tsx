import { Link } from 'react-router-dom'
import { ArrowRightIcon, PawIcon } from '../components/Icons'
import { usePageTitle } from '../hooks/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Página no encontrada | PET FOOD')

  return (
    <div className="not-found-page">
      <div className="container">
        <div className="empty-state empty-state--large">
          <span className="empty-state-icon">
            <PawIcon />
          </span>
          <span className="eyebrow eyebrow--center">Error 404</span>
          <h1>Esta página se fue a pasear</h1>
          <p>No encontramos lo que buscabas. Probá desde el inicio o mirá nuestros catálogos.</p>
          <div className="empty-actions">
            <Link className="btn btn--primary" to="/">
              Volver al inicio
              <ArrowRightIcon />
            </Link>
            <Link className="btn btn--ghost" to="/productos/perros">
              Ver productos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
