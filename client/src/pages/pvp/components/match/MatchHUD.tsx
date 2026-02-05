import { Clock } from 'lucide-react';
import type { MatchStartPayload } from '../../../../types/pvp.types'; // Ajusta la ruta a tus tipos

interface Props {
  myScore: number;
  opponentScore: number;
  gameTimeLeft: number;
  currentQuestionIndex: number;
  matchData: MatchStartPayload; // O define un tipo parcial si prefieres
}

export const MatchHUD = ({ myScore, opponentScore, gameTimeLeft, currentQuestionIndex, matchData }: Props) => {
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 p-4 flex justify-between items-center shadow-md border-b border-slate-700 z-10">
      {/* MI SCORE */}
      <div className="flex flex-col items-start w-1/3">
        <span className="text-xs text-blue-400 font-bold uppercase">Tú</span>
        <span className="text-2xl font-black text-white">{myScore}</span>
        <div className="w-full h-2 bg-slate-700 rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(currentQuestionIndex / matchData.questions.length) * 100}%` }} />
        </div>
      </div>

      {/* TIMER */}
      <div className="flex flex-col items-center">
        <div className={`flex items-center gap-1 font-mono font-bold text-lg ${gameTimeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
           <Clock size={16} />
           {formatTime(gameTimeLeft)}
        </div>
        <span className="text-xs text-slate-500 mt-1">Pregunta {currentQuestionIndex + 1} / {matchData.questions.length}</span>
      </div>

      {/* RIVAL SCORE */}
      <div className="flex flex-col items-end w-1/3">
        <span className="text-xs text-red-400 font-bold uppercase">{matchData.opponent.username}</span>
        <span className="text-2xl font-black text-white">{opponentScore}</span>
        <div className="w-full h-2 bg-slate-700 rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(opponentScore / 100) * 10}%` }} />
        </div>
      </div>
    </div>
  );
};