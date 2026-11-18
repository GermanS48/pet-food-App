import type { ReactElement } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RequireAdmin({ children }: { children: ReactElement }) {
  const { user, loading, isAllowed, allowedLoading } = useAuth()
  const location = useLocation()

  if (loading || allowedLoading) {
    return (
      <div className="section">
        <div className="container">
          <p className="muted">Verificando acceso…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (!isAllowed) {
    return (
      <div className="section">
        <div className="container narrow">
          <div className="admin-panel">
            <h1>Acceso restringido</h1>
            <p className="muted">
              Tu cuenta no tiene permisos para administrar productos. Pedí acceso a un administrador.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return children
}
