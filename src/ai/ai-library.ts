import { z } from "zod"

export const LOCATIONDB_AGENT_NAME = "locdb-agent"
export const INFO_AGENT_NAME = "info-agent"
export const WEB_AGENT_NAME = "web-agent"

export const TRAFFIC_TOOL_NAME = "trafficSelectionTool"
export const AREA_SELECTION_TOOL_NAME = "areaSelectionTool"
export const AREA_INFO_TOOL_NAME = "areaInfoTool"
export const AREA_CHILDREN_TOOL_NAME = "areaChildrenTool"
export const ROAD_INFO_TOOL_NAME = "roadInfoTool"

export const AgentEnumZod = z.enum([
    "information",
    "traffic"
])

export interface AgentAnnotations {
    agent: string,
    model: string
}