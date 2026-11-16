import { useCart } from '../context/CartContext'
import { CheckIcon } from './Icons'

export function Toast() {
  const { toast } = useCart()

  return (
    <div
      className={toast ? 'toast-message is-visible' : 'toast-message'}
      role="status"
      aria-live="polite"
    >
      {toast && (
        <>
          <CheckIcon />
          <span>{toast}</span>
        </>
      )}
    </div>
  )
}
