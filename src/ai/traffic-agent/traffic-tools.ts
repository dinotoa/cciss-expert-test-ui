import { tool as createTool } from 'ai'
import { z } from 'zod'
import { MapRectangle } from '@/lib/location-database/geography'
import { getRegionsByName } from '@/lib/location-database/location-db'
import { logErr, logInfo } from '@/lib/logging'
import { TrafficEventType, ZTopicType, } from "../../lib/traffic-database/traffic-database-types"
import { TRAFFIC_TOOL_NAME } from '../library'
import { fetchTrafficDataBySlug } from '../../lib/traffic-database/luceverde-api'
import { fetchTrafficInfoByFeatures } from '@/lib/traffic-database/traffic-database'
import { FeatureCollection, Geometry } from 'geojson'

// import { trafficSelectionAgent } from './traffic-selection-agent'

export interface TrafficEventToolResponse {
  error?: string
  events?: FeatureCollection<Geometry, TrafficEventType>
  numberOfEvents: number
  displayMap: boolean
}

const trafficSelectionTool = createTool({
  description: "fornisce l'elenco oppure la mappa delle notizie di traffico nella lista delle località {locations} per i topic {topic}",
  parameters: z.object({
    displayMap: z.boolean().optional().describe("true se l'utente richiede la mappa.").default(false),
    topics: z.array(ZTopicType)
      .describe("lista dei topic per la selezione delle informazioni di traffico")
  }),
  execute: async ({ displayMap, topics }): Promise<TrafficEventToolResponse> => {
    //const requestedTopic = topic === "all" ? undefined : topic
    logInfo(TRAFFIC_TOOL_NAME, "topic:", topics, "displayMap:", displayMap)
    const response = await fetchTrafficInfoByFeatures(topics)
    logInfo(TRAFFIC_TOOL_NAME, "response:", response.data?.features?.length)
    if (response.data) {
      return { displayMap, events: response.data, numberOfEvents: response.data.features.length, error: response.error }
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
    logErr(TRAFFIC_TOOL_NAME, "error:", response.error)
    return { displayMap, error: response.error, numberOfEvents: 0 }
  }
})

const tools = {
  // trafficEventTool,
  trafficEventSelectionTool: trafficSelectionTool
}

export default tools
