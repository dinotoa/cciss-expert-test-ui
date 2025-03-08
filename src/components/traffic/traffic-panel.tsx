"use client"
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { TrafficEventToolResponse } from "@/ai/traffic-agent/traffic-tools"
import *  as turf from "@turf/turf"
import { MapRectangle } from "@/lib/location-database/geography";
import { logInfo } from "@/lib/logging";
import { Button } from "../ui/button";
import { Maximize2, Minimize2, ZoomIn } from "lucide-react";
import { TrafficEventType } from "@/lib/traffic-database/traffic-database-types";
import { Feature, FeatureCollection, Geometry } from "geojson";

interface TrafficPanelProps extends React.HTMLProps<HTMLElement> {
  eventData: TrafficEventToolResponse
}

// Helper function to convert turf bbox to leaflet bounds
const turfBboxToLeafletBounds = (bbox: number[]): MapRectangle => {
  // bbox format: [minX, minY, maxX, maxY] (or [west, south, east, north])
  // Leaflet bounds format: [[south, west], [north, east]] or [[minY, minX], [maxY, maxX]]
  return [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];
};

const MapPanel = dynamic(() => import("./traffic-map"), { ssr: false })

const TrafficEventPanel: React.FC<TrafficPanelProps> = ({ id, className, eventData }) => {
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
  const fullMbr = eventData.events ? turfBboxToLeafletBounds(turf.bbox(eventData.events)) : turfBboxToLeafletBounds([8, 40, 12, 45])
  const [mapMBR, setMapMBR] = useState(fullMbr)
  logInfo(eventData)
  return eventData.displayMap && eventData.events?.features.length ?
    <section ref={panelRef} id={id} className={cn("relative w-full h-[30rem] flex flex-row justify-between items-start gap-0",
      isFullscreen ? "bg-background" : "relative", className)}>
      <Button variant="outline" className="absolute top-6 right-2 z-[2000]" onClick={toggleFullscreen}>
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>

      <EventListPanel className="w-[50%] h-full" events={eventData.events || []} setMapMBR={setMapMBR} />
      <MapPanel className="w-[75%] h-full" desiredMBR={mapMBR} setMapMBR={setMapMBR} fullMBR={fullMbr}
        events={eventData.events}
        iconUrl="https://luceverde.it/icons/city-map-pin.svg" />
    </section>
    : null
}

interface EventListPanelProps extends React.HTMLProps<HTMLElement> {
  events: FeatureCollection<Geometry, TrafficEventType>,
  setMapMBR: (mbr: MapRectangle) => void
}

const EventListPanel: React.FC<EventListPanelProps> = ({ id, className, events, setMapMBR }) => {
  return (
    <aside id={id} className={cn("flex flex-col h-full w-full items-start border border-neutral-200", className)}>
      <ScrollArea className="w-full overflow-auto">
        {events && events.features.map(evt => (
          <div key={evt.properties.id} className="border-b border-neutral-200 hover:bg-neutral-200 p-2">
            <TrafficEventCard event={evt} setMapMBR={setMapMBR} />
          </div>
        ))}
      </ScrollArea>
    </aside>
  )
}

interface TrafficEventCardProps {
  event: Feature<Geometry, TrafficEventType>
  setMapMBR: (mbr: MapRectangle) => void
}

export function TrafficEventCard({ event, setMapMBR }: TrafficEventCardProps) {
  const bbox = turfBboxToLeafletBounds(turf.bbox(event))

  return (
    <div key={event.properties.id} className="relative flex flex-row justify-between items-center w-full">
      <div>
        <p className="font-bold">{event.properties.road}</p>
        <p>Agg.: {new Date(event.properties.updateDate).toLocaleString()}</p>
        <p>{event.properties.description}</p>
        <p>{event.properties.location}</p>
        {event.properties.source && <p className="font-bold">Fonte: {event.properties.source}</p>}
      </div>
      <Button variant="ghost" onClick={() => setMapMBR(bbox)}>
        <ZoomIn />
      </Button>
    </div>
  )
}
export default TrafficEventPanel