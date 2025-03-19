import { logInfo } from '@/lib/logging'
import { google } from '@ai-sdk/google'
import { DataStreamWriter, Message, streamText, StreamTextResult, tool, ToolSet } from 'ai'
import config from "./test-agent.config.json"
import { INFO_AGENT_NAME } from '../ai-library'
import { z } from 'zod'

const AGENT_NAME = `${INFO_AGENT_NAME}:`
const MAX_STEPS = config.maxSteps || 5
const TEMPERATURE = config.temperature || 0.0
const MODEL_NAME = config.modelName || "gemini-2.0-flash"
const SYSTEM_PROMPT = config.prompt?.join("\n") ??
  "Rispondi sempre: L'assistente non è correttamente configurato. Contattare il supporto tecnico"

export async function testAgent(dataStream: DataStreamWriter, messages: Message[]) {
  logInfo(AGENT_NAME, "using", MODEL_NAME, "model with temperature", TEMPERATURE)

  return streamText({
    model: google(MODEL_NAME),
    system: SYSTEM_PROMPT,
    maxSteps: MAX_STEPS,
    temperature: TEMPERATURE,
    messages,
    onFinish() {
      dataStream.writeMessageAnnotation({
        agent: INFO_AGENT_NAME,
        model: MODEL_NAME
      })
    },
    tools: {
      weatherDataTool, locationRequestTool, locationSelectionTool
    }
  })
}

const locationRequestTool = tool({
  description: "chiede all'utente la località desiderata",
  parameters: z.object({}),
  // execute: async () => {
  //   return {
  //     location: "palermo"
  //   }}
})

const locationSelectionTool = tool({
  description: "seleziona la località desiderata da una lista di località candidate",
  parameters: z.object({ locations: z.array(z.string().describe("nome della località").describe("elenco delle località candidate")) }),
  // execute: async () => {
  //   return {
  //     location: "palermo"
  //   }}
})

const weatherDataTool = tool({
  description: "riporta le informazioni meteo per una località specificata per nome",
  parameters: z.object({
    location: z.string().describe("località specificata per nome")
  }).describe("parmetri per la richiesta dei dati meteo"),
  execute: async ({ location }) => {
    return {
      "location": location,
      "temperature": "20°C"
    }
  }
})
