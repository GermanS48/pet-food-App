import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { CartLine, Product } from '../types'

const CART_KEY = 'petfood.cart.v1'

interface CartContextValue {
  lines: CartLine[]
  count: number
  subtotal: number
  add: (product: Product, quantity?: number) => void
  increment: (productId: string) => void
  decrement: (productId: string) => void
  remove: (productId: string) => void
  clear: () => void
  toast: string | null
  notify: (message: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== 'object') return false
  const line = value as Partial<CartLine>
  return (
    typeof line.quantity === 'number' &&
    line.quantity > 0 &&
    Boolean(line.product) &&
    typeof line.product?.id === 'string' &&
    typeof line.product?.name === 'string' &&
    typeof line.product?.price === 'number'
  )
}

function readStoredCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isCartLine) : []
  } catch (error) {
    console.warn('No se pudo leer el carrito guardado:', error)
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStoredCart)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  const notify = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(lines))
    } catch (error) {
      console.warn('No se pudo guardar el carrito:', error)
    }
  }, [lines])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === CART_KEY) setLines(readStoredCart())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const add = useCallback(
    (product: Product, quantity = 1) => {
      setLines((current) => {
        const index = current.findIndex((line) => line.product.id === product.id)
        if (index === -1) {
          return [...current, { product, quantity: Math.max(1, quantity) }]
        }
        const next = [...current]
        next[index] = { ...next[index], quantity: next[index].quantity + Math.max(1, quantity) }
        return next
      })
      notify(`Agregado al carrito: ${product.name}`)
    },
    [notify],
  )

  const increment = useCallback((productId: string) => {
    setLines((current) =>
      current.map((line) =>
        line.product.id === productId ? { ...line, quantity: line.quantity + 1 } : line,
      ),
    )
  }, [])

  const decrement = useCallback((productId: string) => {
    setLines((current) =>
      current
        .map((line) =>
          line.product.id === productId ? { ...line, quantity: line.quantity - 1 } : line,
        )
        .filter((line) => line.quantity > 0),
    )
  }, [])

  const remove = useCallback((productId: string) => {
    setLines((current) => current.filter((line) => line.product.id !== productId))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0)
    const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
    return { lines, count, subtotal, add, increment, decrement, remove, clear, toast, notify }
  }, [lines, add, increment, decrement, remove, clear, toast, notify])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return context
}
