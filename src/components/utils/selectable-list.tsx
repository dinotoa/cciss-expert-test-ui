"use client"

import { cn } from "@/lib/utils"
import React, { useRef, useEffect, type KeyboardEvent, useCallback } from "react"

export interface SelectableListProps<T> extends React.HTMLAttributes<HTMLElement> {
    items: T[]
    selectedElement: T | null
    onSelectionChange: (item: T) => void
    getElementKey: (item: T) => string
    createElementPanel: (item: T, isFocused: boolean, isSelected: boolean) => React.ReactNode
    className?: string
    initialFocusKey?: string | null
}

export function SelectableList<T>({
    items,
    selectedElement,
    onSelectionChange,
    getElementKey,
    createElementPanel,
    className = "",
    initialFocusKey = null,
}: SelectableListProps<T>) {
    const selectedKey = selectedElement ? getElementKey(selectedElement) : null
    const [focusedKey, setFocusedKey] = React.useState<string | null>(initialFocusKey || selectedKey)
    const listRef = useRef<HTMLUListElement>(null)
    const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())

    // Track the previous selectedKey to detect external changes
    const prevSelectedKeyRef = useRef<string | null>(selectedKey)

    // Scroll the element into view
    const scrollIntoView = useCallback((key: string) => {
        const element = itemRefs.current.get(key)
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            })
            return true
        }
        return false
    }, [])

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLUListElement>) => {
            const currentIndex = focusedKey ? items.findIndex((item) => getElementKey(item) === focusedKey) : -1

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault()
                    if (currentIndex < items.length - 1) {
                        const nextItem = items[currentIndex + 1]
                        const nextKey = getElementKey(nextItem)
                        setFocusedKey(nextKey)
                        scrollIntoView(nextKey)
                    }
                    break

                case "ArrowUp":
                    e.preventDefault()
                    if (currentIndex > 0) {
                        const prevItem = items[currentIndex - 1]
                        const prevKey = getElementKey(prevItem)
                        setFocusedKey(prevKey)
                        scrollIntoView(prevKey)
                    }
                    break

                case "Home":
                    e.preventDefault()
                    if (items.length > 0) {
                        const firstKey = getElementKey(items[0])
                        setFocusedKey(firstKey)
                        scrollIntoView(firstKey)
                    }
                    break

                case "End":
                    e.preventDefault()
                    if (items.length > 0) {
                        const lastKey = getElementKey(items[items.length - 1])
                        setFocusedKey(lastKey)
                        scrollIntoView(lastKey)
                    }
                    break

                case " ": // Space key
                    e.preventDefault()
                    if (focusedKey) {
                        const focusedItem = items.find((item) => getElementKey(item) === focusedKey)
                        if (focusedItem) {
                            onSelectionChange(focusedItem)
                            // The selection will be handled by the selectedKey effect
                        }
                    }
                    break
            }
        },
        [focusedKey, items, getElementKey, onSelectionChange, scrollIntoView],
    )

    // Set focus to the list when it mounts
    useEffect(() => {
        if (listRef.current) {
            listRef.current.focus()
        }
    }, [])

    // Handle external selectedKey changes and scroll the selected item into view
    useEffect(() => {
        // Only update focused key to match selection when it's initially set or when there's no focus
        if (selectedKey && focusedKey === null) {
            setFocusedKey(selectedKey)
        }

        // Check if this is an external change (not triggered by internal selection)
        const isExternalChange = selectedKey !== prevSelectedKeyRef.current
        prevSelectedKeyRef.current = selectedKey

        if (selectedKey && isExternalChange) {
            // For external changes, we need to be more aggressive with scrolling
            const attemptScroll = () => {
                // Try to scroll immediately
                if (!scrollIntoView(selectedKey)) {
                    // If we couldn't scroll, try again in the next frame
                    requestAnimationFrame(attemptScroll)
                }
            }

            // Start the scroll attempts
            attemptScroll()
        }
    }, [selectedKey, focusedKey, scrollIntoView])

    // Handle internal selection changes (from space key or click)
    const handleSelectionChange = useCallback(
        (item: T) => {
            const key = getElementKey(item)
            onSelectionChange(item)

            // Scroll the selected item into view
            setTimeout(() => {
                scrollIntoView(key)
            }, 0)
        },
        [getElementKey, onSelectionChange, scrollIntoView],
    )

    return (
        <ul
            ref={listRef}
            role="listbox"
            tabIndex={0}
            className={`outline-none ${className}`}
            onKeyDown={handleKeyDown}
            aria-activedescendant={focusedKey ? `option-${focusedKey}` : undefined}
        >
            {items.map((item) => {
                const key = getElementKey(item)
                const isSelected = key === selectedKey
                const isFocused = key === focusedKey

                return (
                    <li
                        key={key}
                        ref={(el) => {
                            if (el) itemRefs.current.set(key, el)
                        }}
                        id={`option-${key}`}
                        role="option"
                        aria-selected={isSelected}
                        tabIndex={-1}
                        className={cn("cursor-pointer p-2 my-1 rounded-md",
                            !isSelected ? "hover:bg-accent hover:text-accent-foreground" : null,
                            isFocused ? "border border-primary" : null,
                            isSelected ? "bg-primary text-primary-foreground" : null,
                        )}
                        onClick={() => {
                            setFocusedKey(key)
                            handleSelectionChange(item)
                        }}
                    >
                        {createElementPanel(item, isFocused, isSelected)}
                    </li>
                )
            })}
        </ul>
    )
}

export default SelectableList