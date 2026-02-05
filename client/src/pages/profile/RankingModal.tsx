// src/components/profile/RankingModal.tsx
import { useEffect, useState } from 'react';
import { X, Trophy, Crown, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { rankingApi, type RankingUser } from '../../api/ranking.api';
import { useAuth } from '../../context/AuthContext'; // Tu hook de auth para saber tu ID

interface Props {
  onClose: () => void;
}

export const RankingModal = ({ onClose }: Props) => {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRankInfo, setMyRankInfo] = useState<{ myRank: number } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [globalData, myData] = await Promise.all([
            rankingApi.getGlobal(1), // Traemos la página 1 del top global
            rankingApi.getMyRank()   // Traemos mi posición exacta
        ]);
        setRanking(globalData.ranking);
        setMyRankInfo(myData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Función para obtener icono de posición
  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown size={24} className="text-yellow-500 fill-yellow-200" />; // 1ro
    if (index === 1) return <Shield size={22} className="text-gray-400 fill-gray-200" />;    // 2do
    if (index === 2) return <Shield size={22} className="text-orange-400 fill-orange-200" />; // 3ro
    return <span className="font-black text-gray-400 text-lg">#{index + 1}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="bg-brand-blue p-6 text-center relative shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 p-2 rounded-full">
            <X size={20} strokeWidth={3} />
          </button>
          
          <div className="inline-block bg-white/20 p-3 rounded-2xl mb-2">
            <Trophy size={32} className="text-yellow-300" fill="currentColor" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Clasificación</h2>
          <p className="text-blue-100 text-sm font-bold">
            {myRankInfo ? `Tu posición actual: #${myRankInfo.myRank}` : 'Cargando tu posición...'}
          </p>
        </div>

        {/* Lista Scrollable */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {loading ? (
             <div className="text-center py-10 text-gray-400">Cargando campeones...</div>
          ) : (
            ranking.map((player, index) => {
              const isMe = player.id === user?.id;
              
              return (
                <div 
                  key={player.id}
                  className={clsx(
                    "flex items-center gap-4 p-3 rounded-2xl border-b-4 transition-all",
                    isMe 
                      ? "bg-blue-50 border-brand-blue shadow-sm ring-2 ring-brand-blue/20" 
                      : "bg-white border-gray-100 hover:bg-gray-50"
                  )}
                >
                  {/* Posición */}
                  <div className="w-10 flex justify-center shrink-0">
                    {getRankIcon(index)}
                  </div>

                  {/* Avatar / Inicial */}
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0",
                    index === 0 ? "bg-yellow-400" :
                    index === 1 ? "bg-gray-400" :
                    index === 2 ? "bg-orange-400" : "bg-brand-blue/50"
                  )}>
                    {player.username.charAt(0).toUpperCase()}
                  </div>

                  {/* Info Jugador */}
                  <div className="flex-1 min-w-0">
                    <h3 className={clsx("font-bold truncate leading-tight", isMe ? "text-brand-blue" : "text-gray-700")}>
                      {player.username} {isMe && "(Tú)"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                      <span className="flex items-center gap-1">
                         {player.league?.icon} {player.league?.name}
                      </span>
                    </div>
                  </div>

                  {/* ELO / Puntos */}
                  <div className="text-right shrink-0">
                    <div className="font-black text-gray-800">{player.elo}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">ELO</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer (Botón cerrar) */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black rounded-xl uppercase tracking-widest transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};