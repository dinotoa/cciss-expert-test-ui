import { tool as createTool } from 'ai'
import { z } from 'zod'
import { logErr, logInfo } from '@/lib/logging'
import { TrafficEventType, ZTopicType, } from "../../lib/traffic-database/traffic-database-types"
import { TRAFFIC_TOOL_NAME } from '../ai-library'
import { fetchTrafficInfoByFeatures } from '@/lib/traffic-database/traffic-database'
import { FeatureCollection, Geometry } from 'geojson'
import { trafficSelectionAgent } from './traffic-selection-agent'

// import { trafficSelectionAgent } from './traffic-selection-agent'

export interface TrafficEventToolResponse {
  error?: string
  events?: TrafficEventType[]
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
      if (topics.length) {
        const events = response.data.features.map(event => event.properties)
        logInfo(TRAFFIC_TOOL_NAME, "sending", events.length, "to selection model")
        const selectedIdObject = await (await trafficSelectionAgent(topics.map(topic => topic.topic), events))
        logInfo(TRAFFIC_TOOL_NAME, "selected", selectedIdObject.object.length, "traffic events")
        const selectedIds = new Set(selectedIdObject.object)
        response.data.features = response.data.features
        .filter(event => selectedIds.has(event.properties.id))
        .sort((e1, e2) => {
          if (e1.properties.priority !== e2.properties.priority) {
            return e2.properties.priority - e1.properties.priority; // Higher priority first
          }
          return new Date(e2.properties.updateDate).getTime() - new Date(e1.properties.updateDate).getTime(); // Most recent first
        })
        logInfo(TRAFFIC_TOOL_NAME, "final selection is", response.data.features.length, "traffic events")
      }
      return { displayMap, events: response.data.features.map(event => event.properties), numberOfEvents: response.data.features.length, error: response.error }
    }
    logErr(TRAFFIC_TOOL_NAME, "error:", response.error)
    return { displayMap, error: response.error, numberOfEvents: 0 }
  }
})

const tools = {
  // trafficEventTool,
  trafficEventSelectionTool: trafficSelectionTool
}

export default tools
