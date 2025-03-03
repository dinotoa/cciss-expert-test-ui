import { tool as createTool } from 'ai'
import { z } from 'zod'
import { logInfo } from '@/lib/logging'
import { fetchInitiativeDataByName, fetchTrafficDataBySlug, InitiativeData, mapTrafficEventToSimpleTrafficEvent, TrafficEvent } from '@/lib/luceverde-api'
import { inflateRectangle, MapRectangle, reduceMBR } from '@/lib/geography'
import { TRAFFIC_TOOL_NAME } from '../library'
// import { trafficSelectionAgent } from './traffic-selection-agent'

export interface TrafficEventToolResponse {
  error?: string
  city?: string
  events: TrafficEvent[]
  numberOfEvents: number
  displayMap: boolean
  mapMbr?: MapRectangle
  see_also?: string
}

const ZTopicType = z.enum([
  "congestioni", "incidenti", "chiusure", "deviazione", "meteo", "eventi sportivi", "manifestazioni", "concerti"
]).describe("valori che puà assumere il topic di ricerca")
const ZLocationType = z.enum(["strada", "città", "regione", "provincia"])
.describe("valori che può assumente il tipo di località")

const ZLocation = z.object({
  location: z.string().describe("località per la quali cercare le notizie di traffico."),
  locationType: ZLocationType
})

const trafficSelectionTool = createTool({
  description: "fornisce l'elenco oppure la mappa delle notizie di traffico nella lista delle località {locations} per i topic {topic}",
  parameters: z.object({
    displayMap: z.boolean().optional().describe("true se l'utente richiede la mappa.").default(false),
    locations: z.array(ZLocation)
      .describe("lista delle località per cui cercare le notizie di traffico"),
    topics: z.array(ZTopicType)
      .describe("lista dei topic per la selezione delle informazioni di traffico")
  }),
  execute: async ({ displayMap, locations, topics }): Promise<TrafficEventToolResponse> => {
    //const requestedTopic = topic === "all" ? undefined : topic
    logInfo(TRAFFIC_TOOL_NAME, "locations:", locations, "topic:", topics, "displayMap:", displayMap)
    const response = await fetchEventByInitiative("roma")
    if (response.error) {
      return { displayMap, events: [], numberOfEvents: 0, error: response.error }
    }
    // if (response.data && response.cityData) {
    //   const selectedEvents = await selectDataByTopic(response.data, requestedTopic, response.cityData)
    //   const mapMbr = selectedEvents.length > 0 ? selectedEvents
    //     .reduce((acc, evt) => reduceMBR(acc, evt.mbr), selectedEvents[0].mbr) : response.cityData?.bounding_box
    //   return {
    //     city: "roma",
    //     numberOfEvents: response.data?.length ?? 0,
    //     events: selectedEvents ?? [],
    //     displayMap: displayMap ?? false,
    //     mapMbr: inflateRectangle(mapMbr, .05),
    //     see_also: `https://${response.cityData?.slug}.luceverde.it/traffico`
    //   }
    // }
    return { displayMap, events: [], numberOfEvents: 0 }
  }
})

interface EventByCityFetchResponse {
  error?: string | undefined,
  data?: TrafficEvent[] | undefined,
  cityData?: InitiativeData | undefined
}

async function fetchEventByInitiative(cityName: string): Promise<EventByCityFetchResponse> {
  if (cityName?.length > 0) {
    const url = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
    const trafficUrl = process.env.TRAFFIC_DATA_ENDPOINT
    if (!url || !trafficUrl) {
      return { error: "Internal error: traffic endpoints not configured" }
    }

    const city = await fetchInitiativeDataByName(url, cityName)
    if (city?.data) {
      logInfo("trafficEventTool", "found city", city.data.slug)
      const trafficData = await fetchTrafficDataBySlug(trafficUrl, city.data?.slug ?? "")
      logInfo("trafficEventTool", "found", trafficData.data?.length, "traffic events")
      return { data: trafficData.data, cityData: city?.data }
    }
    return { error: `la città ${cityName} non è coperta dal servizio Luceverde` }
  }
  return { error: "specifica una città Luceverde" }
}

// async function selectDataByTopic(events: TrafficEvent[], topic: string | undefined, cityData: InitiativeData) {
//   if (topic) {
//     const selection = await trafficSelectionAgent(topic, events.map(mapTrafficEventToSimpleTrafficEvent))
//     if (selection?.object) {
//       const dataSet = new Set(selection.object)
//       const selectedEvents = events.filter(e => dataSet.has(e.id))
//       logInfo("selected", selectedEvents.length, "out of", events.length)
//       return selectedEvents
//     }
//   }

//   return events
// }

const tools = {
  // trafficEventTool,
  trafficEventSelectionTool: trafficSelectionTool
}

export default tools
