import { motion } from 'framer-motion';
import { Skull, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import type { RaidBossData } from '../../../types/raid.types'; // Ajusta ruta

interface Props {
  bossData: RaidBossData;
  timeLeft: string;
}

export const RaidHUD = ({ bossData, timeLeft }: Props) => {
  const hpPercentage = Math.max(0, (bossData.currentHp / bossData.maxHp) * 100);

  return (
    <div className="relative z-20 pt-4 px-4 pb-2">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-end justify-between mb-2 px-1">
          {/* Info Boss */}
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg border border-red-500/50">
              <Skull size={20} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-xs leading-none text-slate-400 uppercase tracking-widest mb-1">Raid Boss</h3>
              <p className="font-black text-xl leading-none text-white drop-shadow-md tracking-tight">{bossData.name}</p>
            </div>
          </div>

          {/* Timer y HP */}
          <div className="text-right flex flex-col items-end">
            <div className={clsx(
              "flex items-center gap-2 font-mono text-xl font-black mb-1 transition-colors duration-300",
              timeLeft.startsWith("00") ? "text-red-500 animate-pulse" : "text-yellow-400"
            )}>
              <Clock size={18} strokeWidth={3} />
              <span>{timeLeft}</span>
            </div>
            <div className="text-2xl font-black tabular-nums tracking-tight leading-none">
              {bossData.currentHp} <span className="text-xs text-gray-500 font-bold">HP</span>
            </div>
          </div>
        </div>

        {/* Barra de Vida */}
        <div className="h-6 bg-slate-950 rounded-lg overflow-hidden border border-slate-700 shadow-inner relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500 relative"
            initial={{ width: '100%' }}
            animate={{ width: `${hpPercentage}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
             <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 shadow-[0_0_15px_white]" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};