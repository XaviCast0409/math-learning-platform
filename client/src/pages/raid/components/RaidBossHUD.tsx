import { motion } from 'framer-motion';
import { Skull } from 'lucide-react';
import type { RaidBossData } from '../../../types/raid.types';

interface Props {
  boss: RaidBossData;
}

export const RaidBossHUD = ({ boss }: Props) => {
  const hpPercent = Math.max(0, (boss.currentHp / boss.maxHp) * 100);

  return (
    <div className="w-full bg-slate-800 p-4 border-b border-slate-700 shadow-md relative z-10">
      <div className="max-w-3xl mx-auto flex items-center gap-4">
        
        {/* Avatar del Boss con animación de golpe */}
        <div className="relative">
          <motion.div 
            key={boss.currentHp} // Se anima cada vez que cambia la HP
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.2 }}
            className="w-16 h-16 bg-red-900 rounded-xl border-2 border-red-500 overflow-hidden shadow-lg flex items-center justify-center"
          >
             {boss.image ? (
                <img src={boss.image} alt={boss.name} className="w-full h-full object-cover" />
             ) : (
                <Skull className="text-red-300 w-8 h-8" />
             )}
          </motion.div>
          {/* Badge de Nivel o Boss */}
          <div className="absolute -bottom-2 -right-2 bg-black text-red-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-500">
             BOSS
          </div>
        </div>

        {/* Barra de Vida */}
        <div className="flex-1">
          <div className="flex justify-between items-end mb-1">
            <h2 className="text-white font-black uppercase tracking-wider text-sm md:text-base">
                {boss.name}
            </h2>
            <span className="text-red-400 font-mono font-bold text-xs">
                {boss.currentHp} / {boss.maxHp} HP
            </span>
          </div>
          
          <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative">
            {/* Fondo barra */}
            <motion.div 
              className="h-full bg-gradient-to-r from-red-600 to-red-500"
              initial={{ width: '100%' }}
              animate={{ width: `${hpPercent}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
            {/* Brillo decorativo */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-10 rounded-t-full" />
          </div>
        </div>
      </div>
    </div>
  );
};