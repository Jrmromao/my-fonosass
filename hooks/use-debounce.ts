import { useState, useEffect } from 'react';

/**
 * A custom hook that creates a debounced version of a value.
 *
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set up the timeout
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up on value change or unmount
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}