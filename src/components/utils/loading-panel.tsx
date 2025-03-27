import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import React from "react"

const LoadingPanel: React.FC<{
    id?: string
    className?: string,
    message?: string
}> = ({ id = "loading-panel", className, message = "loading..." }) => {
    return (
        <div id={id} className={cn("flex h-full w-full items-center justify-center", className)}>
            < Loader2 className="h-10 w-10 mx-2 animate-spin text-primary" /> {message}
        </div >
    )
}

export default LoadingPanel