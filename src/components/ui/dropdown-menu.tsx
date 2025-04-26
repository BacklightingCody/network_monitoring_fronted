import React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <div className="relative inline-block text-left">{children}</div>
}

interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

export function DropdownMenuTrigger({ 
  asChild = false, 
  children 
}: DropdownMenuTriggerProps) {
  return (
    <div className="inline-flex">
      {asChild ? (
        children
      ) : (
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-border shadow-sm px-4 py-2 bg-background text-sm font-medium text-foreground hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          {children}
        </button>
      )}
    </div>
  )
}

interface DropdownMenuContentProps {
  align?: "start" | "center" | "end"
  children: React.ReactNode
  className?: string
}

export function DropdownMenuContent({ 
  align = "start", 
  children,
  className
}: DropdownMenuContentProps) {
  const alignClasses = {
    start: "origin-top-left left-0",
    center: "origin-top",
    end: "origin-top-right right-0",
  }

  return (
    <div
      className={cn(
        "absolute mt-2 w-56 rounded-md shadow-lg bg-popover border border-border ring-1 ring-black ring-opacity-5 divide-y divide-border z-50",
        alignClasses[align],
        className
      )}
    >
      <div className="py-1">{children}</div>
    </div>
  )
}

interface DropdownMenuItemProps {
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

export function DropdownMenuItem({ 
  onClick, 
  disabled = false,
  children,
  className
}: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent/50 hover:text-foreground",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} 