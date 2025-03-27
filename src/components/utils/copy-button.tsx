"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { logErr } from "@/lib/logging"

const DELAY = 1500

interface CopyButtonProps {
  value: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

function CopyButton({ value, variant = "outline", size = "icon", className }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false)

  const copyToClipboard = async () => {
    if (hasCopied) return

    try {
      await navigator.clipboard.writeText(value)
      setHasCopied(true)

      setTimeout(() => {
        setHasCopied(false)
      }, DELAY)
    } catch (error) {
      logErr("Failed to copy text: ", error)
    }
  }

  return (
    <Button
      variant={hasCopied ? "secondary" : variant}
      size={size}
      onClick={copyToClipboard}
      className={cn(className, hasCopied && "animate-pulse")}
      aria-label={hasCopied ? "Copied" : "Copy to clipboard"}
    >
      {hasCopied ? (
        <Check className="size-4 animate-in zoom-in-50 duration-500 rotate-in-12" />
      ) : (
        <Copy className="size-4 animate-in fade-in duration-500" />
      )}
    </Button>
  )
}

export default CopyButton