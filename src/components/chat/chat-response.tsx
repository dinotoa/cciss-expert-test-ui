import { Button } from "@/components/ui/button"
import MarkdownPanel from "@/components/ui/markdown-panel"
import { cn } from "@/lib/utils"
import { Popover } from "@radix-ui/react-popover"
import { Message } from "ai/react"
import { BotMessageSquare, Loader2, Trash2, User, Volume2 } from "lucide-react"
import React from "react"
import CopyButton from "../utils/copy-button"
import SpeechSynthesisPlayer from "../audio/tts-player"
import { PopoverContent, PopoverTrigger } from "../ui/popover"
import ChatToolCallsPanel from "./chat-tool-calls"
import ChatToolsResultPanel from "./chat-tool-result"

interface MessageDataProps extends React.HTMLProps<HTMLElement> {
  message: Message
}

interface AgentResponseProps extends MessageDataProps {
  message: Message
  deleteMessage: () => void
  addToolResult: (result: any) => void
}

interface ChatMessageProps extends AgentResponseProps {
  isLoading: boolean
}

const ChatResponsePanel: React.FC<ChatMessageProps> = ({ id = "chat-message-panel", className, message,
  isLoading, deleteMessage, addToolResult }) => {
  return isLoading ? null :
    <div key={message.id} className={cn("flex flex-row gap-2 justify-start items-start w-full", className)}>
      <MessageIcon isLoading={isLoading} message={message} />
      {message.role === 'user'
        ? <UserPromptPanel message={message} />
        : <AgentResponsePanel message={message} addToolResult={addToolResult} deleteMessage={deleteMessage} />
      }
    </div>
}

const AgentResponsePanel: React.FC<AgentResponseProps> = ({ id = "agent-response-panel", className,
  message, addToolResult, deleteMessage }) => {
  return <div className="w-full">
    <AgentResultsPanel message={message} />
    <ChatToolsResultPanel message={message} />
    <ChatToolCallsPanel message={message} addToolResult={addToolResult} />
    <MessageToolbar message={message} deleteMessage={deleteMessage} />
  </div>

}

const UserPromptPanel: React.FC<MessageDataProps> = ({ id = "user-prompt-panel", className, message }) => {
  return <div id={id} className={cn("w-full flex justify-between align-baseline", className)}>
    <div className="flex flex-row gap-2 justify-start items-center">
      <p className="w-fit p-2 rounded-md flex-grow-0 bg-accent text-accent-foreground">{message.content}</p>
      <CopyButton value={message.content} />
    </div>
    <p className="flex-grow-0 p-2 text-neutral-500">{message.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
  </div>
}

const AgentResultsPanel: React.FC<MessageDataProps> = ({ id = "agent-results-panel", className, message }) => {
  const [isOpen, setOpen] = React.useState(false)
  return (
    <div id={id} className={cn(className, "flex flex-row gap-3 w-full justify-between items-start", className)}>
      <MarkdownPanel className="w-auto" content={message.content} />
      {message.content?.length ?
        <div className="flex flex-row gap-1 justify-start items-center flex-wrap flex-shrink">
          <Popover open={isOpen} onOpenChange={setOpen} >
            <PopoverTrigger asChild>
              <Button variant={isOpen ? "default" : "outline"} size="icon" onClick={() => setOpen(!isOpen)}><Volume2 /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-[25rem] z-[2000]" side="left">
              <SpeechSynthesisPlayer className="border-0 shadow-none p-0" text={message.content} onClose={() => setOpen(false)} />
            </PopoverContent>
          </Popover>
          <CopyButton value={message.content} />
        </div>
        : null
      }
    </div>
  )
}

interface MessageToolbarProps extends React.HTMLProps<HTMLElement> {
  message: Message
  deleteMessage: () => void
}

const MessageToolbar: React.FC<MessageToolbarProps> = ({ id = "chat-toolbar-panel", className, message, deleteMessage }) => {
  return (
    <div id={id} className={cn("my-2 flex flex-col gap-2 justify-start items-start", className)}>
      <Button type="button" variant="destructive" onClick={deleteMessage}>
        <Trash2 />Elimina
      </Button>
    </div>
  )
}

interface MessageIconProps extends MessageDataProps {
  isLoading: boolean
  message: Message
}

const MessageIcon: React.FC<MessageIconProps> = ({ isLoading, message }) => {
  return isLoading ? <Loader2 className="animate-spin" /> : (message.role === 'user' ? <User /> : <BotMessageSquare />)
}

export default ChatResponsePanel;
