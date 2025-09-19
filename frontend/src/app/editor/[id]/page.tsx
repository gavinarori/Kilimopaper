"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"

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

  const draftKey = useMemo(() => `draft-doc-${id}`, [id])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start typing…" }),
    ],
    editorProps: {
      attributes: {
        class: "min-h-[60vh] border rounded p-4 prose max-w-none focus:outline-none",
      },
    },
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setContent(html)
    },
  })

  useEffect(() => {
    ;(async () => {
      const res = await apiFetch<any>(`/api/documents/${id}`)
      if (res.data) {
        const serverName = res.data.name || "Untitled"
        const serverContent = res.data.content || ""
        setName(serverName)
        setContent(serverContent)
        setLastSavedName(serverName)
        setLastSavedContent(serverContent)
        if (editor) editor.commands.setContent(serverContent, { emitUpdate: false })
      }
      // Try restore draft if exists
      try {
        const raw = localStorage.getItem(draftKey)
        if (raw) {
          const draft = JSON.parse(raw) as { name: string; content: string; ts: number }
          const serverName = res.data?.name || "Untitled"
          const serverContent = res.data?.content || ""
          const shouldRestore = draft && (draft.name !== serverName || draft.content !== serverContent)
          if (shouldRestore) {
            setName(draft.name)
            setContent(draft.content)
            if (editor) editor.commands.setContent(draft.content, { emitUpdate: false })
            setRestoredDraft(true)
          }
        }
      } catch {}
      setLoaded(true)
    })()
  }, [id, draftKey, editor])

  
  useEffect(() => {
    if (!editor) return
    // Only set if different to avoid loop
    const html = editor.getHTML()
    if (html !== content) {
      editor.commands.setContent(content || "<p></p>", { emitUpdate: false })
    }
  }, [editor, content])

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
    const html = editor ? editor.getHTML() : content
    await apiFetch(`/api/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, content: html }),
    })
    setSaving(false)
    setLastSavedName(name)
    setLastSavedContent(html)
    try { localStorage.removeItem(draftKey) } catch {}
  }, [id, name, editor, content])

  const addLink = () => {
    const url = prompt("Enter URL")
    if (!url) return
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
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
              <Button size="sm" variant="outline" onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</Button>
              <Button size="sm" variant="outline" onClick={() => editor?.chain().focus().toggleItalic().run()}>Italic</Button>
              <Button size="sm" variant="outline" onClick={() => editor?.chain().focus().toggleUnderline().run()}>Underline</Button>
              <Button size="sm" variant="outline" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>H1</Button>
              <Button size="sm" variant="outline" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
              <Button size="sm" variant="outline" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
                Bullets
              </Button>
              <Button size="sm" variant="outline" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
                Numbered
              </Button>
              <Button size="sm" variant="outline" onClick={() => editor?.chain().focus().setTextAlign("left").run()}>Left</Button>
              <Button size="sm" variant="outline" onClick={() => editor?.chain().focus().setTextAlign("center").run()}>Center</Button>
              <Button size="sm" variant="outline" onClick={() => editor?.chain().focus().setTextAlign("right").run()}>Right</Button>
              <Button size="sm" variant="outline" onClick={addLink}>Link</Button>
              <Button size="sm" variant="outline" onClick={() => editor?.chain().focus().undo().run()}>
                Undo
              </Button>
              <Button size="sm" variant="outline" onClick={() => editor?.chain().focus().redo().run()}>
                Redo
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { editor?.commands.clearContent(true); setContent("") }}>Clear</Button>
            </div>
          </div>
          <div className="p-4">
            {!editor ? (
              <div className="min-h-[60vh] border rounded p-4 text-sm text-muted-foreground">Loading editor…</div>
            ) : (
              <EditorContent editor={editor} />
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}


