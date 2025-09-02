"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Upload, 
  Folder, 
  File, 
  MoreVertical, 
  Download, 
  Trash2, 
  Edit,
  Calendar,
  User
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { format } from "date-fns"

interface Document {
  _id: string
  name: string
  originalName: string
  size: number
  type: string
  folderId?: string
  uploadedBy: string
  uploadedAt: string
  updatedAt: string
  filename: string
}

interface Folder {
  _id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  documentCount: number
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderDescription, setNewFolderDescription] = useState("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [selectedFolder])

  const fetchData = async () => {
    try {
      const [docsResult, foldersResult] = await Promise.all([
        apiFetch<Document[]>(`/api/documents${selectedFolder ? `?folderId=${selectedFolder}` : ''}`),
        apiFetch<Folder[]>("/api/folders")
      ])

      if (docsResult.data) setDocuments(docsResult.data)
      if (foldersResult.data) setFolders(foldersResult.data)
    } catch (error) {
      toast.error("Failed to load documents")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        if (selectedFolder) {
          formData.append('folderId', selectedFolder)
        }

        const result = await apiFetch<Document>("/api/documents/upload", {
          method: "POST",
          body: formData,
        })

        if (result.error) {
          toast.error(`Failed to upload ${file.name}`)
        } else {
          toast.success(`${file.name} uploaded successfully`)
        }
      }
      fetchData()
    } catch (error) {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      setIsUploadDialogOpen(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name is required")
      return
    }

    try {
      const result = await apiFetch<Folder>("/api/folders", {
        method: "POST",
        body: JSON.stringify({
          name: newFolderName,
          description: newFolderDescription,
        }),
      })

      if (result.error) {
        toast.error("Failed to create folder")
      } else {
        toast.success("Folder created successfully")
        setNewFolderName("")
        setNewFolderDescription("")
        setIsFolderDialogOpen(false)
        fetchData()
      }
    } catch (error) {
      toast.error("Failed to create folder")
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const result = await apiFetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      })

      if (result.error) {
        toast.error("Failed to delete document")
      } else {
        toast.success("Document deleted successfully")
        fetchData()
      }
    } catch (error) {
      toast.error("Failed to delete document")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('image')) return '🖼️'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️'
    return '📁'
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading documents...</p>
            </div>
          </div>
        </SidebarProvider>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Documents</h1>
                <p className="text-muted-foreground">
                  Manage your agricultural export documents
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Folder className="h-4 w-4 mr-2" />
                      New Folder
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Folder Name</label>
                        <Input
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="Enter folder name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description (Optional)</label>
                        <Input
                          value={newFolderDescription}
                          onChange={(e) => setNewFolderDescription(e.target.value)}
                          placeholder="Enter folder description"
                        />
                      </div>
                      <Button onClick={handleCreateFolder} className="w-full">
                        Create Folder
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Documents</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 mb-4">
                          Drag and drop files here, or click to select
                        </p>
                        <Input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="cursor-pointer"
                        />
                      </div>
                      {selectedFolder && (
                        <div className="text-sm text-muted-foreground">
                          Files will be uploaded to: <strong>{folders.find(f => f._id === selectedFolder)?.name}</strong>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Folder Navigation */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedFolder === null ? "default" : "outline"}
                onClick={() => setSelectedFolder(null)}
                size="sm"
              >
                All Documents
              </Button>
              {folders.map((folder) => (
                <Button
                  key={folder._id}
                  variant={selectedFolder === folder._id ? "default" : "outline"}
                  onClick={() => setSelectedFolder(folder._id)}
                  size="sm"
                >
                  <Folder className="h-4 w-4 mr-2" />
                  {folder.name}
                  <Badge variant="secondary" className="ml-2">
                    {folder.documentCount}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Documents Grid */}
            {documents.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <File className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No documents yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedFolder 
                      ? `No documents in this folder. Upload some files to get started.`
                      : "Upload your first document to get started."
                    }
                  </p>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {documents.map((document) => (
                  <Card key={document._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {/* Preview thumbnail */}
                          {document.type.startsWith("image/") ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/uploads/${document.filename}`}
                              alt={document.originalName}
                              className="h-10 w-10 rounded object-cover border"
                            />
                          ) : document.type === "application/pdf" ? (
                            <embed
                              src={`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/uploads/${document.filename}#toolbar=0&navpanes=0&scrollbar=0`}
                              type="application/pdf"
                              className="h-10 w-10 border rounded object-cover"
                            />
                          ) : (
                            <span className="text-2xl">{getFileIcon(document.type)}</span>
                          )}
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm truncate">
                              {document.originalName}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(document.size)}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Uploaded:</span>
                          <span>{format(new Date(document.uploadedAt), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>By:</span>
                          <span className="truncate">{document.uploadedBy}</span>
                        </div>
                        <div className="flex gap-1 pt-2">
                          <Button asChild variant="ghost" size="sm" className="flex-1">
                            <a href={`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/uploads/${document.filename}`} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3 w-3 mr-1" />
                              Preview
                            </a>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/share/${document._id}`)}
                          >
                            <span className="text-xs">Share</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteDocument(document._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
