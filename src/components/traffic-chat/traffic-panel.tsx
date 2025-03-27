"use client"
import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Feature, Geometry } from "geojson";
import * as turf from "@turf/turf";
import { ChevronDown, ChevronUp, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import FullScreenPanel from "../utils/fullscreen-panel";
import SearchableListPanel from "../utils/searchable-list";
import { TrafficEventToolResponse } from "@/ai/traffic-agent/traffic-tools";
import { MapRectangle, rectangleXyToLonLat } from "@/lib/location-database/geography";
import { TrafficDataResponse, TrafficEventType } from "@/lib/traffic-database/traffic-database-types";
import { fetchTrafficDataById } from "@/lib/traffic-database/traffic-database";
import LoadingPanel from "../utils/loading-panel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

interface TrafficPanelProps extends React.HTMLProps<HTMLElement> {
  trafficToolResponse: TrafficEventToolResponse
}

const MapPanel = dynamic(() => import("./traffic-map"), { ssr: false })

const TrafficEventPanel: React.FC<TrafficPanelProps> = ({ id, className, trafficToolResponse }) => {
  const loadEvents = useCallback(async () => {
    const eventData = await fetchTrafficDataById(trafficToolResponse?.events?.map((e) => e.id) ?? [])
    if (eventData) {
      setEventData(eventData)
      if (eventData?.data) {
        setMapMBR(rectangleXyToLonLat(turf.bbox(turf.featureCollection(eventData.data.features))))
      }
    }
  }, [trafficToolResponse])
  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const [eventData, setEventData] = useState<TrafficDataResponse>()
  const [selectedItem, setSelectedItem] = useState<Feature<Geometry, TrafficEventType> | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const filteredEvents = eventData?.data?.features.length ?
    turf.featureCollection(eventData?.data?.features?.filter(e => filterEvent(searchTerm, e)))
    : undefined

  const fullMbr = filteredEvents ? rectangleXyToLonLat(turf.bbox(filteredEvents)) : rectangleXyToLonLat([8, 40, 12, 45])
  const [mapMBR, setMapMBR] = useState(fullMbr)
  const createItemPanel = (item: Feature<Geometry, TrafficEventType>) => <TrafficEventCard event={item} setMapMBR={setMapMBR} />
  return trafficToolResponse.displayMap && eventData?.data?.features.length ?
    <FullScreenPanel id={id} className={cn("flex flex-col justify-between w-full h-[30rem]", className)}>
      <section id={`${id}__container`} className={"relative w-full h-full flex flex-row justify-between items-start gap-1 border"}>
        {eventData === undefined
          ? <LoadingPanel message="Caricamento dati..." />
          : <SearchableListPanel<Feature<Geometry, TrafficEventType>> id={`${id}__search`} className="w-[30%] h-full p-1"
            searchTerm={searchTerm} setSearchTerm={setSearchTerm} getElementKey={(item) => item?.properties?.id}
            items={filteredEvents?.features ?? []} selectedElement={selectedItem} onSelectionChange={setSelectedItem}
            createElementPanel={createItemPanel} />
        }
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
  const bbox = useMemo(() => rectangleXyToLonLat(turf.bbox(event)), [event])
  const [open, setOpen] = useState(false)
  return (
    <Collapsible className="w-full" open={open} onOpenChange={setOpen}>
      <div key={event.properties.id} className="relative flex flex-row justify-between items-center w-full p-2">
        <div className="w-full">
          <div className="font-bold">{event.properties.road}</div>
          <div>Agg.: {new Date(event.properties.updateDate).toLocaleString()}</div>
          <div>{event.properties.description}</div>
          <div>{event.properties.location}</div>
          {event.properties.source && <div className="font-bold">Fonte: {event.properties.source}</div>}
          {event.properties.note?.length && <>
            <CollapsibleContent>
              <div>{event.properties.note}</div>
            </CollapsibleContent>
          </>}
        </div>
        <Button variant="ghost" size="icon" className="hover:border hover:border-primary" onClick={() => setMapMBR(bbox)}>
          <ZoomIn />
        </Button>
      </div >
      {event.properties.note?.length && <CollapsibleTrigger asChild>
        <div className="flex justify-center items-center w-full mb-2">
          <Button className="self-center" type="button" variant="ghost" size="sm">
            {open
              ? <>leggi di meno <ChevronUp /></>
              : <>leggi di più <ChevronDown /></>
            }
          </Button>
        </div>
      </CollapsibleTrigger>
      }
    </Collapsible>
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