
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LevelUpModal } from '../gamification/LevelUpModal';
import { gamificationEvents, type LevelUpPayload } from '../../utils/gamificationEvents';

export const GamificationLayer = () => {
    const [levelUpData, setLevelUpData] = useState<{
        rewards: {
            gems: number;
            lives: number;
            items: string[];
            previousLevel?: number;
            currentLevel?: number;
        };
    } | null>(null);

    useEffect(() => {
        let lastLevelUpTime = 0;

        const unsubscribe = gamificationEvents.subscribe((payload: LevelUpPayload) => {
            const now = Date.now();
            // Debounce de 2 segundos para evitar duplicados en StrictMode o por red
            if (now - lastLevelUpTime < 2000) return;
            lastLevelUpTime = now;

            console.log('🎉 Global Level Up Detected!', payload);

            // Aseguramos que los niveles estén dentro del objeto rewards para el modal
            const mergedRewards = {
                ...(payload.rewards || { gems: 0, lives: 0, items: [] }),
            };

            console.log('🎁 Merged Rewards for Modal:', mergedRewards);
            setLevelUpData({ rewards: mergedRewards });
        });

        return () => unsubscribe();
    }, []);

    return (
        <AnimatePresence>
            {levelUpData && (
                <LevelUpModal
                    rewards={levelUpData.rewards}
                    onClose={() => setLevelUpData(null)}
                />
            )}
        </AnimatePresence>
    );
};
