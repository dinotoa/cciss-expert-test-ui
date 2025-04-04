"use client"
import { LocationDbResponseType } from "@/ai/locationdb-agent/locationdb-tools"
import { MapRectangle, rectangleXyToLonLat } from "@/lib/location-database/geography"
import { LDbFeature, LdbFeatureTypeEnum, LDbRoadProps } from "@/lib/location-database/location-db-types"
import { getLdbFeatures } from "@/lib/location-database/locationdb-server"
import { logInfo } from "@/lib/logging"
import { cn } from "@/lib/utils"
import * as turf from "@turf/turf"
import { ZoomIn } from "lucide-react"
import dynamic from "next/dynamic"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import LoadingPanel from "../utils/loading-panel"
import FullScreenPanel from "../utils/fullscreen-panel"
import SearchableListPanel from "../utils/searchable-list"
import { Button } from "../ui/button"

interface LocationDatabasePanelProps extends React.HTMLProps<HTMLElement> {
  createItemPanel?: (item: LDbFeature) => React.ReactNode
  locationData: LocationDbResponseType
}

const MapPanel = dynamic(() => import("./locationdb-map"), { ssr: false })

const LocationDatabasePanel: React.FC<LocationDatabasePanelProps> = ({ id = "location-panel", className, locationData }) => {
  const loadFeatures = useCallback(async () => {
    logInfo("ldb-pnl: loading", locationData?.locations?.length, "features", locationData)
    const features = await getLdbFeatures(locationData.locations ? locationData.locations?.map(l => l.id) : [])
    setFeatures(features)
    setMapMBR(features?.length ? rectangleXyToLonLat(turf.bbox(turf.featureCollection(features))) : undefined)
  }, [locationData])
  const [searchTerm, setSearchTerm] = useState("")
  const [features, setFeatures] = useState<LDbFeature[]>()
  const [mapMBR, setMapMBR] = useState<MapRectangle>()
  const [selectedItem, setSelectedItem] = useState<LDbFeature | null>(null)
  const selectFeature = useCallback((feature: LDbFeature) => {
    setSelectedItem(feature)
    if (feature) {
      setMapMBR(rectangleXyToLonLat(turf.bbox(feature)))
    }
  }, [])
  useEffect(() => {
    loadFeatures()
  }, [loadFeatures])
  const filteredLocations = useMemo(() => features?.length ?
    features?.filter(e => (e.properties.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())) : [],
    [features, searchTerm])
  const fullMBR = useMemo(() => {
    if (filteredLocations?.length) {
      const bbox = turf.bbox(turf.featureCollection(filteredLocations))
      return rectangleXyToLonLat(bbox)
    }
    return undefined
  }, [filteredLocations])
  const createItemPanel = (item: LDbFeature) => <LocationDataPanel feature={item} setMapMBR={setMapMBR} />
  return (
    <FullScreenPanel id={id} className={cn("flex flex-col justify-between w-full h-[30rem]", className)}>
      <section id={`${id}__container`} className={"relative w-full h-full flex flex-row justify-between items-start gap-1 border"}>
        {features === undefined
          ? <LoadingPanel message="Caricamento dati..." />
          : <SearchableListPanel<LDbFeature> id={`${id}__search`} className="w-[30%] h-full p-1"
            searchTerm={searchTerm} setSearchTerm={setSearchTerm} getElementKey={(item) => item?.properties?.id.toString()}
            items={filteredLocations} onSelectionChange={selectFeature} selectedElement={selectedItem}
            createElementPanel={createItemPanel} />
        }
        <MapPanel id={`${id}__map`} className="w-[70%] h-full"
          features={filteredLocations} selectedFeature={selectedItem} setSelectedFeature={selectFeature}
          fullMBR={fullMBR} desiredMBR={mapMBR} setMapMBR={setMapMBR} />
      </section>
    </FullScreenPanel>
  )
}

interface LocationDataPanelProps extends React.HTMLProps<HTMLElement> {
  feature: LDbFeature
  setMapMBR: (mbr: MapRectangle) => void
}

export const LocationDataPanel: React.FC<LocationDataPanelProps> = ({ id, className, feature, setMapMBR }) => {
  const extremes = useMemo(() => {
    if (feature.properties.type === LdbFeatureTypeEnum.Road || feature.properties.type === LdbFeatureTypeEnum.Point) {
      const roadProps = feature.properties as LDbRoadProps
      if (roadProps.firstName) {
        if (roadProps.secondName) {
          return `${roadProps.firstName} → ${roadProps.secondName}`
        } else {
          return roadProps.firstName
        }
      } else {
        if (roadProps.secondName) {
          return roadProps.secondName
        } else {
          return null
        }
      }
    }
  }, [feature])
  const completeName = useMemo(() => {
    return feature.properties.areaCode
      ? feature.properties.name
        ? `${feature.properties.name} (${feature.properties.areaCode})` : feature.properties.name
      : feature.properties.name
        ? feature.properties.name
        : null
  }, [feature])
  return <div id={id} className={cn("w-full flex flex-row justify-between items-center gap-2 p-2 rounded", className)}>
    <div className="w-full">
      <p className="font-bold text">{feature.properties.tmcTypeDescription ?? feature.properties.type}</p>
      {feature.properties.type === LdbFeatureTypeEnum.Road && <p className="font-bold text">{(feature.properties as LDbRoadProps).roadNumber}</p>}
      {completeName && <p className="font-bold text">{completeName}</p>}
      {extremes && <p>{extremes}</p>}
    </div>
    <Button type="button" variant="secondary" className="w-8 h-8 p-2" onClick={(e) => { e.stopPropagation(); setMapMBR(rectangleXyToLonLat(turf.bbox(feature))) }}>
      <ZoomIn aria-description="zoom in to feature" />
    </Button>
  </div>
}

export default LocationDatabasePanel