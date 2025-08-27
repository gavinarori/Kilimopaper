"use client"

export type ApiResult<T> = { data?: T; error?: string }

export function getApiBase(): string {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_API_BASE || ""
  return process.env.NEXT_PUBLIC_API_BASE || ""
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const base = getApiBase()
    const token = getToken()
    const headers = new Headers(init.headers || {})
    if (!headers.has("Content-Type") && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json")
    if (token) headers.set("Authorization", `Bearer ${token}`)
    const res = await fetch(`${base}${path}`, { ...init, headers, cache: "no-store" })
    if (!res.ok) {
      const msg = await safeError(res)
      return { error: msg }
    }
    const ct = res.headers.get("content-type") || ""
    if (ct.includes("application/json")) {
      return { data: (await res.json()) as T }
    }
    // @ts-expect-error allow non-json
    return { data: (await res.text()) as T }
  } catch (e: any) {
    return { error: e?.message || "Request failed" }
  }
}

async function safeError(res: Response): Promise<string> {
  try {
    const j = await res.json()
    return j?.error ? JSON.stringify(j.error) : res.statusText
  } catch {
    return res.statusText
  }
}


