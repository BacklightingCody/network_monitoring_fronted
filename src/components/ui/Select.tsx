"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

const SelectContext = React.createContext<{
  value: string
  onChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}>({
  value: "",
  onChange: () => {},
  open: false,
  setOpen: () => {},
})

export interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Select({ value, onValueChange, children, className }: SelectProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ value, onChange: onValueChange, open, setOpen }}>
      <div className={`relative ${className || ""}`}>
        {children}
        {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
      </div>
    </SelectContext.Provider>
  )
}

export interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  const { open, setOpen } = React.useContext(SelectContext)

  return (
    <div
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className || ""}`}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </div>
  )
}

export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
  const { value } = React.useContext(SelectContext)

  return <span className={`block truncate ${className || ""}`}>{value || placeholder}</span>
}

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export function SelectContent({ className, children, ...props }: SelectContentProps) {
  const { open } = React.useContext(SelectContext)

  if (!open) return null

  return (
    <div
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 mt-1 ${className || ""}`}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  )
}

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  className?: string
  children?: React.ReactNode
}

export function SelectItem({ value, className, children, ...props }: SelectItemProps) {
  const { value: selectedValue, onChange, setOpen } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  const handleClick = () => {
    onChange(value)
    setOpen(false)
  }

  return (
    <div
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${isSelected ? "bg-accent text-accent-foreground" : ""} ${className || ""}`}
      onClick={handleClick}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </span>
      <span className="truncate">{children}</span>
    </div>
  )
}

