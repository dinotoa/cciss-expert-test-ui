"use client"
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CircleHelp, X } from "lucide-react";
import { useState } from "react";

export interface ChatSuggestionType {
  topic: string
  suggestions: string[]
}

type ChatSuggestionProps = React.HTMLProps<HTMLElement> & {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setPrompt: React.Dispatch<React.SetStateAction<string>>
  suggestions?: ChatSuggestionType[]
}

const ChatSuggestionsPanel: React.FC<ChatSuggestionProps> = ({ id = "chat-suggestion-panel", className,
  open, setOpen, setPrompt, suggestions }) => {
  const isValid = suggestions && Array.isArray(suggestions) && suggestions.length > 0
  const [selectedTopic, setSelectedTopic] = useState(isValid ? suggestions[0].topic : "")
  return isValid && (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" onClick={() => setOpen(!open)}><CircleHelp />Suggerimenti</Button>
      </PopoverTrigger>
      <PopoverContent id={id} className={cn("flex flex-row gap-2 justify-between w-fit  max-w-[100%] z-[1000]", className)}
        align="start"
        side="top"
      >
        <div className="w-fit max-w-[40rem] max-h-[20rem] flex overflow-hidden gap-2">
          <ChatSuggestionTopicPanel suggestions={suggestions}
            className="border-r-2 pr-1"
            selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic} />
          <ChatSuggestionListPanel id={`${id}__suggestions`}
            suggestions={suggestions.find(s => s.topic === selectedTopic)?.suggestions ?? []}
            setOpen={setOpen} setPrompt={setPrompt} />
        </div>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}><X /></Button>
      </PopoverContent>
    </Popover>
  )
}

interface ChatSuggestionTopicProps extends React.HTMLProps<HTMLElement> {
  suggestions: ChatSuggestionType[],
  selectedTopic: string,
  setSelectedTopic: React.Dispatch<React.SetStateAction<string>>
}

const ChatSuggestionTopicPanel: React.FC<ChatSuggestionTopicProps> =
  ({ id = "chat-suggestion-topis-panel", className, suggestions, selectedTopic, setSelectedTopic }) => {
    return (
      <div id={id} className={cn("", className)}>
        <ul className="flex flex-col gap-2 justify-start align-top max-h-[100%] h-fit">
          {suggestions.map((s, idx) =>
            <li key={idx} className="xw-100">
              <Button variant={s.topic === selectedTopic ? "secondary" : "ghost"}
                className="justify-start w-full"
                onClick={e => setSelectedTopic(s.topic)}>
                {s.topic}
              </Button>
            </li>
          )}
        </ul>
      </div>
    )
  }

interface ChatTopicListProps extends React.HTMLProps<HTMLElement> {
  suggestions: string[]
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setPrompt: React.Dispatch<React.SetStateAction<string>>
}

const ChatSuggestionListPanel: React.FC<ChatTopicListProps> = ({ id, className, suggestions, setPrompt, setOpen }) => {
  return (
    <div id={id}
      className={cn("overflow-y-auto flex flex-row flex-wrap gap-2 justify-start items-start h-fit max-h-full", className)}>
      {suggestions?.map((s, idx) =>
        <Button key={idx} onClick={() => {
          setPrompt(s);
          setOpen(false);
        }} type="button" variant="outline">{s}</Button>
      )}
    </div>
  )
}
export default ChatSuggestionsPanel 