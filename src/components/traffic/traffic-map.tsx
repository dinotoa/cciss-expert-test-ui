import React, { Fragment } from "react"
import { Icon } from "leaflet"
import { GeoJSON, Marker, Popup } from "react-leaflet"
import { Feature, FeatureCollection, Geometry, Position } from "geojson"
import { lineString, point } from "@turf/turf"
import { logWarn } from "@/lib/logging"
import MapPanel, { createIcon } from "@/components/tools/map-panel"
import { MapRectangle } from "@/lib/location-database/geography"
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
  return (
    <MapPanel id={id} className={className} desiredMBR={desiredMBR} fullMBR={fullMBR}>
      <TrafficEventLayer events={events} iconUrl={iconUrl} setMapMBR={setMapMBR} />
    </MapPanel>
  )
}

const TrafficEventLayer: React.FC<TrafficMapProps> = ({ events: events, setMapMBR }) => {
  return events?.features.map(evt => {
    const icon = createIcon(`https://luceverde.it/assets/lvd-icons/dark/svg/${evt.properties.iconName}.svg`, 24)
    switch (evt.geometry.type) {
      case "Polygon":
      case "MultiPolygon":
        return <GeoJSON key={evt.properties.id} data={evt}>
          <Popup><TrafficEventCard event={evt} setMapMBR={setMapMBR} /></Popup>
        </GeoJSON>

      case "Point":
        return <PointLayer key={evt.properties.id} event={evt} setMapMBR={setMapMBR} icon={icon} />

      case "LineString":
      case "MultiPoint":
        return <LineLayer key={evt.properties.id} event={evt} setMapMBR={setMapMBR} icon={icon} />

      case "MultiLineString":
        return <MultilineLayer key={evt.properties.id} event={evt} setMapMBR={setMapMBR} icon={icon} />

      default:
        logWarn("TrafficEventLayer: unknown geometry type", evt.geometry.type)
        break;
    }
  })
}

interface EventPopupProps extends React.HTMLProps<HTMLElement> {
  event: Feature<Geometry, TrafficEventType>
  setMapMBR: (mbr: MapRectangle) => void
  icon: Icon
}


const EventPopup: React.FC<EventPopupProps> = ({ event, setMapMBR }) => {
  return (
    <Popup>
      <TrafficEventCard event={event} setMapMBR={setMapMBR} />
    </Popup>
  )
}

const PointLayer: React.FC<EventPopupProps> = ({ event, setMapMBR, icon }) => {
  return event.geometry.type === "Point" ?
    <Marker key={event.properties.id} position={[event.geometry.coordinates[1], event.geometry.coordinates[0]]} icon={icon}>
      <EventPopup event={event} setMapMBR={setMapMBR} icon={icon} />
    </Marker>
    : null
}

const MultilineLayer: React.FC<EventPopupProps> = ({ event, setMapMBR, icon }) => {
  return event.geometry.type === "MultiLineString" ?
    <Fragment key={event.properties.id}>
      <GeoJSON data={event}>
        <EventPopup event={event} setMapMBR={setMapMBR} icon={icon} />
      </GeoJSON>
      {event.geometry.coordinates
        .flatMap((coord, idx) => <LineLayer key={`${event.properties.id}-${idx}`}
          event={lineString(coord, event.properties)} setMapMBR={setMapMBR} icon={icon} />)
      }
    </Fragment>
    : null
}

const LineLayer: React.FC<EventPopupProps> = ({ event, setMapMBR, icon }) => {
  return event.geometry.type === "LineString" || event.geometry.type === "MultiPoint" ?
    <Fragment key={event.properties.id}>
      <GeoJSON data={event}>
        <EventPopup event={event} setMapMBR={setMapMBR} icon={icon} />
      </GeoJSON>
      {event.geometry.coordinates
        .map((coord: Position, idx: number) => <PointLayer key={`${event.properties.id}-${idx}`}
          event={point(coord, event.properties)} setMapMBR={setMapMBR} icon={icon} />
        )}
    </Fragment>
    : null
}

export default TrafficMap
