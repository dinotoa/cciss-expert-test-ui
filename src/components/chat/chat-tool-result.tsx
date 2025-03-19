import { Message, ToolInvocation } from "ai"
import { AREA_CHILDREN_TOOL_NAME, AREA_INFO_TOOL_NAME } from "@/ai/ai-library"
import { LocationDbResponseType } from "@/ai/locationdb-agent/locationdb-tools"
import { TrafficEventToolResponse } from "@/ai/traffic-agent/traffic-tools"
import LocationDatabasePanel from "../location-database/locationdb-panel"
import TrafficEventPanel from "../traffic-chat/traffic-panel"

interface ToolResultPanelProps extends React.HTMLProps<HTMLElement> {
  message: Message
}

const ChatToolsResultPanel: React.FC<ToolResultPanelProps> = ({ id, className, message }) => {
  return message.parts?.map(part => (
    part.type === "tool-invocation" && (part.toolInvocation as ToolInvocation).state === "result" ?
      <ToolResultDetailsPanel key={(part.toolInvocation as ToolInvocation).toolCallId}
        invocation={part.toolInvocation as ToolInvocation}
      />
      : null
  ))
}

interface ToolResultDetailsPanelProps extends React.HTMLProps<HTMLElement> {
  invocation: ToolInvocation
}

const ToolResultDetailsPanel: React.FC<ToolResultDetailsPanelProps> = ({ id, className, invocation }) => {
  const toolName = invocation.toolName
  const toolResult = invocation.state === "result" ? invocation.result : null
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

export default ChatToolsResultPanel