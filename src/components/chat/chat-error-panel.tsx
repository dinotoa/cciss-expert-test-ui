import { cn } from "@/lib/utils";
import { Card, CardContent, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

interface ChatErrorPanelProps extends React.HTMLProps<HTMLElement> {
    error: Error;
}

const ChatErrorPanel: React.FC<ChatErrorPanelProps> = ({ id = "chat-error-panel", className, error }) => {
    return (
        <Card id={id} className={cn("w-full border-2 border-red-500 p-2 min-h-20 max-h-40 ", className)}>
            <CardTitle className="text-red-500 mb-2">Errore</CardTitle>
            <CardContent className="flex flex-col h-full justify-between overflow-hidden">
                <ScrollArea id={id} className={cn("w-full h-full overflow-y-auto overflow-x-hidden ", className)}>
                    {error.message}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

export default ChatErrorPanel