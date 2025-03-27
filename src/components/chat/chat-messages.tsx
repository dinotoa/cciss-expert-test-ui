import { useEffect, useRef } from "react"
import { Message } from "ai/react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import ChatResponsePanel from "@/components/chat/chat-response"
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom"

type ChatProps = React.HTMLProps<HTMLElement> & {
  isLoading: boolean,
  messages: Message[]
  setMessages: (m: Message[]) => void
  addToolResult: ({ toolCallId, result, }: {
    toolCallId: string;
    result: any;
  }) => void
}

const ChatMessagePanel: React.FC<ChatProps> = ({ id = "chat-message-panel", className, isLoading, messages, setMessages, addToolResult }) => {
  const deleteMessage = (index: number) => {
    setMessages(messages.filter((_, idx) => (idx !== index) && (idx !== index - 1)));
  }
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLUListElement, HTMLDivElement>();
  const lastElementRef = useRef<HTMLDivElement>(null);
  return (
    <ScrollArea id={id} autoFocus={true} className={cn("flex flex-col gap-2 w-full h-full overflow-y-auto p-2 rounded", className)}>
      <ul ref={messagesContainerRef}>
        {messages.map((message, index) => (
          <li key={message.id} id={message.id}>
            <ChatResponsePanel message={message} isLoading={isLoading && index === messages.length - 1}
              deleteMessage={() => deleteMessage(index)} addToolResult={addToolResult} />
            <hr className="w-full pb-3" />
          </li>
        ))}
      </ul>
      <div id="last-scroll-area-element" ref={messagesEndRef}/>
    </ScrollArea>
  )
}

export default ChatMessagePanel