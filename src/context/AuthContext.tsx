import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  isAllowed: boolean
  allowedLoading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  refreshAllowed: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)
  const [allowedLoading, setAllowedLoading] = useState(false)

  const checkAllowed = useCallback(async (userId: string | undefined) => {
    if (!supabase || !userId) {
      setIsAllowed(false)
      return
    }
    setAllowedLoading(true)
    const { data, error } = await supabase
      .from('usuarios_permitidos')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.warn('No se pudo verificar permisos:', error.message)
      setIsAllowed(false)
    } else {
      setIsAllowed(Boolean(data))
    }
    setAllowedLoading(false)
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
      void checkAllowed(data.session?.user.id)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
      void checkAllowed(nextSession?.user.id)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [checkAllowed])

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase no está configurado.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setIsAllowed(false)
  }, [])

  const refreshAllowed = useCallback(async () => {
    await checkAllowed(session?.user.id)
  }, [checkAllowed, session?.user.id])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      isAllowed,
      allowedLoading,
      signIn,
      signOut,
      refreshAllowed,
    }),
    [session, loading, isAllowed, allowedLoading, signIn, signOut, refreshAllowed],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.')
  }
  return context
}
