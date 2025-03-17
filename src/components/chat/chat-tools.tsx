import { AREA_CHILDREN_TOOL_NAME, AREA_INFO_TOOL_NAME, TRAFFIC_TOOL_NAME } from "@/ai/ai-library"
import TrafficEventPanel from "../traffic-chat/traffic-panel"
import { logInfo } from "@/lib/logging"
import { TrafficEventToolResponse } from "@/ai/traffic-agent/traffic-tools"
import { ToolInvocation } from "ai"
import LocationDatabasePanel from "../location-database/locationdb-panel"
import { LocationDbResponseType } from "@/ai/locationdb-agent/locationdb-tools"

export interface ToolPanelProps extends React.HTMLProps<HTMLElement> {
  response: string
  invocation: ToolInvocation
}

export const ToolPanel: React.FC<ToolPanelProps> = ({ id, className, response, invocation }) => {
  const toolName = invocation.toolName
  const toolResult = invocation.state === "result" ? invocation.result : null
  logInfo(toolName, toolResult)
  switch (toolName) {
    case "trafficEventSelectionTool":
      return <TrafficEventPanel id={id} className={className} trafficToolResponse={toolResult as TrafficEventToolResponse} />
    case AREA_INFO_TOOL_NAME:
    case AREA_CHILDREN_TOOL_NAME:
      return <LocationDatabasePanel id={id} className={className} locationData={toolResult as LocationDbResponseType} />
    // case "initiativeTool":
    //   return <InitiativesPanel id={id} className={className} initiativeData={toolData as InitiativeToolResponse} />
    // case "trafficEventSelectionTool":
    //   return <TrafficEventPanel id={id} className={className} eventData={toolData as TrafficEventToolResponse} />
    // case "mediaTool":
    //   return <MediaPanel id={id} className={className} mediaData={toolData as MediaToolResponse} />
    // case "podcastEpisodeTool":
    //   return <PodcastEpisodePanel id={id} className={className} podcastData={toolData as PodcastEpisodeResponse} />
    // case "podcastPlaybackTool":
    //   return <PodcastEpisodePlaybackPanel id={id} className={className} podcastData={toolData as PodcastPlaybackResponse} />
    // case "bulletinWeatherTool":
    //   return response.length ? <SpeechSynthesisPlayer text={markdownToText(response)} /> : null
    default:
    // falls through
  }

  return null
}

