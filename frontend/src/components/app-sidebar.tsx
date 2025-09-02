"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarIcon, File, Bell, CreditCard } from "lucide-react"
import { useCalendarContext } from "@/components/event-calendar/calendar-context"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import SidebarCalendar from "@/components/sidebar-calendar"
import { useAuth } from "@/lib/auth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isColorVisible } = useCalendarContext()
  const { user } = useAuth()
  const pathname = usePathname()

  const userData = {
    name: user?.email?.split("@")[0] || "User",
    email: user?.email || "user@example.com",
    avatar: "/avatars/shadcn.jpg",
  }

  return (
    <Sidebar
      variant="inset"
      {...props}
      className="scheme-only-light max-lg:p-3 lg:pe-1 bg-sidebar border-sidebar-border"
    >
      <SidebarHeader className="border-b border-sidebar-border/50 pb-4">
        <div className="flex justify-between items-center gap-2">
          <Link className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity" href="/">
            <span className="sr-only">Logo</span>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="w-6 h-6" />
              <span className="font-semibold text-sidebar-foreground text-sm">KilimoPaper</span>
            </div>
          </Link>
          <SidebarTrigger className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors" />
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0 mt-4">
        {/* Navigation items */}
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="uppercase text-sidebar-foreground/60 font-medium text-xs tracking-wider mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <Link href="/dashboard" className="w-full">
                  <SidebarMenuButton
                    className={`w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/70 transition-all duration-200 ${
                      pathname === "/dashboard"
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                        : ""
                    }`}
                  >
                    <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">Overview</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/documents" className="w-full">
                  <SidebarMenuButton
                    className={`w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/70 transition-all duration-200 ${
                      pathname === "/documents"
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                        : ""
                    }`}
                  >
                    <File className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">Documents</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/reminders" className="w-full">
                  <SidebarMenuButton
                    className={`w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/70 transition-all duration-200 ${
                      pathname === "/reminders"
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                        : ""
                    }`}
                  >
                    <Bell className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">Reminders</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/payments" className="w-full">
                  <SidebarMenuButton
                    className={`w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/70 transition-all duration-200 ${
                      pathname === "/payments"
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                        : ""
                    }`}
                  >
                    <CreditCard className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">Payments</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Calendar */}
        <SidebarGroup className="px-2 mt-6 pt-4 border-t border-sidebar-border/50">
          <SidebarGroupLabel className="uppercase text-sidebar-foreground/60 font-medium text-xs tracking-wider mb-3">
            Calendar
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="w-full bg-sidebar-accent/30 rounded-lg p-3 border border-sidebar-border/30">
              <SidebarCalendar className="w-full" />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50 pt-4">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
