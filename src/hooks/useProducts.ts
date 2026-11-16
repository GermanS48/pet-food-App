import { useCallback, useEffect, useState } from 'react'
import { getProducts, type ProductQuery } from '../services/products'
import type { Product } from '../types'

export function useProducts({ category, featuredOnly, limit }: ProductQuery) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getProducts({ category, featuredOnly, limit })
      .then((data) => {
        if (!cancelled) setProducts(data)
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setError(reason instanceof Error ? reason.message : 'Ocurrió un error inesperado.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [category, featuredOnly, limit, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { products, loading, error, reload }
}
