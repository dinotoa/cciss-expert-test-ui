"use client"

import { useState, useEffect } from "react"

/**
 * A hook that provides a stack-like interface to localStorage
 * @param key The localStorage key to use
 * @param maxElements Maximum number of elements to store
 * @returns Object containing stack operations
 */
export function useLocalStorageStack<T>(key: string, maxElements = 10, compareFn?: (a: T, b: T) => boolean) {
    // Initialize state from localStorage or empty array
    const [values, setValues] = useState<T[]>(() => {
        // Only run in browser environment
        if (typeof window !== "undefined") {
            const storedValues = localStorage.getItem(key)
            return storedValues ? JSON.parse(storedValues) : []
        }
        return []
    })

    // Update localStorage when values change
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(values))
    }, [key, values])

    /**
     * Add a value to the top of the stack
     * If stack exceeds maxElements, remove the oldest value
     */
    const pushValue = (value: T) => {
        setValues((prevValues) => {
            if (compareFn) {
                const filteredPrevValues = prevValues.filter((prevValue) => !compareFn(prevValue, value))
                const newValues = [value, ...filteredPrevValues]
                return newValues.slice(0, maxElements)
            }
            const newValues = [value, ...prevValues]
            // If we exceed maxElements, trim the array
            return newValues.slice(0, maxElements)
        })
    }

    /**
     * Clear all values from the stack
     */
    const clearStack = () => {
        setValues([])
    }

    const deleteEntry = (index: number) => {
        const newValues = [...values]
        newValues.splice(index, 1)
        setValues(newValues)
    }

    return {
        values,
        pushValue,
        deleteEntry,
        clearStack,
    }
}

