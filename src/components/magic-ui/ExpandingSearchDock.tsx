"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function ExpandingSearchDock({ 
  className,
  onChange 
}: { 
  className?: string;
  onChange?: (value: string) => void;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div 
      className={cn(
        "flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 transition-all duration-300 shadow-xl",
        isExpanded ? "w-80" : "w-12",
        className
      )}
      onClick={() => {
        setIsExpanded(true)
        inputRef.current?.focus()
      }}
    >
      <Search className="h-5 w-5 shrink-0 text-primary" />
      <input
        ref={inputRef}
        placeholder="Search the Elite Network..."
        className={cn(
          "flex-1 bg-transparent text-sm outline-none transition-opacity text-white placeholder:text-stone-600 font-bold",
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onBlur={() => setIsExpanded(false)}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  )
}

