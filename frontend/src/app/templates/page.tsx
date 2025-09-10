"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"

type Template = { id: string; name: string; product: string; fields: string[] }

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const res = await apiFetch<Template[]>("/api/templates")
      if (res.data) setTemplates(res.data)
      setLoading(false)
    })()
  }, [])

  const filtered = templates.filter(
    (t) => t.name.toLowerCase().includes(query.toLowerCase()) || t.product.toLowerCase().includes(query.toLowerCase())
  )

  const handleUse = async (tpl: Template) => {
    // fetch full template to get content
    const detail = await apiFetch<{ id: string; name: string; content: string }>(`/api/templates/${tpl.id}`)
    const name = `${tpl.name} Draft`
    const created = await apiFetch<any>("/api/documents/text", {
      method: "POST",
      body: JSON.stringify({ name, content: detail.data?.content || "", templateId: tpl.id }),
    })
    if (created.data?._id) router.push(`/editor/${created.data._id}`)
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="p-6 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">Templates</h1>
            <div className="flex items-center gap-2">
              <Input placeholder="Search templates" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <p>Loading...</p>
            ) : filtered.length === 0 ? (
              <p>No templates found.</p>
            ) : (
              filtered.map((t) => (
                <Card key={t.id} className="flex flex-col">
                  <CardContent className="p-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t.name}</div>
                        <div className="text-sm text-muted-foreground">{t.product}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      Fields: {t.fields.join(", ")}
                    </div>
                  </CardContent>
                  <div className="p-4 pt-0">
                    <Button className="w-full" onClick={() => handleUse(t)}>
                      Use template
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}


