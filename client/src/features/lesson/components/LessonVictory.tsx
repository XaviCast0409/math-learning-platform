import { useState, useEffect } from 'react';
import { Trophy, Zap, ArrowRight, Sparkles } from 'lucide-react'; // Sparkles nuevo
import Confetti from 'react-confetti'; 
import { AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { LevelUpModal } from '../../../components/gamification/LevelUpModal';

interface LessonVictoryProps {
  xp: number;
  gems: number;
  lives: number;
  leveledUp?: boolean;
  levelRewards?: { gems: number, lives: number, items: string[] };
  // 👇 NUEVO PROP: Bonos aplicados
  appliedBonuses?: string[]; 
  onContinue: () => void;
}

export const LessonVictory = ({ xp, gems, lives, leveledUp, levelRewards, appliedBonuses, onContinue }: LessonVictoryProps) => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (leveledUp) {
      const timer = setTimeout(() => {
        setShowLevelUp(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [leveledUp]);

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4 relative overflow-hidden">
      <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />

      {/* ... Fondo animado (Igual) ... */}

      <Card className="w-full max-w-sm text-center relative z-10 animate-in zoom-in-95 duration-300">
        
        {/* ... Ícono Trofeo (Igual) ... */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-yellow-200 blur-xl rounded-full opacity-50 animate-pulse"></div>
          <Trophy size={80} className="text-brand-yellow relative z-10 drop-shadow-md rotate-12" fill="currentColor" strokeWidth={1.5}/>
        </div>

        <h1 className="text-3xl font-black text-brand-yellow mb-2 tracking-tight uppercase transform -rotate-2">
          ¡Lección Completada!
        </h1>
        
        {/* 👇 AVISO DE BONOS APLICADOS */}
        {appliedBonuses && appliedBonuses.length > 0 ? (
          <div className="mb-6 flex flex-wrap justify-center gap-2">
             {appliedBonuses.map((bonus, i) => (
               <span key={i} className="bg-purple-100 text-purple-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                  <Sparkles size={10} /> {bonus}
               </span>
             ))}
          </div>
        ) : (
          <p className="text-gray-500 font-medium mb-8">¡Lo hiciste increíble!</p>
        )}

        {/* Grid de Estadísticas */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          
          {/* Tarjeta XP */}
          <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-orange-400 font-bold text-xs uppercase mb-1">Experiencia</span>
            <div className="flex items-center gap-2 text-orange-600 font-black text-2xl">
              <Zap fill="currentColor" size={24} />
              <span>+{xp}</span>
            </div>
          </div>

          {/* Tarjeta Gemas */}
          <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-brand-blue font-bold text-xs uppercase mb-1">Gemas</span>
            <div className="flex items-center gap-2 text-brand-blue font-black text-2xl">
              <div className="text-xl">💎</div>
              <span>+{gems}</span>
            </div>
          </div>

        </div>

        {/* ... Resto (Vidas, Botón Continuar, Modal Nivel) Igual ... */}
        <div className="mb-8 text-sm text-gray-400 font-bold uppercase tracking-widest">
            Terminaste con {lives} {lives === 1 ? 'vida' : 'vidas'} ❤️
        </div>

        <Button className="w-full bg-brand-green" onClick={onContinue} icon={<ArrowRight />}>
          CONTINUAR
        </Button>

      </Card>

      <AnimatePresence>
        {showLevelUp && (<LevelUpModal rewards={levelRewards} onClose={() => setShowLevelUp(false)} />)}
      </AnimatePresence>

    </div>
  );
};

