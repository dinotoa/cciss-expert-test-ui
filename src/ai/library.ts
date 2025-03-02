import { z } from "zod"

export const INFO_AGENT_NAME = "info-agent"
export const WEB_AGENT_NAME = "web-agent"

export const AgentEnumZod = z.enum([
    "information",
])

export interface AgentAnnotations {
    agent: string,
    model: string
}