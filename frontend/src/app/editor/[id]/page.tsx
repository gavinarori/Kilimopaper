"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"

export default function EditorPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [restoredDraft, setRestoredDraft] = useState(false)
  const [lastSavedName, setLastSavedName] = useState("")
  const [lastSavedContent, setLastSavedContent] = useState("")
  const editorRef = useRef<HTMLDivElement | null>(null)

  const draftKey = useMemo(() => `draft-doc-${id}`, [id])

  useEffect(() => {
    ;(async () => {
      const res = await apiFetch<any>(`/api/documents/${id}`)
      if (res.data) {
        setName(res.data.name || "Untitled")
        setContent(res.data.content || "")
        setLastSavedName(res.data.name || "Untitled")
        setLastSavedContent(res.data.content || "")
      }
      // Try restore draft if exists
      try {
        const raw = localStorage.getItem(draftKey)
        if (raw) {
          const draft = JSON.parse(raw) as { name: string; content: string; ts: number }
          if (draft && (draft.name !== (res.data?.name || "Untitled") || draft.content !== (res.data?.content || ""))) {
            setName(draft.name)
            setContent(draft.content)
            setRestoredDraft(true)
          }
        }
      } catch {}
      setLoaded(true)
    })()
  }, [id, draftKey])

  // Autosave to localStorage (debounced)
  useEffect(() => {
    if (!loaded) return
    const handle = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ name, content, ts: Date.now() }))
      } catch {}
    }, 600)
    return () => clearTimeout(handle)
  }, [name, content, draftKey, loaded])

  // Warn on unload if unsaved changes
  useEffect(() => {
    const hasUnsaved = name !== lastSavedName || content !== lastSavedContent
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [name, content, lastSavedName, lastSavedContent])

  const save = useCallback(async () => {
    setSaving(true)
    await apiFetch(`/api/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, content }),
    })
    setSaving(false)
    setLastSavedName(name)
    setLastSavedContent(content)
    try { localStorage.removeItem(draftKey) } catch {}
  }, [id, name, content])

  // Formatting actions using document.execCommand for simplicity
  const runCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    // Update state after command
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
  }

  const addLink = () => {
    const url = prompt("Enter URL")
    if (!url) return
    runCmd("createLink", url)
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-md" />
              <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              <Button variant="secondary" onClick={() => router.push("/documents")}>Back</Button>
              <div className="ml-auto text-xs text-muted-foreground">
                {name === lastSavedName && content === lastSavedContent ? "All changes saved" : "Draft not saved"}
                {restoredDraft ? " • restored from draft" : ""}
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              <Button size="sm" variant="outline" onClick={() => runCmd("bold")}>Bold</Button>
              <Button size="sm" variant="outline" onClick={() => runCmd("italic")}>Italic</Button>
              <Button size="sm" variant="outline" onClick={() => runCmd("underline")}>Underline</Button>
              <Button size="sm" variant="outline" onClick={() => runCmd("formatBlock", "<h1>")}>H1</Button>
              <Button size="sm" variant="outline" onClick={() => runCmd("formatBlock", "<h2>")}>H2</Button>
              <Button size="sm" variant="outline" onClick={() => runCmd("insertUnorderedList")}>
                Bullets
              </Button>
              <Button size="sm" variant="outline" onClick={() => runCmd("insertOrderedList")}>
                Numbered
              </Button>
              <Button size="sm" variant="outline" onClick={() => runCmd("justifyLeft")}>Left</Button>
              <Button size="sm" variant="outline" onClick={() => runCmd("justifyCenter")}>Center</Button>
              <Button size="sm" variant="outline" onClick={() => runCmd("justifyRight")}>Right</Button>
              <Button size="sm" variant="outline" onClick={addLink}>Link</Button>
              <Button size="sm" variant="outline" onClick={() => runCmd("undo")}>
                Undo
              </Button>
              <Button size="sm" variant="outline" onClick={() => runCmd("redo")}>
                Redo
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { if (editorRef.current) { editorRef.current.innerHTML = ""; setContent("") } }}>Clear</Button>
            </div>
          </div>
          <div className="p-4">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="min-h-[60vh] border rounded p-4 prose max-w-none focus:outline-none"
              onInput={(e) => setContent((e.target as HTMLDivElement).innerHTML)}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}


