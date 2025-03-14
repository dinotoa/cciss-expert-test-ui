"use client"
import { LocationDbResponseType } from "@/ai/locationdb-agent/locationdb-tools"
import { MapRectangle, rectangleXyToLonLat } from "@/lib/location-database/geography"
import { LDbFeature } from "@/lib/location-database/location-db-types"
import { getLdbFeatures } from "@/lib/location-database/locationdb-server"
import { logInfo } from "@/lib/logging"
import { cn } from "@/lib/utils"
import * as turf from "@turf/turf"
import { ScanSearch } from "lucide-react"
import dynamic from "next/dynamic"
import React, { useEffect, useMemo, useState } from "react"
import LoadingPanel from "../loading-panel"
import FullScreenPanel from "../tools/fullscreen-panel"
import SearchableListPanel from "../tools/searchable-list"
import { Button } from "../ui/button"

interface TrafficPanelProps extends React.HTMLProps<HTMLElement> {
  locationData: LocationDbResponseType
}

const MapPanel = dynamic(() => import("./locationdb-map"), { ssr: false })

const LocationDatabasePanel: React.FC<TrafficPanelProps> = ({ id = "location-panel", className, locationData }) => {
  const loadFeatures = async () => {
    logInfo("ldb-pnl: loading", locationData?.locations?.length, "features", locationData)
    const features = await getLdbFeatures(locationData.locations ? locationData.locations?.map(l => l.id) : [])
    setFeatures(features)
    setMapMBR(features?.length ? rectangleXyToLonLat(turf.bbox(turf.featureCollection(features))) : undefined)
  }
  const [searchTerm, setSearchTerm] = useState("")
  const [features, setFeatures] = useState<LDbFeature[]>()
  const [mapMBR, setMapMBR] = useState<MapRectangle>()
  const [selectedId, setSelectedId] = useState<number>(-1)

  useEffect(() => {
    loadFeatures()
  }, [locationData])
  const filteredLocations = useMemo(() => features?.length ?
    features?.filter(e => e.properties.name.toLowerCase().includes(searchTerm.toLowerCase())) : [],
    [features, searchTerm])
  const fullMBR = useMemo(() => {
    if (filteredLocations?.length) {
      const bbox = turf.bbox(turf.featureCollection(filteredLocations))
      return [[bbox[1], bbox[0]], [bbox[3], bbox[2]]] as MapRectangle
    }
    return undefined
  }, [filteredLocations])
  return (
    <FullScreenPanel id={id} className={cn("flex flex-col justify-between w-full h-[30rem]", className)}>
      <section id={`${id}__container`} className={"relative w-full h-full flex flex-row justify-between items-start gap-1"}>
        {features === undefined
          ? <LoadingPanel message="Caricamento dati..." />
          : <SearchableListPanel id={`${id}__search`} className="w-[30%] h-full p-2" searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
            <ul role="listbox" className="w-full h-full">
              {filteredLocations?.map(location => (
                <li key={location.properties.id} 
                  className={cn("w-full rounded", selectedId === location.properties.id ? "bg-primary text-primary-foreground" : "")} 
                  onClick={() => setSelectedId(location.properties.id)}>
                  <LocationDataPanel key={location.properties.id} feature={location} setMapMBR={setMapMBR} />
                </li>
              ))}
            </ul>
          </SearchableListPanel>
        }
        <MapPanel id={`${id}__map`} className="w-[70%] h-full" features={filteredLocations} fullMBR={fullMBR} desiredMBR={mapMBR} setMapMBR={setMapMBR} />
      </section>
    </FullScreenPanel>
  )
}

interface LocationDataPanelProps extends React.HTMLProps<HTMLElement> {
  feature: LDbFeature
  setMapMBR: (mbr: MapRectangle) => void
}

const LocationDataPanel: React.FC<LocationDataPanelProps> = ({ id, className, feature, setMapMBR }) => {
  return <div id={id} className={cn("flex flex-row justify-between items-center gap-1 p-2 rounded", className)}>
    <div className="w-full">
      <p>{feature.properties.tmcTypeDescription ?? feature.properties.type}</p>
      <p className="font-bold text">{feature.properties.name}</p>
    </div>
    <Button type="button" variant="secondary" className="w-8 h-8 p-2" onClick={() => { setMapMBR(rectangleXyToLonLat(turf.bbox(feature))) }}>
      <ScanSearch />
    </Button>
  </div>
}

export default LocationDatabasePanel