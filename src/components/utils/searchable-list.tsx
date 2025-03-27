import React from "react"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import SelectableList, { SelectableListProps } from "@/components/utils/selectable-list"

interface SearchableListPanelProps<T> extends SelectableListProps<T> {
    searchTerm: string
    setSearchTerm: (searchTerm: string) => void
}

function SearchableListPanel<T>({ id = "search-panel", className,
    items, selectedElement, onSelectionChange, createElementPanel,
    searchTerm, setSearchTerm, getElementKey }: SearchableListPanelProps<T>) {
    return (
        <div id={id} className={cn("flex flex-col h-full gap-1 w-full overflow-hidden", "focus-within:border focus-within:border-primary", className)}>
            <div className="relative flex m-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    aria-label="Search"
                    placeholder="Cerca..."
                    className="pl-8"
                    value={searchTerm}
                    // Use the native onChange event handler to prevent TSC compiler errors
                    {...{
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                            setSearchTerm(e.target.value)
                        },
                    }}
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
                    getElementKey={getElementKey}
                    onSelectionChange={onSelectionChange}
                    selectedElement={selectedElement}
                    createElementPanel={createElementPanel}
                />
            </ScrollArea>
        </div>
    )
}

// function SelectableList({
//     items,
//     selectedItem,
//     onSelectionChange,
//     className,
//     getElementKey,
//     createElementPanel
// }: SelectableListProps) {
//     const [focusedIndex, setFocusedIndex] = React.useState<number>(-1)
//     const focusedElementRef = useRef<any>(null)
    
//     const changeFocusedIndex = (index: number) => {
//         setFocusedIndex(index)
//         // const item = items[index]
//         // if (item) {
//         //     const elementKey = getElementKey(item)
//         //     const selectedElement = window.document.getElementById(elementKey);
//         //     selectedElement?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
//         // }
//     }
//     const changeSelectedIndex = (itemIdx: number) => {
//         const item = items[itemIdx]
//         if (item) {
//             onSelectionChange(item)
//             changeFocusedIndex(itemIdx)
//         }
//     }

//     useEffect(() => {
//         if (focusedElementRef.current) {
//             focusedElementRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
//         }
//     }, [focusedElementRef.current])
//     const handleKeyDown = (e: React.KeyboardEvent) => {
//         const itemCount = items.length

//         switch (e.key) {
//             case "ArrowDown":
//                 e.preventDefault()
//                 changeFocusedIndex(Math.min(focusedIndex + 1, itemCount - 1))
//                 break
//             case "ArrowUp":
//                 e.preventDefault()
//                 changeFocusedIndex(Math.max(focusedIndex - 1, 0))
//                 break
//             case "Home":
//                 e.preventDefault()
//                 changeFocusedIndex(0)
//                 break
//             case "End":
//                 e.preventDefault()
//                 setFocusedIndex(itemCount - 1)
//                 break
//             case "Enter":
//             case " ": // Space
//                 e.preventDefault()
//                 changeSelectedIndex(focusedIndex)
//                 break
//         }
//     }

//     return (
//         <div className="flex flex-col gap-1.5">
//             <ul
//                 role="listbox"
//                 aria-labelledby="list-label"
//                 aria-multiselectable="false"
//                 tabIndex={0}
//                 aria-activedescendant={focusedIndex >= 0 ? `option-${focusedIndex}` : undefined}
//                 className={cn(
//                     "flex flex-col gap-1 bg-background p-1 outline-none",
//                     className,
//                 )}
//                 onKeyDown={handleKeyDown}
//                 // onBlur={() => setFocusedIndex(-1)}
//             >
//                 {items.map((item, index) => {
//                     const isSelected = getElementKey(selectedItem) === getElementKey(item)
//                     const isFocused = index === focusedIndex
//                     const key = getElementKey(item)
//                     return (
//                         <li
//                             key={index}
//                             ref={isFocused ? focusedElementRef : undefined}
//                             id={`${key}`}
//                             role="option"
//                             aria-selected={isSelected}
//                             data-focused={isFocused}
//                             data-selected={isSelected}
//                             className={cn(
//                                 "flex flex-col cursor-pointer items-center justify-between rounded-md text-sm transition-colors",
//                                 isSelected && "bg-primary text-primary-foreground",
//                                 !isSelected && isFocused && "bg-accent text-accent-foreground",
//                                 !isSelected && !isFocused && "hover:bg-accent hover:text-accent-foreground",
//                                 isFocused && "border border-primary"
//                             )}
//                             onClick={() => changeSelectedIndex(index)}
//                         >
//                             {createElementPanel(item)}
//                             { index < items.length - 1 && <hr className="w-full" />}
//                         </li>
//                     )
//                 })}
//             </ul>
//         </div>
//     )
// }


export default SearchableListPanel;
