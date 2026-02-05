import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { FlashcardRenderer } from '../FlashcardRenderer';
import type { FlashcardData } from '../../../api/study.api';

interface FlashcardSceneProps {
  card: FlashcardData;
  isFlipped: boolean;
  canInteract: boolean;
  onFlip: () => void;
}

export const FlashcardScene = ({ card, isFlipped, canInteract, onFlip }: FlashcardSceneProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 mt-16 mb-24 perspective-1000">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateY: 0 }}
        animate={{ opacity: 1, scale: 1, rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, rotateY: { type: "spring", stiffness: 260, damping: 20 } }}
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