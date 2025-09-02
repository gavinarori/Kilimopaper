"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Calendar, 
  Bell, 
  File, 
  CreditCard, 
  Plus, 
  LogOut 
} from "lucide-react";
import { useAuth } from "@/lib/auth";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const userData = {
    name: user?.email?.split('@')[0] || "User",
    email: user?.email || "user@example.com",
    avatar: "/avatars/shadcn.jpg",
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <div className="flex items-center gap-2 px-2">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Calendar className="size-4" />
          </div>
          <span className="font-semibold">Agri-Export</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard" className="w-full">
              <SidebarMenuButton className={pathname === "/dashboard" ? "bg-accent" : ""}>
                <Calendar className="h-4 w-4" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/documents" className="w-full">
              <SidebarMenuButton className={pathname === "/documents" ? "bg-accent" : ""}>
                <File className="h-4 w-4" />
                <span>Documents</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/reminders" className="w-full">
              <SidebarMenuButton className={pathname === "/reminders" ? "bg-accent" : ""}>
                <Bell className="h-4 w-4" />
                <span>Reminders</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/payments" className="w-full">
              <SidebarMenuButton className={pathname === "/payments" ? "bg-accent" : ""}>
                <CreditCard className="h-4 w-4" />
                <span>Payments</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="mx-0" />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}