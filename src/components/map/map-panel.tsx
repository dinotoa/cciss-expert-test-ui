"use client"
import { Button } from "@/components/ui/button";
import { MapRectangle } from "@/lib/location-database/geography";
import { logInfo } from "@/lib/logging";
import { cn } from "@/lib/utils";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize } from "lucide-react";
import { useCallback, useEffect } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";

const outerBounds = new L.LatLngBounds(
  [[43, 7.5],
  [45, 8],
  ])

const icons = new Map<string, L.Icon>();

export function createIcon(path: string, size: number, selected: boolean = false) {
  const correctedSize = size > 10 ? size : 40
  const iconSize = selected ? correctedSize + 8 : correctedSize
  const iconName = `${path}-${iconSize}-${selected}`
  logInfo("icon: ", iconName)
  const icon = icons.has(iconName)
    ? icons.get(iconName)!
    : L.icon({
      iconUrl: path,
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2, iconSize / 2],
      popupAnchor: [0, -iconSize],
      className: selected ? "border-red-500 border-4 bg-red-500 rounded-full" : undefined
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
        preferCanvas={true}
        placeholder={<MapPlaceholder />}>
        <MapZoomControl desiredMBR={desiredMBR} fullMBR={fullMBR} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {children}
      </MapContainer>
    </div >
  )
}

function MapZoomControl({ desiredMBR, fullMBR }: { fullMBR?: MapRectangle, desiredMBR?: MapRectangle }) {
  const map = useMap()
  const fitBounds = useCallback((mbr: MapRectangle | undefined) => {
    if (mbr) {
      map.eachLayer(l => l.closePopup())
      map.fitBounds(mbr)
    }
  }, [map])
  useEffect(() => { fitBounds(desiredMBR) },
    [desiredMBR, map, fitBounds])
  return <>
    <ZoomControl position="bottomright" />
    <Button type="button" variant="secondary" className="absolute top-2 left-2 z-[2000] bg-white"
      onClick={() => fitBounds(fullMBR)}><Maximize /></Button>
  </>
}

function MapPlaceholder() {
  return <div className="flex w-full h-full items-center justify-center">Loading...</div>
}

export default MapPanel

