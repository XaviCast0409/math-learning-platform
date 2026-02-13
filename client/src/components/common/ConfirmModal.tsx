import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { Button } from './Button'; // Asumiendo que existe, si no usaré HTML button
import { clsx } from 'clsx';

export interface ConfirmOptions {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'info' | 'success';
}

interface ConfirmModalProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    options: ConfirmOptions;
}

export const ConfirmModal = ({ isOpen, message, onConfirm, onCancel, options }: ConfirmModalProps) => {
    if (!isOpen) return null;

    const title = options.title || '¿Estás seguro?';
    const confirmText = options.confirmText || 'Confirmar';
    const cancelText = options.cancelText || 'Cancelar';
    const variant = options.variant || 'info';

    const isDanger = variant === 'danger';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

                    {/* Backdrop con Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="bg-white w-full max-w-sm rounded-3xl shadow-retro border-4 border-black relative z-10 overflow-hidden"
                    >
                        {/* Header Visual */}
                        <div className={clsx(
                            "h-24 flex items-center justify-center border-b-4 border-black",
                            isDanger ? "bg-red-100" : "bg-blue-100"
                        )}>
                            {isDanger ? (
                                <div className="bg-white p-3 rounded-full border-4 border-black shadow-retro-sm">
                                    <AlertTriangle size={32} className="text-red-500" />
                                </div>
                            ) : (
                                <div className="bg-white p-3 rounded-full border-4 border-black shadow-retro-sm">
                                    <HelpCircle size={32} className="text-brand-blue" />
                                </div>
                            )}
                        </div>

                        <div className="p-6 text-center">
                            <h3 className="text-xl font-black text-gray-800 mb-2 uppercase tracking-tight">{title}</h3>
                            <p className="text-gray-600 font-medium mb-6 leading-relaxed">
                                {message}
                            </p>

                            <div className="flex gap-3 justify-center">
                                <Button
                                    onClick={onCancel}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    {cancelText}
                                </Button>

                                <Button
                                    onClick={onConfirm}
                                    variant={isDanger ? 'danger' : 'primary'}
                                    className="flex-1"
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
