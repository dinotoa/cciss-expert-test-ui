import { testAgent } from "@/ai/test-agent/test-agent";
import { getAgentResponse } from "@/lib/ai/agent-server";

export async function POST(req: Request) {
    return getAgentResponse(req, testAgent);
}