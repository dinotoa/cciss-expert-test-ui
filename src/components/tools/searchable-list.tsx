import React, { useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { cn } from "@/lib/utils"
import { logInfo } from "@/lib/logging"

interface SelectableListProps extends React.HTMLProps<HTMLElement> {
    items: any[]
    onSelectionChanged: (selectedItem: any) => void
    createItemPanel: (item: any) => React.ReactNode
}

interface SearchableListPanelProps extends SelectableListProps {
    searchTerm: string
    setSearchTerm: (searchTerm: string) => void
}

const SearchableListPanel: React.FC<SearchableListPanelProps> = ({ id = "search-panel", className, 
    items, onSelectionChanged, createItemPanel,
    searchTerm, setSearchTerm }) => {
    return (
        <div id={id} className={cn("flex flex-col h-full gap-1 w-full overflow-hidden", className)}>
            <div className="relative flex m-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    aria-label="Search"
                    placeholder="Cerca..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.currentTarget.value)}
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
            <ScrollArea className="w-full h-full overflow-auto">
                <SelectableList
                    items={items}
                    onSelectionChanged={onSelectionChanged}
                    createItemPanel={createItemPanel}
                />
            </ScrollArea>
        </div>
    )
}

function SelectableList({
    items,
    onSelectionChanged,
    className,
    label,
    createItemPanel
}: SelectableListProps) {
    const [focusedIndex, setFocusedIndex] = React.useState<number>(-1)
    const [selectedIndex, setSelectedIndex] = React.useState<number>(-1)

    const handleSelect = (idx: number) => {
        setSelectedIndex(idx)
        setFocusedIndex(idx)
        onSelectionChanged(items[idx])
    }

    useEffect(() => {
        if (focusedIndex >= 0) {
            const selectedElement = window.document.getElementById(`option-${focusedIndex}`);
            selectedElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            logInfo("scrolling to", focusedIndex)
        }
    }, [focusedIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const itemCount = items.length

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                setFocusedIndex((prev) => Math.min(prev + 1, itemCount - 1))
                break
            case "ArrowUp":
                e.preventDefault()
                setFocusedIndex((prev) => Math.max(prev - 1, 0))
                break
            case "Home":
                e.preventDefault()
                setFocusedIndex(0)
                break
            case "End":
                e.preventDefault()
                setFocusedIndex(itemCount - 1)
                break
            case "Enter":
            case " ": // Space
                e.preventDefault()
                if (focusedIndex >= 0) {
                    handleSelect(focusedIndex)
                }
                break
        }
    }

    return (
        <div className="flex flex-col gap-1.5">
            <div id="list-label" className="text-sm font-medium">
                {label}
            </div>
            <ul
                role="listbox"
                aria-labelledby="list-label"
                aria-multiselectable="false"
                tabIndex={0}
                aria-activedescendant={focusedIndex >= 0 ? `option-${focusedIndex}` : undefined}
                className={cn(
                    "flex flex-col gap-1 bg-background p-1 outline-none",
                    className,
                )}
                onKeyDown={handleKeyDown}
                onBlur={() => setFocusedIndex(-1)}
            >
                {items.map((item, index) => {
                    const isSelected = selectedIndex === index
                    const isFocused = index === focusedIndex

                    return (
                        <li
                            key={index}
                            id={`option-${index}`}
                            role="option"
                            aria-selected={isSelected}
                            data-focused={isFocused}
                            data-selected={isSelected}
                            className={cn(
                                "flex cursor-pointer items-center justify-between rounded-sm text-sm transition-colors",
                                isSelected && "bg-primary text-primary-foreground",
                                !isSelected && isFocused && "bg-accent text-accent-foreground",
                                !isSelected && !isFocused && "hover:bg-accent hover:text-accent-foreground".
                                index !== items.length - 1 && "border-b ",
                            )}
                            onClick={() => handleSelect(index)}
                        >
                            {createItemPanel(item)}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}


export default SearchableListPanel
