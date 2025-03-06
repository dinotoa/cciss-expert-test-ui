import React from "react"
import { Message } from "ai/react"
import { cn, markdownToText } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MarkdownPanel } from "@/components/ui/markdown-panel"
import { BotMessageSquare, Files, FileX, User, Volume2 } from "lucide-react"
import { AgentAnnotations, INFO_AGENT_NAME } from "@/ai/library"
import SpeechSynthesisPlayer from "../tools/tts-player"
import { ToolPanel } from "./chat-tools"
import { ToolInvocation, ToolResult, Tool } from "ai"

type ChatMessageProps = React.HTMLProps<HTMLElement> & {
  message: Message
  isLoading: boolean,
  stop: () => void
  copyMessage: () => void
  deleteMessage: () => void
}

const ChatResponsePanel: React.FC<ChatMessageProps> = ({ id = "chat-message-panel", className, message,
  stop, isLoading, copyMessage, deleteMessage }) => {
  return (
    <div key={message.id} className={cn("flex flex-col gap-2 w-full justify-start", className)}>
      <div className="flex flex-row gap-2 justify-start items-center w-full">
        <div>{message.role === 'user' ? <User /> : <BotMessageSquare />}</div>
        <div className="w-full">
          {message.role === 'user'
            ? <UserPromptPanel prompt={message.content} createdAt={message.createdAt?.toDateString()} />
            : <MarkdownPanel content={message.content} />
          }
          {message.parts?.map(part => (
            part.type === "tool-invocation" && (part.toolInvocation as ToolInvocation).state === "result" ?
              <ToolPanel key={(part.toolInvocation as ToolInvocation).toolCallId} className="py-4" 
                response={message.content ?? ""} 
                invocation={part.toolInvocation as ToolInvocation}
                />
              : null
          ))}
          {message.role !== 'user' && <MessageToolbar message={message} isLoading={isLoading} stop={stop}
            copyMessage={copyMessage}
            deleteMessage={deleteMessage} />
          }
        </div>
      </div>
    </div>
  )
}

interface UserPromptPanelProps extends React.HTMLProps<HTMLElement> {
  prompt: string
  createdAt: string | undefined
}

const UserPromptPanel: React.FC<UserPromptPanelProps> = ({ id, className, prompt, createdAt }) => {
  return <div id={id} className={cn("w-100 flex justify-between align-baseline", className)}>
    <p className="w-fit p-2 rounded-md flex-grow-0 bg-neutral-200">{prompt}</p>
    <p className="flex-grow-0 p-2 text-neutral-500">{createdAt}</p>
  </div>
}

const TTS_AGENTS = [INFO_AGENT_NAME]

const MessageToolbar: React.FC<ChatMessageProps> = ({ id = "chat-toolbar-panel", className, message, isLoading, copyMessage, deleteMessage }) => {
  const annotations: AgentAnnotations | undefined = message.annotations && message.annotations[0] ? message.annotations[0] as unknown as AgentAnnotations : undefined;
  const agent = annotations?.agent ?? "-----"
  const [ttsOpen, setTtsOpen] = React.useState(false)
  
  return (
    <div className={cn("flex flex-col gap-2 justify-start items-start px-2 pb-4", className)}>
      {!isLoading && <>
        {ttsOpen &&
          <SpeechSynthesisPlayer text={markdownToText(message.content)} onClose={() => setTtsOpen(false)}/>
        }
        <div className="flex flex-row gap-2 justify-start items-center">
          <Button type="button" variant="outline" onClick={copyMessage}>
            <Files />Copia
          </Button>
          <Button type="button" variant="outline" onClick={deleteMessage}>
            <FileX />Cancella
          </Button>
          {TTS_AGENTS.includes(agent) &&
            <Button type="button" variant="outline" onClick={() => setTtsOpen(!ttsOpen)} >
              <Volume2 />{ttsOpen ? "Chiudi TTS": "Apri TTS"}
            </Button>
          }
        </div>
      </>
      }
    </div>
  )
}
export default ChatResponsePanel;
