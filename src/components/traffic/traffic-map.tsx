import { Fragment } from "react"
import { Marker, Popup } from "react-leaflet"
import MapPanel, { createIcon } from "@/components/tools/map-panel"
import { MapRectangle } from "@/lib/location-database/geography"
import { FeatureCollection, Geometry, Position } from "geojson"
// import TrafficEventCard from "./traffic-card"
import { GeoJSON } from "react-leaflet"
import { TrafficEventType } from "@/lib/traffic-database/traffic-database-types"
import { TrafficEventCard } from "./traffic-panel"


interface TrafficMapProps extends React.HTMLProps<HTMLElement> {
  events?: FeatureCollection<Geometry, TrafficEventType>
  className?: string
  iconUrl: string
  fullMBR?: MapRectangle
  desiredMBR?: MapRectangle
  setMapMBR: (mbr: MapRectangle) => void
}

const TrafficMap: React.FC<TrafficMapProps> = ({ id, className, desiredMBR, fullMBR, setMapMBR, events, iconUrl }) => {
  console.log("full", fullMBR)
  return (
    <MapPanel id={id} className={className} desiredMBR={desiredMBR} fullMBR={fullMBR}>
      <TrafficEventLayer events={events} iconUrl={iconUrl} setMapMBR={setMapMBR} />
    </MapPanel>
  )
}

const TrafficEventLayer: React.FC<TrafficMapProps> = ({ events: events, setMapMBR }) => {
  return events?.features.map(evt => {
    switch (evt.geometry.type) {
      case "Polygon":
      case "MultiPolygon":
        return <GeoJSON key={evt.id} data={evt}>
          <Popup><TrafficEventCard event={evt.properties} setMapMBR={setMapMBR} /></Popup>
        </GeoJSON>

      case "Point":
        return <Marker key={evt.id} position={[evt.geometry.coordinates[1], evt.geometry.coordinates[0]]}
          icon={createIcon(`https://luceverde.it/assets/lvd-icons/dark/svg/${evt.properties.iconName}.svg`, 24)}>
          <Popup><TrafficEventCard event={evt.properties} setMapMBR={setMapMBR} /></Popup>
        </Marker>

      case "LineString":
      case "MultiPoint":
        return <Fragment key={evt.id}>
          <GeoJSON data={evt}>
            <Popup><TrafficEventCard event={evt.properties} setMapMBR={setMapMBR} /></Popup>
          </GeoJSON>
          {evt.geometry.coordinates.map(((coord: Position, idx: number) => <Marker key={idx} position={[coord[1], coord[0]]}
            icon={createIcon(`https://luceverde.it/assets/lvd-icons/dark/svg/${evt.properties.iconName}.svg`, 24)}>
            <Popup><TrafficEventCard event={evt.properties} setMapMBR={setMapMBR} /></Popup>
          </Marker>))
          }
        </Fragment>
      // case "MultiLineString":
      default:
        break;
    }
  })
}

export default TrafficMap
