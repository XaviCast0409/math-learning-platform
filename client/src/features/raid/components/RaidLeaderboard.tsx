import { Trophy } from 'lucide-react';

interface Props {
  data: { username: string; totalDamage: number }[];
}

export const RaidLeaderboard = ({ data }: Props) => {
  // Si no hay datos, no mostramos nada para no ensuciar la UI
  if (!data || data.length === 0) return null;

  return (
    <div className="absolute top-20 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl z-30 w-56 shadow-2xl hidden md:block animate-in fade-in slide-in-from-right-8 duration-700">
      
      {/* Header del Leaderboard */}
      <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
        <Trophy size={16} className="text-yellow-400" />
        <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
            Tabla de Daño
        </span>
      </div>

      {/* Lista de Jugadores */}
      <div className="space-y-3">
        {data.map((player, idx) => {
            // Lógica para colores de medallas
            let badgeClass = "bg-slate-700 text-slate-300"; // Puesto 4+
            if (idx === 0) badgeClass = "bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.4)]"; // Oro
            if (idx === 1) badgeClass = "bg-slate-300 text-black shadow-[0_0_10px_rgba(203,213,225,0.4)]"; // Plata
            if (idx === 2) badgeClass = "bg-orange-600 text-white shadow-[0_0_10px_rgba(234,88,12,0.4)]"; // Bronce

            return (
              <div key={idx} className="flex justify-between items-center text-xs group">
                <div className="flex items-center gap-3 overflow-hidden">
                   {/* Badge del Ranking */}
                   <span className={`flex items-center justify-center w-5 h-5 rounded font-black text-[10px] shrink-0 ${badgeClass}`}>
                       {idx + 1}
                   </span>
                   {/* Nombre del Usuario */}
                   <span className="text-slate-200 font-bold truncate group-hover:text-white transition-colors">
                       {player.username}
                   </span>
                </div>
                {/* Daño Total */}
                <span className="font-mono text-yellow-500 font-bold tabular-nums">
                    {player.totalDamage}
                </span>
              </div>
            );
        })}
      </div>
    </div>
  );
};