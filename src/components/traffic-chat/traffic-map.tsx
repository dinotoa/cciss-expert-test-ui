import MapPanel, { createIcon } from "@/components/map/map-panel"
import { MapRectangle } from "@/lib/location-database/geography"
import { TrafficEventType } from "@/lib/traffic-database/traffic-database-types"
import { Feature, FeatureCollection, Geometry } from "geojson"
import React from "react"
import FeatureLayer from "../map/feature-layer"
import { TrafficEventCard } from "./traffic-panel"

interface TrafficMapProps extends React.HTMLProps<HTMLElement> {
  events?: FeatureCollection<Geometry, TrafficEventType>
  selectedFeature?: Feature<Geometry, TrafficEventType>
  setSelectedFeature?: (feature: Feature<Geometry, TrafficEventType>) => void
  className?: string
  iconUrl: string
  fullMBR?: MapRectangle
  desiredMBR?: MapRectangle
  setMapMBR: (mbr: MapRectangle) => void
}

const TrafficMap: React.FC<TrafficMapProps> = ({ id, className, desiredMBR, fullMBR, setMapMBR, events, selectedFeature, setSelectedFeature, iconUrl }) => {
  const createTrafficIcon = (evt: Feature<Geometry, TrafficEventType>, selected: boolean) => createIcon(`https://luceverde.it/assets/lvd-icons/dark/svg/${evt.properties.iconName}.svg`, 24, selected)
  const createPanel = (f: Feature<Geometry, TrafficEventType>, setMapMBR: (mbr: MapRectangle) => void) => <TrafficEventCard event={f} setMapMBR={setMapMBR} />
  return events?.features?.length ?
    <MapPanel id={id} className={className} desiredMBR={desiredMBR} fullMBR={fullMBR}>
      <FeatureLayer features={events.features} setMapMBR={setMapMBR}
        createIcon={createTrafficIcon} createPanel={createPanel} selectedFeature={selectedFeature} setSelectedFeature={setSelectedFeature}/>
    </MapPanel>
    : null
}

export default TrafficMap
