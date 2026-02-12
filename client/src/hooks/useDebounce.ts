import { useState, useEffect } from 'react';

/**
 * Hook para debouncing valores (ej: búsqueda en tiempo real)
 * @param value Valor a observar
 * @param delay Retraso en milisegundos (default 500ms)
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Actualizar el valor debounced después del delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cancelar el timeout si el valor cambia (o el componente se desmonta)
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
