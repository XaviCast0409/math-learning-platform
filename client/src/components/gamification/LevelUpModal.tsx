import { motion } from 'framer-motion';
import { Button } from '../common/Button';
import { Gift, Heart, Zap } from 'lucide-react';

interface LevelUpModalProps {
  rewards?: { gems: number; lives: number; items: string[] };
  onClose: () => void;
}

export const LevelUpModal = ({ rewards, onClose }: LevelUpModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop oscuro */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl border-4 border-brand-yellow text-center"
      >
        {/* Decoración de fondo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
             <div className="relative">
                 <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-50 rounded-full animate-pulse"></div>
                 <Zap size={80} className="text-brand-yellow fill-brand-yellow drop-shadow-lg rotate-12" />
             </div>
        </div>

        <h2 className="text-3xl font-black text-gray-800 mt-8 mb-2 uppercase">
          ¡Subiste de Nivel!
        </h2>
        <p className="text-gray-500 font-medium mb-6">
          Tu esfuerzo está dando frutos. ¡Mira lo que ganaste!
        </p>

        {/* Lista de Recompensas */}
        <div className="space-y-3 mb-8">
            {rewards?.gems ? (
                <div className="bg-blue-50 p-3 rounded-xl flex items-center gap-3 border border-blue-100">
                    <span className="text-2xl">💎</span>
                    <span className="font-bold text-brand-blue">+{rewards.gems} Gemas</span>
                </div>
            ) : null}

            {rewards?.lives ? (
                <div className="bg-red-50 p-3 rounded-xl flex items-center gap-3 border border-red-100">
                    <Heart className="text-brand-red fill-brand-red" />
                    <span className="font-bold text-brand-red">Vidas Rellenadas</span>
                </div>
            ) : null}

            {rewards?.items && rewards.items.length > 0 && (
                <div className="bg-purple-50 p-3 rounded-xl flex items-center gap-3 border border-purple-100">
                    <Gift className="text-purple-500" />
                    <span className="font-bold text-purple-600">Nuevo Item Desbloqueado</span>
                </div>
            )}
        </div>

        <Button onClick={onClose} className="w-full bg-brand-yellow hover:bg-yellow-500 text-yellow-900 border-b-4 border-yellow-600">
            GENIAL
        </Button>

      </motion.div>
    </div>
  );
};