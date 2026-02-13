import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import { ConfirmModal, type ConfirmOptions } from '../components/common/ConfirmModal';

interface ConfirmContextType {
    confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [options, setOptions] = useState<ConfirmOptions>({});
    const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((msg: string, opts: ConfirmOptions = {}) => {
        setMessage(msg);
        setOptions(opts);
        setIsOpen(true);

        return new Promise<boolean>((resolve) => {
            setResolveRef(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        if (resolveRef) resolveRef(true);
        setIsOpen(false);
    };

    const handleCancel = () => {
        if (resolveRef) resolveRef(false);
        setIsOpen(false);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmModal
                isOpen={isOpen}
                message={message}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                options={options}
            />
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm debe usarse dentro de un ConfirmProvider');
    }
    return context;
};
