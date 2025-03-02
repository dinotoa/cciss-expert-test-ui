import { mainWebAgent } from '@/ai/web-agent/web-agent';
import { createDataStreamResponse } from 'ai';

export async function POST(req: Request) {
  const jsonReq = await req.json();
  const { messages } = jsonReq;
  return createDataStreamResponse({
    execute: async dataStream => {
      const result = await mainWebAgent(dataStream, messages)
      result?.mergeIntoDataStream(dataStream)
    },
    onError: (error) => {
      if (error instanceof Error) {
        return error.message
      }

      if (typeof error === 'string') {
        return error
      }
      return "unknown error"
    }
  })
}

