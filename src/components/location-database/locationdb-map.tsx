import React from "react"
import MapPanel, { createIcon } from "@/components/map/map-panel"
import { MapRectangle } from "@/lib/location-database/geography"
import { LDbFeature } from "@/lib/location-database/location-db-types"
import FeatureLayer from "@/components/map/feature-layer"
import { LocationDataPanel } from "./locationdb-panel"

interface LocationDbProps extends React.HTMLProps<HTMLElement> {
  features?: LDbFeature[]
  selectedFeature?: LDbFeature
  setSelectedFeature?: (f: LDbFeature) => void
  fullMBR?: MapRectangle
  desiredMBR?: MapRectangle
  setMapMBR: (mbr: MapRectangle) => void
}

const LocationDbMapPanel: React.FC<LocationDbProps> = ({ id, className, desiredMBR, fullMBR, setMapMBR, features, 
  selectedFeature, setSelectedFeature }) => {
  const icon = createIcon("/icons/circle.svg", 24)
  const createIconFunc = () => icon
  const createPanel = (f: LDbFeature, setMapMBR: (mbr: MapRectangle) => void) => <LocationDataPanel className="w-[15rem]" feature={f} setMapMBR={setMapMBR} />
  return features?.length ?
    <MapPanel id={id} className={className} desiredMBR={desiredMBR} fullMBR={fullMBR}>
      <FeatureLayer features={features} selectedFeature={selectedFeature} setSelectedFeature={setSelectedFeature}
      createIcon={createIconFunc} createPanel={createPanel} setMapMBR={setMapMBR}  />
    </MapPanel>
    :null
}

export default LocationDbMapPanel
