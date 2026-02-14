import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { FlashcardRenderer } from '../FlashcardRenderer';
import type { FlashcardData } from '../../api/study.api';

interface FlashcardSceneProps {
  card: FlashcardData;
  isFlipped: boolean;
  canInteract: boolean;
  onFlip: () => void;
  isExiting?: boolean;
}

export const FlashcardScene = ({ card, isFlipped, canInteract, onFlip, isExiting = false }: FlashcardSceneProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 mt-16 mb-24 perspective-1000">
      <motion.div
        key={card.id} // Force re-render on card change
        initial={{ opacity: 0, x: 300, scale: 0.9, rotateY: 0 }}
        animate={{
          opacity: isExiting ? 0 : 1,
          x: isExiting ? -300 : 0,
          scale: isExiting ? 0.8 : 1,
          rotateY: isFlipped ? 180 : 0
        }}
        transition={{
          duration: 0.4,
          rotateY: { type: "spring", stiffness: 260, damping: 20 },
          x: { type: "spring", stiffness: 100, damping: 20 }
        }}
        className={clsx(
          "relative w-full max-w-sm aspect-[3/4] transform-style-3d",
          canInteract ? "cursor-pointer" : "cursor-wait"
        )}
        onClick={() => canInteract && onFlip()}
      >
        {/* Front */}
        <div className="absolute inset-0 bg-white rounded-3xl shadow-xl border-b-4 border-gray-200 backface-hidden overflow-hidden">
          <FlashcardRenderer content={card.front} type="front" />
        </div>
        {/* Back */}
        <div className="absolute inset-0 bg-white rounded-3xl shadow-xl border-b-4 border-gray-200 backface-hidden overflow-hidden rotate-y-180">
          <FlashcardRenderer content={card.back} type="back" />
        </div>
      </motion.div>
    </div>
  );
};
