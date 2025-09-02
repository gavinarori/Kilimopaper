"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
}

type AuthContextType = { 
  token: string | null
  user: User | null
  isLoading: boolean
  setToken: (t: string | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({ 
  token: null, 
  user: null,
  isLoading: true,
  setToken: () => {}, 
  logout: () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (t) {
      setToken(t)
      // TODO: Validate token and fetch user info
      // For now, we'll just set a mock user
      setUser({ id: "1", email: "user@example.com" })
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (token) {
      localStorage.setItem("token", token)
      // Also set cookie for middleware
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
    } else {
      localStorage.removeItem("token")
      // Remove cookie
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
  }, [token])

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      isLoading, 
      setToken, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { 
  return useContext(AuthContext) 
}


