import { generateObject } from 'ai'
import { z } from 'zod'
import { logInfo } from '@/lib/logging'
import { google } from '@ai-sdk/google'
import config from "./traffic-selection-agent.config.json"
import { TopicEnum, TrafficEventType } from '@/lib/traffic-database/traffic-database-types'

const AGENT_NAME = "traffic-selection-agent:"
const TEMPERATURE = config.temperature || 0.0
const MODEL_NAME = config.modelName || "gemini-2.0-flash"
const SYSTEM_PROMPT = config.prompt?.join("\n") ||
  "Rispondi sempre: L'assistente non è correttamente configurato. Contattare il supporto tecnico"

const OUTPUT_FORMAT = z.string().describe("id dell'evento selezionato")

export async function trafficSelectionAgent(topic: TopicEnum[], events: TrafficEventType[]) {
  logInfo(AGENT_NAME, "using", MODEL_NAME, "model with temperature", TEMPERATURE)
  const prompt = `\n\n{{topic}}: ${topic.join(",")}\n\n{{events}}:\n` + JSON.stringify(events)
  return generateObject({
    model: google(MODEL_NAME),
    system: SYSTEM_PROMPT,
    temperature: TEMPERATURE,
    output: 'array',
    schema: OUTPUT_FORMAT,
    prompt
  });
}
