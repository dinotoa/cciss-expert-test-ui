"use client"
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import * as L from "leaflet";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";
import { MapRectangle } from "@/lib/location-database/geography";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { Maximize } from "lucide-react";
import { logInfo } from "@/lib/logging";

const outerBounds = new L.LatLngBounds(
  [[43, 7.5],
  [45, 8],
  ])

const maxBounds = new L.LatLngBounds([
  [40, 5], [49, 22]
])

export function createIcon(path: string, size: number) {
  const iconSize = size > 10 ? size : 46
  const icon = L.icon({
    iconUrl: path,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
    popupAnchor: [0, -iconSize],
  })
  return icon
}

interface MapPanelProps extends React.HTMLProps<HTMLElement> {
  desiredMBR?: MapRectangle,
  fullMBR?: MapRectangle
}

const MapPanel: React.FC<MapPanelProps> = ({ id = "map-panel", className, children, desiredMBR, fullMBR }) => {
  return (
    <div id={id} className={cn("flex w-full h-full", className)}>
      <MapContainer id="leaflet-map" className="flex w-full h-full min-w-full"
        bounds={desiredMBR ? desiredMBR : outerBounds}
        // maxBounds={maxBounds}
        zoomControl={false}
        placeholder={<MapPlaceholder />}>
        <MapZoomControl desiredMBR={desiredMBR} fullMBR={fullMBR}/>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {children}
      </MapContainer>
    </div >
  )
}

function MapZoomControl({ desiredMBR, fullMBR }: { fullMBR?: MapRectangle, desiredMBR?: MapRectangle }) {
  const map = useMap()
  useEffect(() => { map.fitBounds(desiredMBR || outerBounds) },
    [desiredMBR, map])
  logInfo("full mbr", fullMBR)
  return <>
    <ZoomControl position="bottomright" />
    <Button type="button" variant="secondary" className="absolute top-2 left-2 z-[2000] bg-white"
      onClick={() => fullMBR && map.fitBounds(fullMBR)}><Maximize /></Button>
  </>
}

function MapPlaceholder() {
  return <div className="flex w-full h-full items-center justify-center">Loading...</div>
}

export default MapPanel

