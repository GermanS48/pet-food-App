import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckIcon, PawIcon, TruckIcon, WhatsAppIcon } from '../components/Icons'
import { usePageTitle } from '../hooks/usePageTitle'
import { CONTACT_EMAIL, WHATSAPP_INFO_URL } from '../lib/constants'
import { isSupabaseConfigured } from '../lib/supabase'
import { sendContactMessage } from '../services/contact'

const INITIAL_FORM = { name: '', email: '', message: '' }

export function ContactPage() {
  usePageTitle('Contacto | PET FOOD')
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<{ demo: boolean } | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return

    if (form.name.trim().length < 2) {
      setError('Ingresá tu nombre.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Ingresá un correo electrónico válido.')
      return
    }
    if (form.message.trim().length < 10) {
      setError('Contanos un poco más: el mensaje debe tener al menos 10 caracteres.')
      return
    }

    setSending(true)
    setError(null)

    try {
      const result = await sendContactMessage(form)
      setSent(result)
      setForm(INITIAL_FORM)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos enviar el mensaje.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="contact-page">
      <section className="page-hero">
        <div className="container page-hero-inner">
          <div>
            <nav className="breadcrumb" aria-label="Miga de pan">
              <Link to="/">Inicio</Link>
              <span aria-hidden="true">/</span>
              <span>Contacto</span>
            </nav>
            <span className="eyebrow">
              <PawIcon />
              Estamos para ayudarte
            </span>
            <h1>Contacto</h1>
            <p>
              ¿Tenés dudas sobre un producto o tu entrega? Escribinos y te respondemos a la
              brevedad.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container contact-layout">
          <div className="form-card">
            {sent ? (
              <div className="contact-success">
                <span className="success-icon success-icon--small">
                  <CheckIcon />
                </span>
                <h2>¡Mensaje enviado!</h2>
                <p>Gracias por escribirnos. Vamos a responderte lo antes posible.</p>
                {sent.demo && (
                  <p className="demo-note demo-note--small">
                    Modo demo: el mensaje se guardó en este dispositivo porque Supabase no está
                    configurado.
                  </p>
                )}
                <div className="success-actions">
                  <a
                    className="btn btn--whatsapp"
                    href={WHATSAPP_INFO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon />
                    Consultar por WhatsApp
                  </a>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setSent(null)}
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h2>Escribinos</h2>
                <p className="form-intro">
                  Completá el formulario y nos ponemos en contacto con vos.
                </p>

                {error && (
                  <div className="form-alert" role="alert">
                    {error}
                  </div>
                )}

                <div className="field-row">
                  <label className="field">
                    <span>Nombre *</span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Correo electrónico *</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      autoComplete="email"
                      required
                    />
                  </label>
                </div>

                <label className="field">
                  <span>Mensaje *</span>
                  <textarea
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    rows={6}
                    placeholder="Contanos en qué podemos ayudarte…"
                    required
                  />
                </label>

                <button className="btn btn--primary btn--full" type="submit" disabled={sending}>
                  {sending ? 'Enviando…' : 'Enviar mensaje'}
                </button>

                {!isSupabaseConfigured && (
                  <p className="demo-note demo-note--small">
                    Modo demo sin Supabase: el mensaje se guarda localmente. Configurá las
                    variables de entorno para recibirlo en la base de datos.
                  </p>
                )}
              </form>
            )}
          </div>

          <aside className="contact-info">
            <a
              className="info-card info-card--whatsapp"
              href={WHATSAPP_INFO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="info-icon">
                <WhatsAppIcon />
              </span>
              <span>
                <strong>WhatsApp</strong>
                <small>La forma más rápida de contactarnos</small>
                <span className="info-link">+54 11 3572-3651</span>
              </span>
            </a>

            <a className="info-card" href={`mailto:${CONTACT_EMAIL}`}>
              <span className="info-icon">
                <PawIcon />
              </span>
              <span>
                <strong>Correo electrónico</strong>
                <small>Para consultas más detalladas</small>
                <span className="info-link">{CONTACT_EMAIL}</span>
              </span>
            </a>

            <div className="info-card">
              <span className="info-icon">
                <TruckIcon />
              </span>
              <span>
                <strong>Entregas</strong>
                <small>Moreno y Gran Buenos Aires</small>
                <Link className="info-link" to="/entregas">
                  Ver zona de cobertura
                </Link>
              </span>
            </div>

            <div className="contact-tip">
              <PawIcon />
              <p>
                Si tu consulta es por un pedido en curso, mandanos el número de pedido por
                WhatsApp para responderte más rápido.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
