"use client"
import { useState } from "react"
import { LanguageModelUsage } from "ai"
import { useChat } from "@ai-sdk/react"
import { cn } from "@/lib/utils"
import { logInfo } from "@/lib/logging"
import ChatErrorPanel from "./chat-error-panel"
import ChatInputPanel from "./chat-input"
import ChatMessagePanel from "./chat-messages"
import { ChatSuggestionType } from "./chat-suggestion"

interface ChatPanelProps extends React.HTMLProps<HTMLElement> {
  apiEndpoint?: string
  suggestions: ChatSuggestionType[]
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  id = "chat-panel", className, apiEndpoint="/api/chat", suggestions
}) => {
  const { error, messages, input, setInput, handleInputChange, handleSubmit, addToolResult,
    setMessages, status, stop } = useChat({
      api: apiEndpoint,
      onFinish: (message, { usage, finishReason }) => {
        logInfo('Finished streaming message:', message);
        logInfo('Token usage:', usage);
        logInfo('Finish reason:', finishReason);
        setUsage(usage)
      },
    })
  const [usage, setUsage] = useState<LanguageModelUsage>()
  const pendingToolCalls = messages.flatMap(m => m.parts).filter(p => p.type === 'tool-invocation' && p.toolInvocation.state === 'call')
  const isLoading = status === 'submitted' || status === 'streaming'
  return (
    <main id={id} className={cn("w-full h-full flex justify-between items-start flex-col gap-2 overflow-hidden", className)}>
      <ChatMessagePanel id="chat-message-panel" className="h-full"
        messages={messages} setMessages={setMessages}
        isLoading={isLoading} addToolResult={addToolResult} />
      {error && <ChatErrorPanel error={error} />}
      <ChatInputPanel id="user-input-panel" prompt={input} setPrompt={setInput}
        isLoading={isLoading} toolCallsPending={pendingToolCalls.length > 0}
        suggestions={suggestions} usage={usage} stop={stop}
        handleInputChange={handleInputChange} handleSubmit={handleSubmit} />
    </main>
  )
}

export default ChatPanel;