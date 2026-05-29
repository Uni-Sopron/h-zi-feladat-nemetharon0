import { createContext, useContext, useState } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('pf_user')
    return raw ? JSON.parse(raw) : null
  })

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password })
    localStorage.setItem('pf_token', data.token)
    localStorage.setItem('pf_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const register = async (username, email, password) => {
    const data = await api.post('/auth/register', { username, email, password })
    localStorage.setItem('pf_token', data.token)
    localStorage.setItem('pf_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('pf_token')
    localStorage.removeItem('pf_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth csak AuthProvideren belül hívható')
  return ctx
}