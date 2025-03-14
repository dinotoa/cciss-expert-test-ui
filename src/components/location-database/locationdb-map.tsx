import React from "react"
import MapPanel, { createIcon } from "@/components/map/map-panel"
import { MapRectangle } from "@/lib/location-database/geography"
import { LDbFeature } from "@/lib/location-database/location-db-types"
import FeatureLayer from "@/components/map/feature-layer"

interface LocationDbProps extends React.HTMLProps<HTMLElement> {
  features?: LDbFeature[]
  fullMBR?: MapRectangle
  desiredMBR?: MapRectangle
  setMapMBR: (mbr: MapRectangle) => void
}

const LocationDbMapPanel: React.FC<LocationDbProps> = ({ id, className, desiredMBR, fullMBR, setMapMBR, features }) => {
  const icon = createIcon("/icons/circle.svg", 24)
  const createIconFunc = () => icon
  const createPanel = (f: LDbFeature, setMapMBR: (mbr: MapRectangle) => void) => <LocationDataPanel feature={f} setMapMBR={setMapMBR} />
  return features?.length ?
    <MapPanel id={id} className={className} desiredMBR={desiredMBR} fullMBR={fullMBR}>
      <FeatureLayer features={features} createIcon={createIconFunc} createPanel={createPanel} setMapMBR={setMapMBR} />
    </MapPanel>
    :null
}

interface LocationDataPanelProps extends React.HTMLProps<HTMLElement> {
  feature: LDbFeature
  setMapMBR: (mbr: MapRectangle) => void
}

const LocationDataPanel: React.FC<LocationDataPanelProps> = ({ id, className, feature, setMapMBR }) => {
  return <div id={id} className={className}>{feature.properties.name}</div>
}

export default LocationDbMapPanel
