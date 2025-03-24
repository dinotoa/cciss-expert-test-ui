"use client"
import { History, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ChatHistoryPanelProps = React.HTMLProps<HTMLElement> & {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setPrompt: React.Dispatch<React.SetStateAction<string>>
  values: string[]
  clearStack: () => void
  deleteEntry?: (index: number) => void
}

const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = ({ id = "chat-suggestion-panel", className,
  open, setOpen, setPrompt, values, deleteEntry }) => {
  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" onClick={() => setOpen(!open)}><History />Recenti</Button>
      </PopoverTrigger>
      <PopoverContent id={id} className={cn("flex flex-row gap-2 justify-between w-fit  max-w-[100%] z-[1000]", className)}
        align="start"
        side="top"
      >
        <div className="w-fit max-w-[40rem] max-h-[20rem] flex overflow-hidden gap-2">
          <ChatHistoryListPanel id={`${id}__values`}
            values={values}
            setOpen={setOpen} setPrompt={setPrompt}  deleteEntry={deleteEntry} />
        </div>
        <Button type="button" variant="outline" size="icon" onClick={() => setOpen(false)}><X /></Button>
      </PopoverContent>
    </Popover>
  )
}

interface ChatHistoryListProps extends React.HTMLProps<HTMLElement> {
  values: string[]
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setPrompt: React.Dispatch<React.SetStateAction<string>>
  deleteEntry?: (index: number) => void
}

const ChatHistoryListPanel: React.FC<ChatHistoryListProps> = ({ id, className, values, setPrompt, setOpen, deleteEntry: deleteHistory }) => {
  const isValid = values && Array.isArray(values) && values.length > 0
  return isValid
    ? <ul id={id}
      className={cn("overflow-y-auto flex flex-row flex-wrap gap-2 justify-start items-start h-fit max-h-full", className)}>
      {values?.map((s, idx) =>
        <li key={idx} className="flex justify-start items-center gap-0 border rounded">
          <Button key={idx} onClick={() => {
            setPrompt(s);
            setOpen(false);
          }} type="button" variant="ghost">{s}</Button>
          {deleteHistory && <Button type="button" variant="ghost" size="icon" onClick={() => deleteHistory(idx)}><X /></Button>}
        </li>
      )}
    </ul>
    : <div className="w-64 h-20 flex flex-col justify-center items-center">
      Nessuna ricerca recente
    </div>
}

export default ChatHistoryPanel 