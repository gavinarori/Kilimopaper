"use client"

import { useEffect, useState, useRef } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CalendarProvider } from "@/components/event-calendar/calendar-context"
import { EventCalendar, type CalendarEvent } from "@/components/event-calendar"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"

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
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const lastNotifiedIdsRef = useRef<Set<string>>(new Set())

  // Request browser notification permission once
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {})
      }
    }
  }, [])

  // Fetch reminders and convert to calendar events
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const result = await apiFetch<Reminder[]>("/api/reminders")
        if (result.error) {
          toast.error("Failed to load reminders")
          return
        }
        if (result.data) {
          const mapped: CalendarEvent[] = result.data.map((r) => ({
            id: r._id,
            title: r.title,
            start: new Date(r.dueDateIso),
            end: new Date(new Date(r.dueDateIso).getTime() + 60 * 60 * 1000),
            allDay: false,
            color: r.channel === "email" ? "blue" : "emerald",
          }))
          setEvents(mapped)
        }
      } catch {
        toast.error("Failed to load reminders")
      } finally {
        setIsLoading(false)
      }
    }
    fetchReminders()
  }, [])

  // Poll due reminders and notify
  useEffect(() => {
    const pollDue = async () => {
      try {
        const result = await apiFetch<Reminder[]>("/api/reminders/due?days=1")
        if (result.data) {
          result.data.forEach((r) => {
            const isDue = new Date(r.dueDateIso).getTime() <= Date.now()
            if (isDue && !lastNotifiedIdsRef.current.has(r._id)) {
              // Browser notification if allowed, else toast
              if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                new Notification("Reminder due", { body: r.title })
              } else {
                toast(`${r.title}`, { description: "Reminder due", position: "bottom-left" })
              }
              lastNotifiedIdsRef.current.add(r._id)
            }
          })
        }
      } catch {
        // silent
      }
    }

    // Start polling every 60s
    pollDue()
    pollingRef.current = setInterval(pollDue, 60_000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  // Handlers for calendar CRUD
  const handleEventAdd = async (event: CalendarEvent) => {
    try {
      const result = await apiFetch<Reminder>("/api/reminders", {
        method: "POST",
        body: JSON.stringify({
          title: event.title || "Untitled",
          dueDateIso: event.start.toISOString(),
          channel: "email",
        }),
      })
      if (result.error) {
        toast.error("Failed to create reminder")
        return
      }
      if (result.data) {
        const newEvent: CalendarEvent = {
          ...event,
          id: result.data._id,
          color: "blue",
        }
        setEvents((prev) => [...prev, newEvent])
        toast.success("Reminder created")
      }
    } catch {
      toast.error("Failed to create reminder")
    }
  }

  const handleEventUpdate = async (event: CalendarEvent) => {
    try {
      const result = await apiFetch<Reminder>(`/api/reminders/${event.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: event.title,
          dueDateIso: event.start.toISOString(),
          channel: "email",
        }),
      })
      if (result.error) {
        toast.error("Failed to update reminder")
        return
      }
      setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)))
      toast.success("Reminder updated")
    } catch {
      toast.error("Failed to update reminder")
    }
  }

  const handleEventDelete = async (eventId: string) => {
    try {
      const result = await apiFetch(`/api/reminders/${eventId}`, { method: "DELETE" })
      if (result.error) {
        toast.error("Failed to delete reminder")
        return
      }
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
      toast.success("Reminder deleted")
    } catch {
      toast.error("Failed to delete reminder")
    }
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex flex-1 h-screen">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-2 p-2 pt-0">
              <CalendarProvider>
                {!isLoading && (
                  <EventCalendar
                    events={events}
                    onEventAdd={handleEventAdd}
                    onEventUpdate={handleEventUpdate}
                    onEventDelete={handleEventDelete}
                    initialView="week"
                  />
                )}
              </CalendarProvider>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}


