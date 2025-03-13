"use client"
import { cn } from "@/lib/utils"
import { useChat } from "@ai-sdk/react"
import ChatMessagePanel from "./chat-messages"
import ChatInputPanel from "./chat-input"
import { useToast } from "@/hooks/use-toast"
import { logInfo } from "@/lib/logging"
import { ChatSuggestionType } from "./chat-suggestion"

interface ChatPanelProps extends React.HTMLProps<HTMLElement> {
  apiEndpoint?: string
  suggestions: ChatSuggestionType[]
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  id = "chat-panel", className, apiEndpoint="/api/chat", suggestions, children
}) => {
  const { toast } = useToast()
  const { messages, input, setInput, handleInputChange, handleSubmit,
    setMessages, status, stop } = useChat({
      api: apiEndpoint,
      onFinish: (message, { usage, finishReason }) => {
        logInfo('Finished streaming message:', message);
        logInfo('Token usage:', usage);
        logInfo('Finish reason:', finishReason);
      },
      onError: error => {
        logInfo('Error streaming message:', error);
        setMessages(messages.slice(0, messages.length))
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    })
  const isLoading = status === 'submitted' || status === 'streaming'
  return (
    <main id={id} className={cn("w-full h-full flex justify-between items-start flex-col gap-2 overflow-hidden p-1", className)}>
      <ChatMessagePanel id="chat-message-panel" className="h-full"
        messages={messages} setMessages={setMessages}
        isLoading={isLoading} stop={stop} />
      <ChatInputPanel prompt={input} setPrompt={setInput}
        isLoading={isLoading} suggestions={suggestions}
        handleInputChange={handleInputChange} handleSubmit={handleSubmit} />
    </main>
  )
}

export default ChatPanel;