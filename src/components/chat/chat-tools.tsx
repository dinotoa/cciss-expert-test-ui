export interface ToolPanelProps extends React.HTMLProps<HTMLElement> {
  response: string
  toolName?: string
  toolData: string
}

export const ToolPanel: React.FC<ToolPanelProps> = ({ id, className, toolName, response, toolData }) => {
  switch (toolName) {
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

