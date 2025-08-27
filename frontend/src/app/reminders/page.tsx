"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select } from "../../components/ui/select"
import { apiFetch } from "../../lib/api"

type Reminder = { _id: string; title: string; dueDateIso: string; channel: "email" | "sms" }

export default function RemindersPage() {
  const [list, setList] = useState<Reminder[]>([])
  const [title, setTitle] = useState("")
  const [dueDateIso, setDue] = useState("")
  const [channel, setChannel] = useState<"email" | "sms">("email")

  async function load() {
    const res = await apiFetch<Reminder[]>("/api/reminders")
    if (res.data) setList(res.data)
  }
  useEffect(() => { load() }, [])

  async function add() {
    const res = await apiFetch<Reminder>("/api/reminders", { method: "POST", body: JSON.stringify({ title, dueDateIso, channel }) })
    if (res.data) setList(prev => [...prev, res.data!])
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reminders</h1>
        <Link className="text-sm text-sky-600" href="/">Logout</Link>
      </div>
      <div className="flex gap-2 items-center">
        <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <Input type="date" value={dueDateIso} onChange={e => setDue(e.target.value)} />
        <Select value={channel} onChange={e => setChannel(e.target.value as any)} options={[{ value: "email", label: "Email" }, { value: "sms", label: "SMS" }]} />
        <Button onClick={add}>Add</Button>
      </div>
      <ul className="divide-y divide-gray-100">
        {list.map(r => (
          <li key={r._id} className="py-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{r.title}</div>
              <div className="text-sm text-gray-500">{new Date(r.dueDateIso).toLocaleDateString()} • {r.channel}</div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}


