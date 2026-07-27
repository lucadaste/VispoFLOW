"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

type Suggestion = { formatted: string; placeId: string }

/** A textarea that suggests full addresses as the user types, backed by Geoapify autocomplete. */
export function AddressAutocomplete({
  value,
  onChange,
  onEnter,
  placeholder,
  className,
  rows = 2,
}: {
  value: string
  onChange: (value: string) => void
  /** Called when Enter is pressed while no suggestion dropdown is open — lets single-line chat bars submit on Enter. */
  onEnter?: () => void
  placeholder?: string
  className?: string
  rows?: number
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const [dropUp, setDropUp] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Grow the textarea to fit wrapped text instead of clipping it to `rows`.
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  useEffect(() => {
    const text = value.trim()
    if (text.length < 3) {
      setSuggestions([])
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    const timer = setTimeout(() => {
      fetch(`/api/geocode/autocomplete?text=${encodeURIComponent(text)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data.suggestions ?? [])
          setHighlighted(0)
          setLoading(false)
        })
        .catch((err) => {
          if (err.name === "AbortError") return
          setSuggestions([])
          setLoading(false)
        })
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const select = (s: Suggestion) => {
    onChange(s.formatted)
    setSuggestions([])
    setOpen(false)
  }

  const showDropdown = open && (suggestions.length > 0 || (loading && value.trim().length >= 3))

  // Flip the dropdown above the field when there isn't enough room below (e.g. a chat
  // composer pinned near the bottom of the viewport), so suggestions don't render off-page.
  useLayoutEffect(() => {
    if (!showDropdown || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const estimatedHeight = Math.min(suggestions.length || 1, 5) * 40 + 8
    setDropUp(window.innerHeight - rect.bottom < estimatedHeight && rect.top > estimatedHeight)
  }, [showDropdown, suggestions.length])

  return (
    <div ref={containerRef} className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!showDropdown) {
            if (e.key === "Enter" && !e.shiftKey && onEnter) {
              e.preventDefault()
              onEnter()
            }
            return
          }
          if (e.key === "Escape") {
            setOpen(false)
            return
          }
          if (suggestions.length === 0) return
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setHighlighted((i) => Math.min(i + 1, suggestions.length - 1))
          } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setHighlighted((i) => Math.max(i - 1, 0))
          } else if (e.key === "Enter") {
            e.preventDefault()
            select(suggestions[highlighted])
          }
        }}
        className={cn(className, "resize-none overflow-hidden")}
      />
      {showDropdown && (
        <ul
          className={cn(
            "absolute z-20 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg",
            dropUp ? "bottom-full mb-1" : "top-full mt-1",
          )}
        >
          {suggestions.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">Searching…</li>
          )}
          {suggestions.map((s, i) => (
            <li key={s.placeId}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(s)}
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors",
                  i === highlighted ? "bg-secondary text-foreground" : "text-foreground hover:bg-secondary",
                )}
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span>{s.formatted}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
