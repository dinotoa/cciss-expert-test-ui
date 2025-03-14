"use client"
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FullScreenPanel: React.FC<{ id?: string; className?: string; children: React.ReactNode }> = ({ id, className, children }) => {
    const [isFullscreen, setIsFullscreen] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)
    // Handle fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement === panelRef.current)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }, [])

    // Toggle fullscreen
    const toggleFullscreen = async () => {
        if (!panelRef.current) return

        try {
            if (!isFullscreen) {
                await panelRef.current.requestFullscreen()
                window.dispatchEvent(new Event('resize'));
            } else {
                await document.exitFullscreen()
                window.dispatchEvent(new Event('resize'));
            }
        } catch (error) {
            console.error("Fullscreen API error:", error)
        }
    }

    return (
        <div ref={panelRef} id={id} className={cn("relative flex flex-col justify-between items-start w-full h-full m-0 p-0 bg-background", className)}>
            <Button variant="outline" className="absolute top-2 right-2 z-[2000]" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {children}
        </div>
    )
}

export default FullScreenPanel