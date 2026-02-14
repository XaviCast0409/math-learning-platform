import { Clock, X, Trophy } from 'lucide-react';
import { clsx } from 'clsx';

interface StudyHeaderProps {
  secondsElapsed: number;
  isActive: boolean;
  onExit: () => void;
  cardsCompleted: number;
  totalCards: number;
  milestone20Reached: boolean;
}

export const StudyHeader = ({ secondsElapsed, isActive, onExit, cardsCompleted, totalCards, milestone20Reached }: StudyHeaderProps) => {
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalCards > 0 ? (cardsCompleted / totalCards) * 100 : 0;

  // Milestone de 20 minutos
  const secondsTo20Min = Math.max(0, 1200 - secondsElapsed);
  const progress20Min = Math.min(100, (secondsElapsed / 1200) * 100);

  return (
    <div className="absolute top-0 left-0 right-0 p-4 z-20">
      {/* Top Row: Exit button, Timer, Spacer */}
      <div className="flex justify-between items-start mb-3">
        <button
          onClick={onExit}
          className="p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors text-gray-600"
        >
          <X size={24} />
        </button>

        <div className={clsx(
          "flex items-center gap-2 px-5 py-2 rounded-full shadow-sm border transition-colors",
          isActive ? "bg-white/90 border-slate-200" : "bg-gray-200 border-gray-300 opacity-50"
        )}>
          <Clock size={18} className={isActive ? "text-brand-blue" : "text-gray-500"} />
          <span className="font-mono font-bold text-slate-700 text-lg tabular-nums">
            {formatTime(secondsElapsed)}
          </span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto bg-white/90 backdrop-blur rounded-2xl p-3 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Progreso</span>
          <span className="text-sm font-black text-brand-blue">
            {cardsCompleted}/{totalCards} cartas
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-blue to-blue-400 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone Countdown */}
        {!milestone20Reached && secondsElapsed < 1200 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-yellow-600 flex items-center gap-1">
                <Trophy size={14} />
                Bonus 20 min
              </span>
              <span className="text-xs font-black text-yellow-600">
                {formatTime(secondsTo20Min)}
              </span>
            </div>
            <div className="w-full bg-yellow-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${progress20Min}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1 text-center">
              +200 XP +100 💎
            </p>
          </div>
        )}

        {/* Milestone Reached */}
        {milestone20Reached && (
          <div className="mt-3 pt-3 border-t border-yellow-200 bg-yellow-50 -mx-3 -mb-3 px-3 pb-3 rounded-b-2xl">
            <div className="flex items-center justify-center gap-2 text-yellow-700">
              <Trophy size={16} className="animate-bounce" />
              <span className="text-xs font-black">¡Bonus desbloqueado!</span>
              <Trophy size={16} className="animate-bounce" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
