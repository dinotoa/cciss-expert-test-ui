"use client"
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Feature, Geometry } from "geojson";
import * as turf from "@turf/turf";
import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import FullScreenPanel from "../tools/fullscreen-panel";
import SearchableListPanel from "../tools/searchable-list";
import { TrafficEventToolResponse } from "@/ai/traffic-agent/traffic-tools";
import { MapRectangle, rectangleXyToLonLat } from "@/lib/location-database/geography";
import { TrafficEventType } from "@/lib/traffic-database/traffic-database-types";

interface TrafficPanelProps extends React.HTMLProps<HTMLElement> {
  eventData: TrafficEventToolResponse
}

const MapPanel = dynamic(() => import("./traffic-map"), { ssr: false })

const TrafficEventPanel: React.FC<TrafficPanelProps> = ({ id, className, eventData }) => {
  const [selectedItem, setSelectedItem] = useState<Feature<Geometry, TrafficEventType>>()
  const [searchTerm, setSearchTerm] = useState("")
  const filteredEvents = eventData.events?.features.length ?
    turf.featureCollection(eventData?.events?.features?.filter(e => filterEvent(searchTerm, e)))
    : undefined

  const fullMbr = filteredEvents ? rectangleXyToLonLat(turf.bbox(filteredEvents)) : rectangleXyToLonLat([8, 40, 12, 45])
  const [mapMBR, setMapMBR] = useState(fullMbr)
  const createItemPanel = (item: Feature<Geometry, TrafficEventType>) => <TrafficEventCard event={item} setMapMBR={setMapMBR} />
  return eventData.displayMap && eventData.events?.features.length ?
    <FullScreenPanel id={id} className={cn("flex flex-col justify-between w-full h-[30rem]", className)}>
      <section id={`${id}__container`} className={"relative w-full h-full flex flex-row justify-between items-start gap-1 border"}>
        <SearchableListPanel id={`${id}__search`} className="w-[30%] h-full p-1"
          searchTerm={searchTerm} setSearchTerm={setSearchTerm} getItemKey={(item) => item?.properties?.id}
          items={filteredEvents?.features ?? []} selectedItem={selectedItem} setSelectedItem={setSelectedItem}
          createItemPanel={createItemPanel} />
        <MapPanel className="w-[70%] h-full" desiredMBR={mapMBR} setMapMBR={setMapMBR} fullMBR={fullMbr}
          events={filteredEvents} selectedFeature={selectedItem} setSelectedFeature={setSelectedItem} 
          iconUrl="https://luceverde.it/icons/city-map-pin.svg" />
      </section>
    </FullScreenPanel>
    : null
}

interface TrafficEventCardProps {
  event: Feature<Geometry, TrafficEventType>
  setMapMBR: (mbr: MapRectangle) => void
}

export function TrafficEventCard({ event, setMapMBR }: TrafficEventCardProps) {
  const bbox = rectangleXyToLonLat(turf.bbox(event))

  return (
    <div key={event.properties.id} className="relative flex flex-row justify-between items-center w-full p-2">
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

function filterEvent(searchTerm: string, event: Feature<Geometry, TrafficEventType>): boolean {
  const normalisedSearchTerm = searchTerm.toLowerCase().trim()
  if (normalisedSearchTerm.length === 0) return true
  return (event.properties.road.toLowerCase().includes(normalisedSearchTerm) ||
    event.properties.description.toLowerCase().includes(normalisedSearchTerm) ||
    event.properties.location.toLowerCase().includes(normalisedSearchTerm) ||
    event.properties.source?.toLowerCase().includes(normalisedSearchTerm)) ?? true
}
export default TrafficEventPanel