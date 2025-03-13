import { DataStreamWriter, Message, streamText, StreamTextResult, ToolSet } from 'ai'
import { logInfo } from '@/lib/logging'
import { google } from '@ai-sdk/google'
import { LOCATIONDB_AGENT_NAME } from '../ai-library'
import tools from './locationdb-tools'
import config from "./locationdb-agent.config.json"


const AGENT_NAME = `${LOCATIONDB_AGENT_NAME}:`
const MAX_STEPS = config.maxSteps || 5
const TEMPERATURE = config.temperature || 0.0
const MODEL_NAME = config.modelName || "gemini-2.0-flash"
const SYSTEM_PROMPT = config.prompt?.join("\n") ??
  "Rispondi sempre: L'assistente non è correttamente configurato. Contattare il supporto tecnico"

export async function locationDbAgent(dataStream: DataStreamWriter, messages: Message[]) {
  logInfo(AGENT_NAME, "using", MODEL_NAME, "model with temperature", TEMPERATURE)

  return streamText({
    model: google(MODEL_NAME),
    system: SYSTEM_PROMPT,
    maxSteps: MAX_STEPS,
    temperature: TEMPERATURE,
    messages,
    tools,
    onFinish() {
      dataStream.writeMessageAnnotation({
        agent: AGENT_NAME,
        model: MODEL_NAME
      })
    }
  })
}
