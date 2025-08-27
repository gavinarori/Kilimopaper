"use client"
import * as React from "react"

type Option = { value: string; label: string }
type Props = React.SelectHTMLAttributes<HTMLSelectElement> & { options: Option[] }

export function Select({ options, className = "", ...props }: Props) {
  return (
    <select className={`h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${className}`} {...props}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}


