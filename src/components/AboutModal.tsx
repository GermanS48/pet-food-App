import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { asset } from '../lib/assets'
import { CloseIcon, PawIcon } from './Icons'

interface AboutModalProps {
  open: boolean
  onClose: () => void
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !cardRef.current) return

      const focusable = Array.from(
        cardRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        ref={cardRef}
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar ventana"
        >
          <CloseIcon />
        </button>

        <img
          className="modal-image"
          src={asset('imagenes/sobre-nosotros.webp')}
          alt="Nuestro equipo y nuestras mascotas"
          width="1200"
          height="853"
          loading="lazy"
          decoding="async"
        />

        <div className="modal-body">
          <span className="eyebrow eyebrow--center">
            <PawIcon />
            Sobre nosotros
          </span>
          <h2 id="about-title">Cuidamos a quienes más querés</h2>
          <p>
            En <strong>PET FOOD</strong> nos dedicamos a brindar lo mejor para tu mascota:
            productos de calidad, atención personalizada y compromiso con el bienestar animal.
          </p>
          <p>
            Te acompañamos con asesoramiento para elegir el alimento adecuado y coordinamos la
            entrega en Moreno y zonas de Gran Buenos Aires.
          </p>
          <div className="modal-actions">
            <Link className="btn btn--primary" to="/productos/perros" onClick={onClose}>
              Ver productos
            </Link>
            <Link className="btn btn--ghost" to="/contacto" onClick={onClose}>
              Contactarnos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
