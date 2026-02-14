import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../common/Button';
import { Gift, Heart, Zap } from 'lucide-react';
import Confetti from 'react-confetti';

interface LevelUpModalProps {
  rewards?: {
    gems: number;
    lives: number;
    items: string[];
    previousLevel?: number;
    currentLevel?: number;
  };
  onClose: () => void;
}

export const LevelUpModal = ({ rewards, onClose }: LevelUpModalProps) => {
  // Estado para window size
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sonido de victoria al montar
  useEffect(() => {
    const audio = new Audio('/assets/sounds/levelup.mp3'); // Asegúrate de tener este archivo o usa uno genérico
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed', e));
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Confetti en toda la pantalla */}
      <div className="fixed inset-0 pointer-events-none z-[90]">
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} gravity={0.15} />
      </div>

      {/* Backdrop oscuro */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 100 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.5, opacity: 0, y: -100 }}
        className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-[110] shadow-2xl border-4 border-brand-yellow text-center overflow-hidden"
      >
        {/* Rayos de luz girando (Fondo animado) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-yellow-200 to-yellow-100 opacity-30 rounded-full animate-spin-slow pointer-events-none"
            style={{ animationDuration: '10s' }} />
        </div>

        <div className="relative z-10 -mt-12 mb-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-60 rounded-full animate-pulse"></div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Zap size={100} className="text-brand-yellow fill-brand-yellow drop-shadow-2xl stroke-[3]" />
            </motion.div>
          </div>
        </div>

        <h2 className="relative z-10 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-500 to-orange-600 mb-2 uppercase tracking-tight drop-shadow-sm">
          ¡Nivel Subido!
        </h2>

        <p className="relative z-10 text-gray-500 font-medium mb-8 text-sm px-4">
          {(rewards?.gems || rewards?.lives || (rewards?.items && rewards.items.length > 0))
            ? '¡Increíble! Has alcanzado un nuevo nivel de maestría.'
            : 'Felicidades por tu progreso. ¡Sigue así!'}
        </p>

        {/* Lista de Recompensas */}
        <div className="relative z-10 space-y-3 mb-8">
          {rewards?.gems ? (
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-2xl flex items-center justify-between border border-blue-200 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-inner text-2xl">💎</div>
                <span className="font-bold text-gray-700">Gemas</span>
              </div>
              <span className="font-black text-brand-blue text-xl">+{rewards.gems}</span>
            </motion.div>
          ) : null}

          {rewards?.lives ? (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-2xl flex items-center justify-between border border-red-200 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-inner">
                  <Heart className="text-brand-red fill-brand-red" size={24} />
                </div>
                <span className="font-bold text-gray-700">Vidas Extra</span>
              </div>
              <span className="font-black text-brand-red text-xl">FULL</span>
            </motion.div>
          ) : null}

          {/* Bonus por Items */}
          {rewards?.items && rewards.items.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-2xl flex items-center gap-3 border border-purple-200 shadow-sm"
            >
              <Gift className="text-purple-600" size={24} />
              <span className="font-bold text-purple-700">¡Nuevo Item Desbloqueado!</span>
            </motion.div>
          )}
        </div>

        <div className="relative z-10">
          <Button onClick={onClose} className="w-full bg-brand-yellow hover:bg-yellow-400 text-yellow-900 border-b-4 border-yellow-600 active:border-b-0 py-4 text-lg font-black tracking-widest transition-all shadow-xl hover:shadow-yellow-200/50 hover:-translate-y-1 active:translate-y-0">
            {(rewards?.gems || rewards?.lives || (rewards?.items && rewards.items.length > 0)) ? '¡RECLAMAR!' : '¡CONTINUAR!'}
          </Button>
        </div>

      </motion.div>
    </div>
  );
};
