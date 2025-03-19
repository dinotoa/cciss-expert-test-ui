import { Message, ToolInvocation } from "ai"
import { cn } from "@/lib/utils"
import { logErr, logInfo } from "@/lib/logging"
import { Button } from "../ui/button"

interface ChatToolCallsPanelProps extends React.HTMLProps<HTMLElement> {
  message: Message
  addToolResult: (result: any) => void
}

const ChatToolCallsPanel: React.FC<ChatToolCallsPanelProps> = ({ id = "chat-tool-calls-panel", className, message, addToolResult }) => {
  return <div id={id} className={cn("w-full flex flex-col gap-2", className)}>
    {message.parts?.map(part => (
      part.type === "tool-invocation" && (part.toolInvocation as ToolInvocation).state === "call" ?
        <ToolCallDetailsPanel key={(part.toolInvocation as ToolInvocation).toolCallId}
          id={`$id-${(part.toolInvocation as ToolInvocation).toolCallId}`}
          invocation={part.toolInvocation as ToolInvocation} addToolResult={addToolResult} />
        : null
    ))}
  </div>
}

interface ToolCallDetailsPanelProps extends React.HTMLProps<HTMLElement> {
  invocation: ToolInvocation
  addToolResult: (result: any) => void
}

const ToolCallDetailsPanel: React.FC<ToolCallDetailsPanelProps> = ({ id, className, invocation, addToolResult }) => {
  const toolCallId = invocation.toolCallId

  const toolName = invocation.toolName
  const toolResult = invocation.state === "result" ? invocation.result : null
  const toolParams = invocation.state === "call" ? invocation.args : null
  logInfo(toolName, toolResult)
  switch (toolName) {
    case "locationRequestTool":
      return <div>
        <Button type="button" onClick={() => addToolResult({ toolCallId, "result": ["roma", "parigi"] })}>Roma</Button>
      </div>

    case "locationSelectionTool":
      return <div>
        <ul>
          {toolParams?.locations.map((l: string) => <li>{l}</li>)
          }
        </ul>
        <Button type="button" onClick={() => addToolResult({ toolCallId, "result": "roma" })}>Roma</Button>
      </div>

    default:
      logErr("unexpected tool call", toolName)
    // falls through
  }

  return null
}

export default ChatToolCallsPanel