import { DataStreamWriter, generateObject, Message } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { logInfo } from '@/lib/logging'
import { infoAgent } from '../info-agent/info-agent'
import { AgentEnumZod, WEB_AGENT_NAME } from '../library'
import config from "./web-agent.config.json"
import { trafficAgent } from '../traffic-agent/traffic-agent'

const AGENT_NAME = `${WEB_AGENT_NAME}:`
const TEMPERATURE = config.temperature || 0.0
const MODEL_NAME = config.modelName || "gemini-2.0-flash"
const SYSTEM_PROMPT = config.prompt?.join("\n") ||
  "Rispondi sempre: L'assistente non è correttamente configurato. Contattare il supporto tecnico"

const schema = z.object({
  agent: AgentEnumZod.describe("agente da selezionare per la risposta"),
  city: z.string().optional().describe("città di cui si desiderano le informazioni"),
  length: z.enum(["normale", "breve", "lungo"]).optional().default("normale").describe("lunghezza dei bollettini")
})

export async function mainWebAgent(dataStream: DataStreamWriter, messages: Message[]) {
  logInfo(AGENT_NAME, "using", MODEL_NAME, "model with temperature", TEMPERATURE)

  const agentSelection = await generateObject({
    model: google(MODEL_NAME),
    system: SYSTEM_PROMPT,
    temperature: TEMPERATURE,
    messages,
    schema: schema,
  })
  logInfo(AGENT_NAME, "selected agent", agentSelection.object.agent)
  switch (agentSelection.object.agent) {
    case "traffic":
      return await trafficAgent(dataStream, messages)
    default:
      return await infoAgent(dataStream, messages)
  }
}
