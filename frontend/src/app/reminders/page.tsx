"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Mail, MessageSquare } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { format } from "date-fns"

interface Reminder {
  _id: string
  title: string
  dueDateIso: string
  channel: "email" | "sms"
  ownerId: string
  createdAt: string
  updatedAt: string
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const result = await apiFetch<Reminder[]>("/api/reminders")
      if (result.error) {
        toast.error("Failed to load reminders")
        return
      }
      if (result.data) {
        setReminders(result.data)
      }
    } catch (error) {
      toast.error("Failed to load reminders")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return

    try {
      const result = await apiFetch(`/api/reminders/${id}`, {
        method: "DELETE",
      })

      if (result.error) {
        toast.error("Failed to delete reminder")
        return
      }

      setReminders(prev => prev.filter(r => r._id !== id))
      toast.success("Reminder deleted successfully")
    } catch (error) {
      toast.error("Failed to delete reminder")
    }
  }

  const getChannelIcon = (channel: "email" | "sms") => {
    return channel === "email" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />
  }

  const getChannelColor = (channel: "email" | "sms") => {
    return channel === "email" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading reminders...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <div className="border-b p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Reminders</h1>
                <Button onClick={() => window.location.href = "/dashboard"}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Reminder
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-6">
              {reminders.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No reminders yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first reminder to get started
                  </p>
                  <Button onClick={() => window.location.href = "/dashboard"}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Reminder
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {reminders.map((reminder) => (
                    <Card key={reminder._id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{reminder.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={getChannelColor(reminder.channel)}>
                              {getChannelIcon(reminder.channel)}
                              <span className="ml-1 capitalize">{reminder.channel}</span>
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(reminder._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Due Date:</span>
                            <span className="font-medium">
                              {format(new Date(reminder.dueDateIso), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Created:</span>
                            <span>{format(new Date(reminder.createdAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}


