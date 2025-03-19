import { createDataStreamResponse, DataStreamWriter } from "ai";

export async function getAgentResponse(req: Request, agent: (writer: DataStreamWriter, arg1: any) => any) {
    const jsonReq = await req.json();
    const { messages } = jsonReq;
    return createDataStreamResponse({
      execute: async dataStream => {
        const result = await agent(dataStream, messages)
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
  