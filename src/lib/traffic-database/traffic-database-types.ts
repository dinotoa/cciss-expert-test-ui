import { z } from "zod"
import { ZLocationEnum } from "../location-database/location-db-types"
import { FeatureCollection, Geometry } from "geojson"

export const ZTopicEnum = z.enum([
  "tutti", "congestioni", "incidenti", "ztl", "divieto", "lavori", "chiusura", "deviazione", "meteo", 
  "evento sportivo", "manifestazione", "concerto"
]).describe("valori che puà assumere il topic di ricerca")
export type TopicEnum = z.infer<typeof ZTopicEnum>

export const ZTopicType = z.object({
  topic: ZTopicEnum,
  locationType: ZLocationEnum,
  addressCity: z.string().optional().describe("nome della città quando locationType è di tipo 'address'"),
  locationName: z.string().describe("località per la quali cercare le notizie di traffico.")
})
export type TopicType = z.infer<typeof ZTopicType>

export const ZTopicArrayType = z.array(ZTopicType)
  .describe("lista dei topic per la selezione delle informazioni di traffico")
export type TopicArrayType = z.infer<typeof ZTopicArrayType>

export interface TrafficEventType {
  id: string,
  priority: number,
  updateDate: string
  source?: string,
  road: string,
  location: string
  description: string,
  note?: string
  iconName: string
}

export interface TrafficDataResponse {
  error?: string
  data?: FeatureCollection<Geometry, TrafficEventType>
}
