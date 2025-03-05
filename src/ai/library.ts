import { z } from "zod"

export const INFO_AGENT_NAME = "info-agent"
export const WEB_AGENT_NAME = "web-agent"

export const TRAFFIC_TOOL_NAME = "traffic-tool"
export const AgentEnumZod = z.enum([
    "information",
    "traffic"
])

export interface AgentAnnotations {
    agent: string,
    model: string
}