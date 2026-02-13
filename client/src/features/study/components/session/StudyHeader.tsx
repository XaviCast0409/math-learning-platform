import { Clock, X } from 'lucide-react';
import { clsx } from 'clsx';

interface StudyHeaderProps {
  secondsElapsed: number;
  isActive: boolean;
  onExit: () => void;
}

export const StudyHeader = ({ secondsElapsed, isActive, onExit }: StudyHeaderProps) => {
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start">
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
  );
};
