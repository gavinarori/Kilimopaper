"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { apiFetch } from "../lib/api"
import { useAuth } from "../lib/auth"

export default function Home() {
  const { setToken } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState<"login" | "register">("login")
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setError(null)
    const res = await apiFetch<{ token: string }>(`/api/auth/${mode}`, {
      method: "POST",
      body: JSON.stringify({ email, password })
    })
    if (res.error) setError(res.error)
    else if (res.data?.token) setToken(res.data.token)
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Agri-Export Organizer</h1>
      <div className="space-y-2">
        <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={submit}>{mode === 'login' ? 'Login' : 'Register'}</Button>
          <Button variant="outline" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>Switch to {mode === 'login' ? 'Register' : 'Login'}</Button>
        </div>
      </div>
      <div className="text-sm text-gray-600">Already authed? <Link href="/docs" className="text-sky-600">Go to dashboard</Link></div>
    </main>
  )
}
