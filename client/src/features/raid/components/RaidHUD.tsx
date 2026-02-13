import { motion } from 'framer-motion';
import { Skull, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import type { RaidBossData } from '../../../types/raid.types';
import { useEffect, useState } from 'react';

interface Props {
  bossData: RaidBossData;
  timeLeft: string;
  isHurt?: boolean; // 👈 New Prop
}

export const RaidHUD = ({ bossData, timeLeft, isHurt }: Props) => {
  const hpPercentage = Math.max(0, (bossData.currentHp / bossData.maxHp) * 100);

  // Estado para la barra de daño diferido (Yellow Bar)
  const [delayedHp, setDelayedHp] = useState(hpPercentage);

  useEffect(() => {
    // Cuando baja la vida real, esperamos un poco y luego bajamos la barra amarilla
    const timer = setTimeout(() => {
      setDelayedHp(hpPercentage);
    }, 800); // 800ms de delay para ver el "golpe"

    return () => clearTimeout(timer);
  }, [hpPercentage]);

  return (
    <div className="relative z-20 pt-4 px-4 pb-2">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-end justify-between mb-4 px-1">
          {/* Info Boss & Avatar */}
          <div className="flex items-center gap-4">

            {/* Avatar del Boss con Animación "Flotando" + "Hurt" */}
            <div className="relative">
              {bossData.image ? (
                <motion.div
                  animate={isHurt ? {
                    x: [-5, 5, -5, 5, 0],
                    filter: ["brightness(1)", "brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)", "brightness(1)"]
                  } : {
                    y: [0, -8, 0]
                  }}
                  transition={isHurt ? { duration: 0.4 } : {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 rounded-xl overflow-hidden border-2 border-red-500/50 shadow-lg shadow-red-900/50 bg-slate-800"
                >
                  <img
                    src={bossData.image}
                    alt={bossData.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/50 shadow-lg shadow-red-900/50">
                  <Skull size={32} className="text-red-500" />
                </div>
              )}

              {/* Badge de Nivel/Raid */}
              <div className="absolute -bottom-2 -right-2 bg-red-600 text-[10px] font-black px-2 py-0.5 rounded border border-red-400">
                BOSS
              </div>
            </div>

            <div className="flex flex-col justify-end pb-1">
              <h3 className="font-bold text-xs leading-none text-slate-400 uppercase tracking-widest mb-1">
                Raid Boss Event
              </h3>
              <p className="font-black text-2xl leading-none text-white drop-shadow-md tracking-tight">
                {bossData.name}
              </p>
            </div>
          </div>

          {/* Timer y HP Numérico */}
          <div className="text-right flex flex-col items-end pb-1">
            <div className={clsx(
              "flex items-center gap-2 font-mono text-xl font-black mb-1 transition-colors duration-300",
              timeLeft.startsWith("00") ? "text-red-500 animate-pulse" : "text-yellow-400"
            )}>
              <Clock size={18} strokeWidth={3} />
              <span>{timeLeft}</span>
            </div>
            <div className="text-2xl font-black tabular-nums tracking-tight leading-none">
              {bossData.currentHp.toLocaleString()} <span className="text-xs text-gray-500 font-bold">HP</span>
            </div>
          </div>
        </div>

        {/* Barra de Vida "Juicy" (Fighting Game Style) */}
        <div className="h-8 bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl relative">

          {/* Fondo de ruido */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

          {/* 1. Barra Amarilla (Daño Diferido / "Ghost Bar") */}
          <motion.div
            className="absolute top-0 bottom-0 left-0 bg-yellow-400"
            initial={{ width: '100%' }}
            animate={{ width: `${delayedHp}%` }}
            transition={{ ease: "easeOut", duration: 0.5 }}
          />

          {/* 2. Barra Roja (HP Actual) */}
          <motion.div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-700 via-red-600 to-red-500"
            initial={{ width: '100%' }}
            animate={{ width: `${hpPercentage}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Brillo en el borde derecho */}
            <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 shadow-[0_0_10px_white]" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};