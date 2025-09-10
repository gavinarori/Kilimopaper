"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  File, 
  Bell, 
  CreditCard, 
  Plus, 
  Upload, 
  Folder,
  Calendar,
  TrendingUp,
  Clock
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { format } from "date-fns"
import Link from "next/link"

interface Reminder {
  _id: string
  title: string
  dueDateIso: string
  channel: "email" | "sms"
  ownerId: string
  createdAt: string
  updatedAt: string
}

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
}

interface Folder {
  _id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  documentCount: number
}

export default function DashboardPage() {
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([])
  const [recentReminders, setRecentReminders] = useState<Reminder[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [docsResult, remindersResult, foldersResult] = await Promise.all([
          apiFetch<Document[]>("/api/documents?limit=5"),
          apiFetch<Reminder[]>("/api/reminders?limit=5"),
          apiFetch<Folder[]>("/api/folders")
        ])

        if (docsResult.data) setRecentDocuments(docsResult.data)
        if (remindersResult.data) setRecentReminders(remindersResult.data)
        if (foldersResult.data) setFolders(foldersResult.data)
      } catch (error) {
        toast.error("Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type?.includes('pdf')) return '📄'
    if (type?.includes('image')) return '🖼️'
    if (type?.includes('word') || type?.includes('document')) return '📝'
    if (type?.includes('excel') || type?.includes('spreadsheet')) return '📊'
    if (type?.includes('powerpoint') || type?.includes('presentation')) return '📽️'
    return '📁'
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
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
          <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back! Here's an overview of your agricultural export activities.
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/documents">
                  <Button variant="outline">
                    <File className="h-4 w-4 mr-2" />
                    View All Documents
                  </Button>
                </Link>
                <Link href="/reminders">
                  <Button variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    View All Reminders
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                  <File className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentDocuments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last week
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentReminders.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Due this week
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Folders</CardTitle>
                  <Folder className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{folders.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Organized documents
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatFileSize(recentDocuments.reduce((acc, doc) => acc + doc.size, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total file size
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Documents */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Documents</CardTitle>
                    <Link href="/documents">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <File className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No documents yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Upload your first document to get started
                      </p>
                      <Link href="/documents">
                        <Button>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Documents
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentDocuments.map((document) => (
                        <div key={document._id} className="flex items-center gap-3 p-3 rounded-lg border">
                          <span className="text-2xl">{getFileIcon(document.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{document.originalName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(document.size)} • {format(new Date(document.uploadedAt), "MMM d")}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {document.type?.split('/')[1]?.toUpperCase() || 'FILE'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Reminders */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Reminders</CardTitle>
                    <Link href="/reminders">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentReminders.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No reminders yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Create your first reminder to stay organized
                      </p>
                      <Link href="/reminders">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Reminder
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentReminders.map((reminder) => (
                        <div key={reminder._id} className="flex items-center gap-3 p-3 rounded-lg border">
                          <div className="flex-shrink-0">
                            <div className={`w-3 h-3 rounded-full ${reminder.channel === 'email' ? 'bg-blue-500' : 'bg-green-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{reminder.title}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(reminder.dueDateIso), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <Badge variant={reminder.channel === 'email' ? 'default' : 'secondary'} className="text-xs">
                            {reminder.channel.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Link href="/documents">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <Upload className="h-6 w-6" />
                      <span>Upload Documents</span>
                    </Button>
                  </Link>
                  <Link href="/reminders">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <Bell className="h-6 w-6" />
                      <span>Create Reminder</span>
                    </Button>
                  </Link>
                  <Link href="/payments">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <CreditCard className="h-6 w-6" />
                      <span>View Payments</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
