import { DataStreamWriter, Message, streamText } from 'ai'
import { logInfo } from '@/lib/logging'
import { google } from '@ai-sdk/google'
import config from "./traffic-agent.config.json"
import tools from "./traffic-tools"

const TRAFFIC_AGENT_NAME = "traffic-agent:"
const MAX_STEPS = config.maxSteps || 5
const TEMPERATURE = config.temperature || 0.0
const MODEL_NAME = config.modelName || "gemini-2.0-flash"
const SYSTEM_PROMPT = config.prompt?.join("\n") ||
  "Rispondi sempre: L'assistente non è correttamente configurato. Contattare il supporto tecnico"

export async function trafficAgent(dataStream: DataStreamWriter, messages: Message[]) {
  logInfo(TRAFFIC_AGENT_NAME, "using", MODEL_NAME, "model with temperature", TEMPERATURE)

  return streamText({
    model: google(MODEL_NAME),
    system: SYSTEM_PROMPT,
    maxSteps: MAX_STEPS,
    temperature: TEMPERATURE,
    messages,
    tools,
    toolChoice: 'auto',
    onFinish() {
      dataStream.writeMessageAnnotation({
        agent: TRAFFIC_AGENT_NAME,
        model: MODEL_NAME
      })
    }
  })
}
