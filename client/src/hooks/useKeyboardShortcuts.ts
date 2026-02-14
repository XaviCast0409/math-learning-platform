import { useEffect } from 'react';

/**
 * Custom hook for keyboard shortcuts
 * @param shortcuts - Object mapping keys to handler functions
 * @param enabled - Whether shortcuts are active
 */
export const useKeyboardShortcuts = (
    shortcuts: Record<string, () => void>,
    enabled = true
) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input/textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const handler = shortcuts[e.key];
            if (handler) {
                e.preventDefault();
                handler();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [shortcuts, enabled]);
};
