import { useState, useEffect } from 'react';

/**
 * Custom hook that persists state to Chrome storage
 * Works like useState but saves/loads from chrome.storage.local
 */
export function usePersistedState<T>(
    key: string,
    defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(defaultValue);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved state on mount
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get([key], (result) => {
                if (result[key] !== undefined) {
                    setState(result[key]);
                }
                setIsLoaded(true);
            });
        } else {
            setIsLoaded(true);
        }
    }, [key]);

    // Save state whenever it changes (but only after initial load)
    useEffect(() => {
        if (isLoaded && typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ [key]: state });
        }
    }, [key, state, isLoaded]);

    return [state, setState];
}

/**
 * Clear all persisted state (useful for a "Clear All" button)
 */
export function clearPersistedState(keys: string[]) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.remove(keys);
    }
}