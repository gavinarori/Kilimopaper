"use client"

import { useEffect, useState } from "react"
import { useCalendarContext } from "@/components/event-calendar/calendar-context"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface SidebarCalendarProps {
  className?: string
}

export default function SidebarCalendar({ className }: SidebarCalendarProps) {
  // Use the shared calendar context
  const { currentDate, setCurrentDate } = useCalendarContext()

  // Track the month to display in the calendar
  const [calendarMonth, setCalendarMonth] = useState<Date>(currentDate)

  // Update the calendar month whenever currentDate changes
  useEffect(() => {
    setCalendarMonth(currentDate)
  }, [currentDate])

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date)
    }
  }

  return (
    <div className={cn("w-full flex justify-center", className)}>
      <Calendar
        mode="single"
        selected={currentDate}
        onSelect={handleSelect}
        month={calendarMonth}
        onMonthChange={setCalendarMonth}
        classNames={{
          months: "space-y-4",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center text-sidebar-foreground",
          caption_label: "text-sm font-medium text-sidebar-foreground",
          nav: "space-x-1 flex items-center",
          nav_button:
            "h-7 w-7 bg-transparent p-0 text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-sidebar-foreground rounded-md w-8 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-sidebar-accent/50 [&:has([aria-selected].day-outside)]:bg-sidebar-accent/30 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          day: "h-8 w-8 p-0 font-normal text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors rounded-md",
          day_range_end: "day-range-end",
          day_selected:
            "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground focus:bg-sidebar-primary focus:text-sidebar-primary-foreground font-medium shadow-sm",
          day_today: "bg-sidebar-accent/40 text-sidebar-foreground font-medium border border-sidebar-border/50",
          day_outside:
            "day-outside text-sidebar-foreground/30 opacity-50 aria-selected:bg-sidebar-accent/30 aria-selected:text-sidebar-foreground/60 aria-selected:opacity-30",
          day_disabled: "text-sidebar-foreground/20 opacity-50",
          day_range_middle: "aria-selected:bg-sidebar-accent/50 aria-selected:text-sidebar-foreground",
          day_hidden: "invisible",
        }}
      />
    </div>
  )
}
