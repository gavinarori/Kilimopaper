"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Upload,
  Folder,
  File,
  Download,
  Trash2,
  User,
  Search,
  Grid3X3,
  List,
  Share2,
  Eye,
  ScanLine,
  Zap,
  Star,
  FileText,
  ImageIcon,
  Copy,
  ExternalLink,
  Edit,
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface FolderType {
  _id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  documentCount: number
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<FolderType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [shareDocument, setShareDocument] = useState<Document | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderDescription, setNewFolderDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [dragActive, setDragActive] = useState(false)
  const [processingDocument, setProcessingDocument] = useState<string | null>(null)
  const [newFileName, setNewFileName] = useState("")
  const [renameDoc, setRenameDoc] = useState<Document | null>(null)
  const [renameName, setRenameName] = useState("")
  const [renameFolder, setRenameFolder] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetchData()
  }, [selectedFolder])

  const fetchData = async () => {
    try {
      const [docsResult, foldersResult] = await Promise.all([
        apiFetch<Document[]>(`/api/documents${selectedFolder ? `?folderId=${selectedFolder}` : ""}`),
        apiFetch<FolderType[]>("/api/folders"),
      ])

      if (docsResult.data) setDocuments(docsResult.data)
      if (foldersResult.data) setFolders(foldersResult.data)
    } catch (error) {
      toast.error("Failed to load documents")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  const uploadFiles = async (files: FileList) => {
    const file = files[0]
    if (!file) return
    if (!newFileName.trim()) {
      toast.error("Please enter a document name before uploading")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', newFileName)
      if (selectedFolder) formData.append('folderId', selectedFolder)

      const result = await apiFetch<Document>("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      if (result.error) toast.error(`Failed to upload ${file.name}`)
      else toast.success(`${newFileName} uploaded successfully`)
      setNewFileName("")
      await fetchData()
    } catch (error) {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      setIsUploadDialogOpen(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    await uploadFiles(files)
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name is required")
      return
    }

    try {
      const result = await apiFetch<FolderType>("/api/folders", {
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

  const handleShare = (document: Document) => {
    setShareDocument(document)
    setIsShareDialogOpen(true)
  }

  const copyShareLink = async (document: Document) => {
    const shareUrl = `${window.location.origin}/api/share/${document._id}`
    await navigator.clipboard.writeText(shareUrl)
    toast.success("Share link copied to clipboard")
  }

  const handleRenameSave = async () => {
    if (!renameDoc) return
    try {
      const result = await apiFetch<Document>(`/api/documents/${renameDoc._id}`, {
        method: "PUT",
        body: JSON.stringify({ name: renameName, folderId: renameFolder }),
      })
      if (result.error) {
        toast.error("Failed to update document")
        return
      }
      toast.success("Document updated")
      setRenameDoc(null)
      setRenameName("")
      setRenameFolder(undefined)
      await fetchData()
    } catch {
      toast.error("Failed to update document")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />
    if (type.includes("image")) return <ImageIcon className="h-8 w-8 text-blue-500" />
    if (type.includes("word") || type.includes("document")) return <FileText className="h-8 w-8 text-blue-600" />
    if (type.includes("excel") || type.includes("spreadsheet")) return <FileText className="h-8 w-8 text-green-600" />
    if (type.includes("powerpoint") || type.includes("presentation"))
      return <FileText className="h-8 w-8 text-orange-600" />
    return <File className="h-8 w-8 text-gray-500" />
  }

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg text-muted-foreground">Loading your documents...</p>
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
          {dragActive && (
            <div className="fixed inset-0 z-50 bg-primary/10 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-background border-2 border-dashed border-primary rounded-lg p-8 text-center">
                <Upload className="h-16 w-16 mx-auto text-primary mb-4" />
                <p className="text-xl font-semibold">Drop files here to upload</p>
                <p className="text-muted-foreground">We'll process them with AI enhancement</p>
              </div>
            </div>
          )}

          <div
            className="flex flex-1 flex-col gap-6 p-6"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Documents
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Manage and organize your files with AI-powered processing
                  </p>
                </div>
                <div className="flex gap-3">
                  <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="lg">
                        <Folder className="h-4 w-4 mr-2" />
                        New Folder
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
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
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description (Optional)</label>
                          <Input
                            value={newFolderDescription}
                            onChange={(e) => setNewFolderDescription(e.target.value)}
                            placeholder="Enter folder description"
                            className="mt-1"
                          />
                        </div>
                        <Button onClick={handleCreateFolder} className="w-full" size="lg">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Folder
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <ScanLine className="h-5 w-5" />
                          Upload & Process Documents
                        </DialogTitle>
                        <DialogDescription>Provide a document name and choose a file to upload.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div>
                          <label className="text-sm font-medium">Document Name</label>
                          <Input
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="e.g., Phytosanitary Certificate"
                            className="mt-1"
                          />
                        </div>
                        <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center bg-gradient-to-br from-primary/5 to-transparent">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-primary/10 rounded-full">
                              <Upload className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold mb-2">Drag and drop files here</p>
                              <p className="text-sm text-muted-foreground mb-4">
                                Or click to select a single file • Images will be enhanced with AI
                              </p>
                            </div>
                            <Input
                              type="file"
                              onChange={handleFileUpload}
                              disabled={uploading}
                              className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />
                          </div>
                        </div>

                        {processingDocument && (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className="animate-spin">
                                <ScanLine className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Processing {processingDocument}</p>
                                <p className="text-sm text-muted-foreground">
                                  Enhancing image quality and extracting text...
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedFolder && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-sm text-muted-foreground">
                              Files will be uploaded to:{" "}
                              <strong className="text-foreground">
                                {folders.find((f) => f._id === selectedFolder)?.name}
                              </strong>
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedFolder === null ? "default" : "outline"}
                onClick={() => setSelectedFolder(null)}
                className="rounded-full"
              >
                <Star className="h-4 w-4 mr-2" />
                All Documents
                <Badge variant="secondary" className="ml-2">
                  {documents.length}
                </Badge>
              </Button>
              {folders.map((folder) => (
                <Button
                  key={folder._id}
                  variant={selectedFolder === folder._id ? "default" : "outline"}
                  onClick={() => setSelectedFolder(folder._id)}
                  className="rounded-full"
                >
                  <Folder className="h-4 w-4 mr-2" />
                  {folder.name}
                  <Badge variant="secondary" className="ml-2">
                    {folder.documentCount}
                  </Badge>
                </Button>
              ))}
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="p-6 bg-muted/30 rounded-full w-fit mx-auto mb-6">
                    <File className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">
                    {searchQuery ? "No matching documents" : "No documents yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {searchQuery
                      ? `No documents match "${searchQuery}". Try a different search term.`
                      : selectedFolder
                        ? "This folder is empty. Upload some files to get started."
                        : "Upload your first document to get started. We'll enhance images automatically."}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setIsUploadDialogOpen(true)} size="lg">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "gap-6",
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "flex flex-col",
                )}
              >
                {filteredDocuments.map((document) => (
                  <Card
                    key={document._id}
                    className={cn(
                      "group hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-background to-muted/20",
                      viewMode === "list" && "flex-row",
                    )}
                  >
                    <CardContent className={cn("p-0", viewMode === "list" ? "flex items-center" : "")}>
                      <div
                        className={cn(
                          "relative overflow-hidden",
                          viewMode === "grid" ? "aspect-[4/3] rounded-t-lg" : "w-20 h-20 rounded-l-lg flex-shrink-0",
                        )}
                      >
                        {document.type.startsWith("image/") ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/uploads/${document.filename}`}
                            alt={document.originalName}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                            onClick={() => {
                              setPreviewDocument(document)
                              setIsPreviewOpen(true)
                            }}
                          />
                        ) : document.type === "application/pdf" ? (
                          <div
                            className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center cursor-pointer hover:from-red-100 hover:to-red-200 transition-colors"
                            onClick={() => {
                              setPreviewDocument(document)
                              setIsPreviewOpen(true)
                            }}
                          >
                            <FileText className="h-12 w-12 text-red-500" />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                            {getFileIcon(document.type)}
                          </div>
                        )}

                        {document.type.startsWith("image/") && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              <Zap className="h-3 w-3 mr-1" />
                              Enhanced
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className={cn("p-4 flex-1", viewMode === "list" && "flex items-center justify-between")}>
                        <div className={cn(viewMode === "list" ? "flex-1" : "space-y-3")}>
                          <div>
                            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                              {document.originalName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">{formatFileSize(document.size)}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(document.uploadedAt), "MMM d")}
                              </span>
                            </div>
                          </div>

                          {viewMode === "grid" && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  setRenameDoc(document)
                                  setRenameName(document.name)
                                  setRenameFolder(document.folderId as any)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 h-8"
                                onClick={() => {
                                  setPreviewDocument(document)
                                  setIsPreviewOpen(true)
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleShare(document)}
                              >
                                <Share2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteDocument(document._id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {viewMode === "list" && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRenameDoc(document)
                                setRenameName(document.name)
                                setRenameFolder(document.folderId as any)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPreviewDocument(document)
                                setIsPreviewOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleShare(document)}>
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteDocument(document._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              <DialogHeader className="p-6 pb-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">{previewDocument?.originalName}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/uploads/${previewDocument?.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/uploads/${previewDocument?.filename}`}
                        download
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <div className="p-6 pt-0">
                {previewDocument?.type.startsWith("image/") ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/uploads/${previewDocument.filename}`}
                    alt={previewDocument.originalName}
                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg border"
                  />
                ) : previewDocument?.type === "application/pdf" ? (
                  <embed
                    src={`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/uploads/${previewDocument.filename}`}
                    type="application/pdf"
                    className="w-full h-[60vh] rounded-lg border"
                  />
                ) : (
                  <div className="flex items-center justify-center h-60 bg-muted rounded-lg">
                    {previewDocument && getFileIcon(previewDocument.type)}
                    <p className="ml-4 text-muted-foreground">Preview not available for this file type</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <label htmlFor="link" className="text-sm font-medium">
                      Share Link
                    </label>
                    <Input id="link" value={`${window.location.origin}/api/share/${shareDocument?._id}`} readOnly />
                  </div>
                  <Button size="sm" className="px-3" onClick={() => shareDocument && copyShareLink(shareDocument)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Button className="flex-1" onClick={() => shareDocument && copyShareLink(shareDocument)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent" asChild>
                    <a
                      href={`mailto:?subject=Shared Document: ${shareDocument?.originalName}&body=View this document: ${window.location.origin}/api/share/${shareDocument?._id}`}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Email
                    </a>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!renameDoc} onOpenChange={(open) => { if (!open) setRenameDoc(null) }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input value={renameName} onChange={(e) => setRenameName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Folder</label>
                  <Select value={renameFolder ?? "none"} onValueChange={(v) => setRenameFolder(v === "none" ? undefined : v)}>
                    <SelectTrigger><SelectValue placeholder="Select folder" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {folders.map((f) => (
                        <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setRenameDoc(null)}>Cancel</Button>
                  <Button onClick={handleRenameSave}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
