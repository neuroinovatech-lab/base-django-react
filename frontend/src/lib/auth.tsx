import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError } from './api'
import type { User } from '../types'

type Auth = {
  user: User | null
  loading: boolean
  error: string
  setUser: (user: User | null) => void
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
const AuthContext = createContext<Auth | null>(null)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    api<User>('/auth/me/')
      .then(setUser)
      .catch((e) => {
        if (!(e instanceof ApiError && [401, 403].includes(e.status))) setError(e.message)
      })
      .finally(() => setLoading(false))
    const expired = () => setUser(null)
    window.addEventListener('session-expired', expired)
    return () => window.removeEventListener('session-expired', expired)
  }, [])
  const signIn = async (username: string, password: string) => {
    const loggedIn = await api<User>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    setError('')
    setUser(loggedIn)
  }
  const signOut = async () => {
    await api('/auth/logout/', { method: 'POST' })
    setUser(null)
  }
  return (
    <AuthContext.Provider value={{ user, loading, error, setUser, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('AuthProvider ausente')
  return context
}
