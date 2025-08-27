"use client"
import * as React from "react"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" }

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-4 py-2"
  const styles = variant === "primary"
    ? "bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-600"
    : "border border-gray-300 hover:bg-gray-50"
  return <button className={`${base} ${styles} ${className}`} {...props} />
}


