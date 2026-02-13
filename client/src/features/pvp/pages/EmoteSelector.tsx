import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const EMOTES = ['👋', '🤔', '😎', '😭', '😡', '🔥'];

interface EmoteSelectorProps {
  onSendEmote: (emoji: string) => void;
  disabled?: boolean;
}

export const EmoteSelector = ({ onSendEmote, disabled }: EmoteSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (emoji: string) => {
    onSendEmote(emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Botón flotante para abrir menú */}
      <button 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`p-3 rounded-full shadow-retro-sm transition-transform active:scale-95 border-2 border-black ${
            disabled ? 'bg-gray-200 text-gray-400' : 'bg-white text-brand-blue hover:bg-blue-50'
        }`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Menú de Emojis */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            className="absolute bottom-16 left-0 bg-white border-2 border-black p-2 rounded-xl shadow-retro grid grid-cols-3 gap-2 w-48 z-50"
          >
            {EMOTES.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleSelect(emoji)}
                className="text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
