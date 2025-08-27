"use client"

import { createContext, useContext, useEffect, useState } from "react"

type AuthContextType = { token: string | null; setToken: (t: string | null) => void }

const AuthContext = createContext<AuthContextType>({ token: null, setToken: () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (t) setToken(t)
  }, [])
  useEffect(() => {
    if (typeof window === "undefined") return
    if (token) localStorage.setItem("token", token)
    else localStorage.removeItem("token")
  }, [token])
  return <AuthContext.Provider value={{ token, setToken }}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }


