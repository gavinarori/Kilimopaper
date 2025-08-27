"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select } from "../../components/ui/select"
import { apiFetch } from "../../lib/api"

type Doc = { _id: string; originalName: string; product: string; category: string }

export default function DocsPage() {
  const [list, setList] = useState<Doc[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState("invoice")
  const [product, setProduct] = useState("avocado")

  async function load() {
    const res = await apiFetch<Doc[]>("/api/documents")
    if (res.data) setList(res.data)
  }
  useEffect(() => { load() }, [])

  async function upload() {
    if (!file) return
    const form = new FormData()
    form.append("file", file)
    form.append("category", category)
    form.append("product", product)
    const res = await apiFetch("/api/documents", { method: "POST", body: form })
    if (!res.error) await load()
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Documents</h1>
        <Link className="text-sm text-sky-600" href="/">Logout</Link>
      </div>
      <div className="flex gap-2 items-center">
        <Input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        <Select value={category} onChange={e => setCategory(e.target.value)} options={[
          { value: "invoice", label: "Invoice" },
          { value: "phytosanitary", label: "Phytosanitary" },
          { value: "bill_of_lading", label: "Bill of Lading" },
        ]} />
        <Select value={product} onChange={e => setProduct(e.target.value)} options={[
          { value: "avocado", label: "Avocado" },
          { value: "tea", label: "Tea" },
          { value: "coffee", label: "Coffee" },
        ]} />
        <Button onClick={upload}>Upload</Button>
      </div>
      <ul className="divide-y divide-gray-100">
        {list.map(d => (
          <li key={d._id} className="py-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{d.originalName}</div>
              <div className="text-sm text-gray-500">{d.product} • {d.category}</div>
            </div>
            <div className="flex gap-2">
              <a className="text-sky-600 text-sm" href={`/api/documents/${d._id}/download`} target="_blank">Download</a>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}


