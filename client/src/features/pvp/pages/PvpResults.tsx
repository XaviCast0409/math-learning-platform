import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Frown, Minus, ArrowRight, Home, Shield, Zap, Coins } from 'lucide-react';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Button } from '../../../components/common/Button';
import { useAuth } from '../../../context/AuthContext';
import type { RewardsDetail } from '../../../types'; // Asegúrate de importar el tipo correcto

interface MatchFinishedPayload {
  winnerId: number | null;
  eloChange: number;
  p1Score: number;
  p2Score: number;
  newEloP1: number;
  newEloP2: number;
  // Estos campos vienen del backend según tu socket.service.ts
  rewardsDetail?: {
    winner: RewardsDetail;
    loser: RewardsDetail;
  };
  // Necesitamos saber quién es P1 y P2 para mostrar el score correcto
  // (Si el backend no lo manda explícitamente en el payload final, lo deduciremos por el winnerId o por lógica de partida)
  // Pero asumiendo que el socket sabe que tú eres el usuario actual:
}

const PvpResults = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [results, setResults] = useState<MatchFinishedPayload | null>(null);
  const hasRefreshedUser = useRef(false);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!state) {
      navigate('/pvp');
      return;
    }

    const payload = state as MatchFinishedPayload;
    setResults(payload);

    // Actualizamos datos del usuario (Gemas, XP, Nivel) al terminar
    if (!hasRefreshedUser.current) {
      if (refreshUser) refreshUser();
      hasRefreshedUser.current = true;
    }

    // Efectos de sonido
    if (user) {
      const isWinner = payload.winnerId === user.id;
      const audioFile = isWinner
        ? '/assets/sounds/victoria.mp4'
        : '/assets/sounds/derrota.mp4';

      const audio = new Audio(audioFile);
      audio.volume = 0.2; // Un poco más alto para que se note
      resultAudioRef.current = audio;

      audio.play().catch(err => console.warn("Error audio:", err));
    }

    return () => {
      if (resultAudioRef.current) {
        resultAudioRef.current.pause();
        resultAudioRef.current.currentTime = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, navigate]);

  if (!results || !user) return null;

  // Lógica de Ganador/Perdedor
  const isWinner = results.winnerId === user.id;
  const isTie = results.winnerId === null;
  const isLoser = !isWinner && !isTie;

  // Diferencia de ELO visual
  const eloDiff = isWinner ? `+${results.eloChange}` : isTie ? '+0' : `-${results.eloChange}`;

  // Extraer mis recompensas específicas
  const myRewards = isWinner
    ? results.rewardsDetail?.winner
    : results.rewardsDetail?.loser;

  // Determinar puntajes (Asumiendo que el cliente sabe si fue P1 o P2 durante el juego, 
  // pero aquí solo tenemos el resultado final. Una forma segura es asumir scores por ganador)
  // Si soy ganador, mi score es el mayor. Si perdí, es el menor.
  // NOTA: Esto asume que gana el que tiene más puntos.
  const myScore = isWinner
    ? Math.max(results.p1Score, results.p2Score)
    : isTie ? results.p1Score // Si es empate son iguales
      : Math.min(results.p1Score, results.p2Score);

  const opponentScore = isWinner
    ? Math.min(results.p1Score, results.p2Score)
    : isTie ? results.p2Score
      : Math.max(results.p1Score, results.p2Score);

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 gap-6 animate-in fade-in zoom-in duration-500">

        {/* ENCABEZADO */}
        <div className="text-center space-y-2 relative">
          {/* Confeti o efectos de fondo para el ganador */}
          {isWinner && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
          )}

          {isWinner && (
            <>
              <div className="relative inline-block mb-2">
                <Trophy size={80} className="text-yellow-500 drop-shadow-lg" />
                <div className="absolute top-0 right-0 animate-ping">✨</div>
              </div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-600 uppercase tracking-tighter">
                ¡Victoria!
              </h1>
              <p className="text-gray-500 font-medium">¡Has dominado la arena!</p>
            </>
          )}

          {isLoser && (
            <>
              <Frown size={80} className="text-gray-300 mx-auto mb-2" />
              <h1 className="text-4xl font-black text-gray-400 uppercase tracking-tighter">Derrota</h1>
              <p className="text-gray-400 font-medium">Sigue practicando para mejorar.</p>
            </>
          )}

          {isTie && (
            <>
              <Minus size={80} className="text-blue-300 mx-auto mb-2" />
              <h1 className="text-4xl font-black text-blue-400 uppercase tracking-tighter">Empate</h1>
              <p className="text-gray-400 font-medium">Un duelo muy reñido.</p>
            </>
          )}
        </div>

        {/* TARJETA DE RESULTADOS */}
        <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 w-full max-w-xs shadow-xl flex flex-col gap-6 relative overflow-hidden">

          {/* Fondo sutil decorativo */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* ELO CHANGE */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Rating ELO</span>
            <div className={`text-2xl font-black flex items-center gap-1 ${isWinner ? 'text-green-500' : isLoser ? 'text-red-500' : 'text-gray-500'}`}>
              {eloDiff}
            </div>
          </div>

          {/* SCOREBOARD */}
          <div className="flex justify-between items-center text-center px-2">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-wider">Tú</p>
              <p className="text-4xl font-black text-brand-blue leading-none">
                {myScore}
              </p>
            </div>
            <div className="text-gray-200 font-black text-2xl italic">VS</div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-wider">Rival</p>
              <p className={`text-4xl font-black leading-none ${isWinner ? 'text-gray-300' : 'text-gray-800'}`}>
                {opponentScore}
              </p>
            </div>
          </div>

          {/* SECCIÓN DE RECOMPENSAS (Solo si ganó algo) */}
          {(myRewards && (myRewards.xp > 0 || myRewards.gems > 0)) && (
            <div className={`p-4 rounded-2xl border ${isWinner ? 'bg-yellow-50 border-yellow-100' : 'bg-gray-50 border-gray-100'} text-center space-y-3`}>

              <p className={`text-[10px] font-black uppercase tracking-widest ${isWinner ? 'text-yellow-600' : 'text-gray-400'}`}>
                Recompensas Obtenidas
              </p>

              {/* Grid de XP y Gemas */}
              <div className="flex justify-center items-center gap-4">
                {/* XP */}
                <div className="flex flex-col items-center">
                  <div className="bg-white p-2 rounded-full shadow-sm mb-1 text-blue-500">
                    <Zap size={16} fill="currentColor" />
                  </div>
                  <span className="font-black text-gray-700">+{myRewards.xp} XP</span>
                </div>

                {/* Gemas (Solo si hay) */}
                {myRewards.gems > 0 && (
                  <div className="flex flex-col items-center animate-bounce-slow">
                    <div className="bg-white p-2 rounded-full shadow-sm mb-1 text-yellow-500">
                      {/* Icono de XaviCoins */}
                      <Coins size={16} fill="currentColor" />
                    </div>
                    <span className="font-black text-yellow-600">+{myRewards.gems}</span>
                  </div>
                )}
              </div>

              {/* Lista de Bonos Aplicados (Clan, Items, etc.) */}
              {myRewards.bonuses && myRewards.bonuses.length > 0 && (
                <div className="pt-2 border-t border-black/5 flex flex-col gap-1 items-center">
                  {myRewards.bonuses.map((bonus, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm border border-gray-100">
                      <Shield size={10} className="text-blue-400" />
                      {bonus}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACCIONES */}
        <div className="w-full max-w-xs space-y-3">
          <Button
            onClick={() => navigate('/pvp')}
            variant="primary"
            className="w-full h-12 text-lg shadow-lg shadow-blue-200"
            icon={<ArrowRight size={20} />}
          >
            Jugar Otra Vez
          </Button>

          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="w-full text-gray-400 hover:text-gray-600"
            icon={<Home size={20} />}
          >
            Volver al Inicio
          </Button>
        </div>

      </div>
    </MainLayout>
  );
};

export default PvpResults;
