"use client"
import { cn } from "@/lib/utils"
import { useChat } from "ai/react"
import ChatMessagePanel from "./chat-messages"
import ChatInputPanel from "./chat-input"
import { useToast } from "@/hooks/use-toast"
import { logInfo } from "@/lib/logging"

const ChatPanel: React.FC<React.HTMLProps<HTMLElement>> = ({
  id = "chat-panel", className
}) => {
  const { toast } = useToast()
  const { messages, input, setInput, handleInputChange, handleSubmit, setMessages, isLoading, stop } = useChat({
    onFinish: (message, { usage, finishReason }) => {
      logInfo('Finished streaming message:', message);
      logInfo('Token usage:', usage);
      logInfo('Finish reason:', finishReason);
    },
    onError: error => {
      setMessages(messages.slice(0, messages.length))
      toast({ title: 'Error', description: error.message, variant: 'destructive'});
    },
  })
  return (
    <main id={id} className={cn("w-full h-full flex justify-between items-start flex-col gap-2 overflow-hidden p-1", className)}>
      <ChatMessagePanel id="chat-message-panel" className="h-full"
        messages={messages} setMessages={setMessages}
        isLoading={isLoading} stop={stop} />
      <ChatInputPanel prompt={input} setPrompt={setInput} 
        isLoading={isLoading}
        handleInputChange={handleInputChange} handleSubmit={handleSubmit} />
    </main>
  )
}

export default ChatPanel;