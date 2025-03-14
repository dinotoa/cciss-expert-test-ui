import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { cn } from "@/lib/utils"

interface SearchableListPanelProps extends React.HTMLProps<HTMLElement> {
    searchTerm: string
    setSearchTerm: (searchTerm: string) => void
}

const SearchableListPanel: React.FC<SearchableListPanelProps> = ({ id="search-panel", className,searchTerm, setSearchTerm, children }) => {
    return (
        <div id={id} className={cn("flex flex-col h-full gap-1 w-full overflow-hidden", className)}>
            <div className="relative flex m-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Cerca..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <Button variant="ghost" 
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <ScrollArea className="w-full h-full overflow-auto pr-3 pl-2">
                {children}
            </ScrollArea>
        </div>
    )
}

export default SearchableListPanel