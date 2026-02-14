import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface FloatingXPProps {
    xpAmount: number;
    show: boolean;
    onComplete?: () => void;
}

/**
 * Animated XP reward notification that appears when completing lessons
 * Shows a bouncing, fading "+XP" text with sparkle effects
 */
export const FloatingXP = ({ xpAmount, show, onComplete }: FloatingXPProps) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ scale: 0, y: 0, opacity: 0 }}
                    animate={{
                        scale: [0, 1.2, 1],
                        y: -100,
                        opacity: [0, 1, 1, 0]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 2,
                        times: [0, 0.3, 0.5, 1],
                        ease: "easeOut"
                    }}
                    onAnimationComplete={onComplete}
                    className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
                >
                    <div className="relative">
                        {/* Main XP Text */}
                        <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 text-white px-8 py-4 rounded-2xl border-4 border-yellow-600 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <Sparkles size={32} fill="currentColor" className="animate-pulse" />
                                <span className="font-black text-5xl tracking-wider drop-shadow-lg">
                                    +{xpAmount} XP
                                </span>
                                <Sparkles size={32} fill="currentColor" className="animate-pulse" />
                            </div>
                        </div>

                        {/* Sparkle particles */}
                        <motion.div
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{
                                scale: [0, 1.5, 0],
                                rotate: 360,
                                opacity: [0, 1, 0]
                            }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute -top-8 -left-8 text-yellow-400"
                        >
                            <Sparkles size={24} fill="currentColor" />
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{
                                scale: [0, 1.5, 0],
                                rotate: -360,
                                opacity: [0, 1, 0]
                            }}
                            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                            className="absolute -top-8 -right-8 text-yellow-400"
                        >
                            <Sparkles size={24} fill="currentColor" />
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{
                                scale: [0, 1.5, 0],
                                rotate: 180,
                                opacity: [0, 1, 0]
                            }}
                            transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                            className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-yellow-400"
                        >
                            <Sparkles size={24} fill="currentColor" />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
