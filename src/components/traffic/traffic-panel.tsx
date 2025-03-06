import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { TrafficEventToolResponse } from "@/ai/traffic-agent/traffic-tools"
import *  as turf from "@turf/turf"
import { MapRectangle } from "@/lib/location-database/geography";
import { logInfo } from "@/lib/logging";
import { Button } from "../ui/button";
import { ZoomIn } from "lucide-react";
import { TrafficEventType } from "@/lib/traffic-database/traffic-database-types";

interface TrafficPanelProps extends React.HTMLProps<HTMLElement> {
  eventData: TrafficEventToolResponse
}

// Helper function to convert turf bbox to leaflet bounds
const turfBboxToLeafletBounds = (bbox: number[]): MapRectangle => {
  // bbox format: [minX, minY, maxX, maxY] (or [west, south, east, north])
  // Leaflet bounds format: [[south, west], [north, east]] or [[minY, minX], [maxY, maxX]]
  return [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];
};

const MapPanel = dynamic(() => import("./traffic-map"), { ssr: false })

const TrafficEventPanel: React.FC<TrafficPanelProps> = ({ id, className, eventData }) => {
  const fullMbr = eventData.events ? turfBboxToLeafletBounds(turf.bbox(eventData.events)) : turfBboxToLeafletBounds([8, 40, 12, 45])
  const [mapMBR, setMapMBR] = useState(fullMbr)
  logInfo(eventData)
  return eventData.displayMap && eventData.events ?
    <section id={id} className={cn("w-full h-[30rem] flex flex-row justify-between items-start gap-0", className)}>
      {/* <EventListPanel className="w-[50%] h-full" events={eventData.events || []} setMapMBR={setMapMBR} /> */}
      <MapPanel className="w-[75%] h-full" desiredMBR={mapMBR} setMapMBR={setMapMBR} fullMBR={fullMbr}
        events={eventData.events}
        iconUrl="https://luceverde.it/icons/city-map-pin.svg" />
    </section>
    : null
}

// function EventListPanel({ id, className, events, setMapMBR }:
//   { id?: string, className?: string, events: TrafficEvent[], setMapMBR: (mbr: MapRectangle) => void }) {
//   return (
//     <aside id={id} className={cn("flex flex-col h-full w-full items-start border border-neutral-200", className)}>
//       <ScrollArea className="w-full overflow-auto">
//         {events && events.map(city => (
//           <div key={city.id} className="border-b border-neutral-200 hover:bg-neutral-200 p-2">
//             <TrafficEventCard event={city} setMapMBR={setMapMBR} />
//           </div>
//         ))}
//       </ScrollArea>
//     </aside>
//   )
// }

interface TrafficEventCardProps {
  event: TrafficEventType,
  setMapMBR: (mbr: MapRectangle) => void
}

export function TrafficEventCard({ event, setMapMBR }: TrafficEventCardProps ) {
  return (
    <div key={event.id} className="relative flex flex-row justify-between items-center w-full">
      <div>
        <p className="font-bold">{event.road}</p>
        <p>{event.description}</p>
        <p>{event.location}</p>
      </div>
      <Button variant="ghost" >
        <ZoomIn />
      </Button>
    </div>
  )
}
export default TrafficEventPanel