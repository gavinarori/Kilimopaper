"use client"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { apiFetch } from "../../lib/api"

export default function PaymentsPage() {
  async function initiate() {
    const res = await apiFetch("/api/payments/mpesa/initiate", { method: "POST" })
    alert(res.error ? res.error : "M-Pesa initiation stubbed")
  }
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Payments</h1>
        <Link className="text-sm text-sky-600" href="/">Logout</Link>
      </div>
      <Button onClick={initiate}>Initiate M-Pesa (stub)</Button>
    </main>
  )
}


