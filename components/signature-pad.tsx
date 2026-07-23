"use client"

import { useEffect, useRef, useState } from "react"
import { renderTypedSignature } from "@/lib/signature"
import { cn } from "@/lib/utils"

type Mode = "typed" | "drawn"

/** Shared signature capture widget — type a name (rendered in a script font) or draw with mouse/touch. */
export function SignaturePad({
  defaultName,
  onCapture,
}: {
  defaultName: string
  onCapture: (dataUrl: string, method: Mode, name: string) => void
}) {
  const [mode, setMode] = useState<Mode>("typed")
  const [name, setName] = useState(defaultName)
  const [typedPreview, setTypedPreview] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const hasDrawnRef = useRef(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    if (mode !== "typed") return
    setTypedPreview(name.trim() ? renderTypedSignature(name.trim()) : "")
  }, [mode, name])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    hasDrawnRef.current = false
    setHasDrawn(false)
  }

  const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true
    hasDrawnRef.current = true
    setHasDrawn(true)
    const ctx = canvasRef.current?.getContext("2d")
    const { x, y } = pointerPos(e)
    ctx?.beginPath()
    ctx?.moveTo(x, y)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const ctx = canvasRef.current?.getContext("2d")
    const { x, y } = pointerPos(e)
    if (!ctx) return
    ctx.strokeStyle = "#1a1a1a"
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const endDraw = () => {
    drawingRef.current = false
  }

  const canConfirm = !!name.trim() && (mode === "typed" || hasDrawn)

  const confirm = () => {
    if (!name.trim()) return
    if (mode === "typed") {
      onCapture(renderTypedSignature(name.trim()), "typed", name.trim())
    } else {
      if (!hasDrawnRef.current || !canvasRef.current) return
      onCapture(canvasRef.current.toDataURL("image/png"), "drawn", name.trim())
    }
  }

  return (
    <div className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your full name"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20"
      />

      <div className="flex gap-1.5 rounded-lg bg-secondary p-1">
        <button
          type="button"
          onClick={() => setMode("typed")}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "typed" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Type
        </button>
        <button
          type="button"
          onClick={() => setMode("drawn")}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "drawn" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Draw
        </button>
      </div>

      {mode === "typed" ? (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-white">
          {typedPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={typedPreview} alt="Signature preview" className="h-16 object-contain" />
          ) : (
            <span className="text-xs text-muted-foreground">Type your name above to preview</span>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <canvas
            ref={canvasRef}
            width={480}
            height={160}
            onPointerDown={startDraw}
            onPointerMove={draw}
            onPointerUp={endDraw}
            onPointerLeave={endDraw}
            className="h-24 w-full touch-none rounded-lg border border-dashed border-border bg-white"
          />
          <button type="button" onClick={clearCanvas} className="text-xs font-medium text-muted-foreground hover:text-foreground">
            Clear
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={confirm}
        disabled={!canConfirm}
        className="w-full rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Save signature
      </button>
    </div>
  )
}
