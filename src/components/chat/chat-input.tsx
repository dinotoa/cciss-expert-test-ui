"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageModelUsage } from "ai";
import { Loader2, Send, Trash2 } from "lucide-react";
import { Textarea } from "../ui/textarea";
import ChatSuggestion, { ChatSuggestionType } from "./chat-suggestion";
import ChatRecents from "./chat-history";
import { useLocalStorageStack } from "@/hooks/local-storage";

type ChatInputProps = React.HTMLProps<HTMLElement> & {
  isLoading: boolean
  toolCallsPending: boolean
  usage: LanguageModelUsage | undefined
  prompt: string
  historyKey: string
  suggestions: ChatSuggestionType[]
  stop: () => void,
  setPrompt: React.Dispatch<React.SetStateAction<string>>
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void,
}

const ChatInputPanel: React.FC<ChatInputProps> = ({ id = "chat-input-panel",
  className, isLoading, toolCallsPending, usage, stop,
  prompt, setPrompt, handleInputChange, handleSubmit, suggestions, historyKey }) => {
  const [suggestionOpen, setSuggestionOpen] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const areaRef = React.useRef<HTMLTextAreaElement>(null)
  const setSuggestionOpenAndFocus: React.Dispatch<React.SetStateAction<boolean>> = (open) => {
    setSuggestionOpen(open)
    setHistoryOpen(false)
    if (!open) {
      areaRef.current?.focus()
    }
  }
  const setHistoryOpenAndFocus: React.Dispatch<React.SetStateAction<boolean>> = (open) => {
    setHistoryOpen(open)
    setSuggestionOpen(false)
    if (!open) {
      areaRef.current?.focus()
    }
  }
  const { values, pushValue, clearStack } = useLocalStorageStack<string>(historyKey, 20, (a, b) => a.localeCompare(b) === 0)
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => { if (prompt.trim().length > 0) { pushValue(prompt); handleSubmit(e) }}
  return (
    <div id={id} className={cn("flex flex-col gap-2 w-full p-1", className)}>
      <form className="flex flex-row justify-between gap-2 w-full" onSubmit={onSubmit}>
        <div className="flex gap-1 flex-col w-full rounded ring ring-neutral-100 focus-within:ring-1 focus-within:ring-ring p-2">
          <Textarea ref={areaRef} disabled={isLoading}
            className="w-full resize-none"
            rows={4}
            value={prompt}
            autoFocus={true}
            spellCheck={true}
            placeholder="Inserire la richiesta, e premere invio"
            // Use the native onChange event handler
            {...{
              onChange: handleInputChange
            }}
            onKeyDown={e => {
              if (!isLoading && (e.key === 'Enter') && !e.shiftKey && ("form" in e.target)) {
                e.preventDefault();
                (e.target.form as HTMLFormElement).requestSubmit();
              }
            }}
          />
          <div className="w-full flex flex-row justify-between items-center gap-1">
            <div className="flex p-0 m-0 gap-1 justify-start items-center w-full">
              <ChatSuggestion suggestions={suggestions}
                open={suggestionOpen} setOpen={setSuggestionOpenAndFocus} setPrompt={setPrompt} />
              <ChatRecents values={values} clearStack={clearStack}
                open={historyOpen} setOpen={setHistoryOpenAndFocus} setPrompt={setPrompt} />
              <Button type="button" variant="outline" onClick={() => setPrompt("")}>
                <Trash2 />Cancella
              </Button>
              {usage &&
                <div className="text-sm w-full">
                  <span className="font-normal">Token: {usage.totalTokens}</span>
                  <span className="font-light"> (prompt: {usage.promptTokens}, completion: {usage.completionTokens})
                  </span>
                </div>
              }
            </div>
            {isLoading
              ? <Button variant="outline" type="button" onClick={stop}>
                <Loader2 className="animate-spin h-4 w-4" />Stop
              </Button>
              : <Button type="submit" variant="default" disabled={toolCallsPending || prompt.trim().length === 0} ><Send />Invia</Button>
            }
          </div>
        </div>
      </form>
    </div>
  )
}

export default ChatInputPanel