import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    activeEmote: { text: string, userId: number } | null;
    currentUserId?: number;
}

export const FloatingEmotes = ({ activeEmote, currentUserId }: Props) => {
    return (
        <AnimatePresence>
            {activeEmote && (
                <motion.div
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className={`fixed z-50 text-6xl pointer-events-none drop-shadow-2xl ${
                        activeEmote.userId === currentUserId ? 'bottom-28 left-8' : 'top-20 right-8'
                    }`}
                >
                    {activeEmote.text}
                </motion.div>
            )}
        </AnimatePresence>
    );
};