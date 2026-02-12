import { useCallback } from 'react';
import { clsx } from 'clsx';

export const useMapLayout = () => {
    // Lógica para el "Zig Zag" (Snake Layout)
    const getPositionClasses = useCallback((idx: number) => {
        const offsetClass = idx % 2 === 0 ? '-translate-x-8' : 'translate-x-8';
        const connectorClass = idx % 2 === 0 ? "left-full -ml-2" : "right-full -mr-2";

        return {
            container: clsx("relative transition-transform duration-300", offsetClass),
            connector: clsx(
                "absolute top-1/2 w-10 h-3 bg-gray-200 -z-10 rounded-full",
                connectorClass
            )
        };
    }, []);

    return { getPositionClasses };
};
