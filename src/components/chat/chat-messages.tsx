import { Message } from "ai/react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import ChatResponsePanel from "@/components/chat/chat-response"
import { useEffect, useRef } from "react"
import { logInfo } from "@/lib/logging"

type ChatProps = React.HTMLProps<HTMLElement> & {
  isLoading: boolean,
  messages: Message[]
  stop: () => void
  setMessages: (m: Message[]) => void
}

const ChatMessagePanel: React.FC<ChatProps> = ({ id = "chat-message-panel", className, stop, isLoading, messages, setMessages }) => {
  const deleteMessage = (index: number) => {
    setMessages(messages.filter((_, idx) => (idx !== index) && (idx !== index - 1)));
  }
  const clipboard = typeof window !== 'undefined' ? navigator.clipboard : undefined;
  const lastElementRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (lastElementRef.current) {
      lastElementRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // Add messages as a dependency
  return (
    <ScrollArea id={id} autoFocus={true} className={cn("flex flex-col gap-2 w-full h-full overflow-y-auto p-2 rounded", className)}>
      <ul>
        {messages.map((message, index) => (
          <li key={message.id} id={message.id} ref={index === messages.length - 1 ? lastElementRef : undefined}>
            <ChatResponsePanel message={message} stop={stop} isLoading={isLoading && index === messages.length - 1}
              copyMessage={() => clipboard?.writeText(message.content)}
              deleteMessage={() => deleteMessage(index)} />
            <hr className="w-full pb-3" />
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}

export default ChatMessagePanel