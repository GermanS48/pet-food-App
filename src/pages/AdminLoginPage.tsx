import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { usePageTitle } from '../hooks/usePageTitle'

export function AdminLoginPage() {
  usePageTitle('Acceso administración | PET FOOD')
  const { user, loading, isAllowed, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/admin/productos'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!loading && user && isAllowed) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    const message = await signIn(email.trim(), password)
    setSubmitting(false)
    if (message) {
      setError(message)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <section className="section">
      <div className="container narrow">
        <div className="admin-panel">
          <h1>Administración</h1>
          <p className="muted">
            Ingresá con tu cuenta para gestionar productos. Solo usuarios permitidos pueden acceder.
          </p>

          {!isSupabaseConfigured ? (
            <p className="form-error" role="alert">
              Supabase no está configurado. Completá <code>VITE_SUPABASE_URL</code> y{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> para habilitar el acceso.
            </p>
          ) : (
            <form className="admin-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Correo electrónico</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="form-field">
                <span>Contraseña</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              <button className="btn btn--primary" type="submit" disabled={submitting}>
                {submitting ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
